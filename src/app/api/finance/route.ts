import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/finance  – accounts + transactions + stats
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "overview";
    const accountId = searchParams.get("accountId");
    const months = parseInt(searchParams.get("months") || "1");

    const since = new Date();
    since.setMonth(since.getMonth() - months);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    // ── Accounts ──────────────────────────────────────────
    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    // ── Transactions ──────────────────────────────────────
    const txWhere: any = {
      userId: session.user.id,
      date: { gte: since },
    };
    if (accountId) txWhere.accountId = accountId;

    const transactions = await prisma.financeTransaction.findMany({
      where: txWhere,
      include: { account: { select: { name: true, color: true } } },
      orderBy: { date: "desc" },
      take: 100,
    });

    // ── Stats ─────────────────────────────────────────────
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;

    // Top expense categories
    const categoryMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({ category, amount }));

    // Monthly chart (last 6 months)
    const monthlyChart: { month: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const allTx = await prisma.financeTransaction.findMany({
        where: { userId: session.user.id, date: { gte: monthStart, lte: monthEnd } },
        select: { type: true, amount: true },
      });
      const mIncome = allTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
      const mExpenses = allTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
      monthlyChart.push({ month: label, income: mIncome, expenses: mExpenses });
    }

    // Budgets with spent
    const budgets = await prisma.financeBudget.findMany({
      where: { userId: session.user.id },
    });
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (b) => {
        const spent = await prisma.financeTransaction.aggregate({
          where: {
            userId: session.user.id,
            category: b.category,
            type: "EXPENSE",
            date: { gte: since },
          },
          _sum: { amount: true },
        });
        return { ...b, spent: spent._sum.amount || 0 };
      })
    );

    // Net worth = sum of all account balances
    const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

    return NextResponse.json({
      accounts,
      transactions,
      stats: { income, expenses, net, netWorth, topCategories },
      monthlyChart,
      budgets: budgetsWithSpent,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/finance  – create account, transaction, or budget
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── Create account ────────────────────────────────────
    if (action === "createAccount") {
      const { name, type, currency, balance, color, isDefault } = body;
      if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

      // If default, unset others
      if (isDefault) {
        await prisma.financeAccount.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      const account = await prisma.financeAccount.create({
        data: {
          userId: session.user.id,
          name,
          type: type || "CHECKING",
          currency: currency || "USD",
          balance: balance || 0,
          color: color || "#10b981",
          isDefault: isDefault || false,
        },
      });
      return NextResponse.json(account, { status: 201 });
    }

    // ── Add transaction ────────────────────────────────────
    if (action === "addTransaction") {
      const { accountId, type, amount, title, notes, category, date, recurring, recurringInterval, tags } = body;
      if (!accountId || !amount || !title) {
        return NextResponse.json({ error: "accountId, amount, title required" }, { status: 400 });
      }

      const tx = await prisma.financeTransaction.create({
        data: {
          userId: session.user.id,
          accountId,
          type: type || "EXPENSE",
          amount: Math.abs(amount),
          title,
          notes,
          category: category || "Other",
          date: date ? new Date(date) : new Date(),
          recurring: recurring || false,
          recurringInterval,
          tags: tags || [],
        },
        include: { account: { select: { name: true, color: true } } },
      });

      // Update account balance
      const delta = type === "INCOME" ? Math.abs(amount) : -Math.abs(amount);
      await prisma.financeAccount.update({
        where: { id: accountId },
        data: { balance: { increment: delta } },
      });

      return NextResponse.json(tx, { status: 201 });
    }

    // ── Create / update budget ─────────────────────────────
    if (action === "upsertBudget") {
      const { category, amount, period, color } = body;
      const budget = await prisma.financeBudget.upsert({
        where: { userId_category_period: { userId: session.user.id, category, period: period || "MONTHLY" } },
        update: { amount, color },
        create: {
          userId: session.user.id,
          category,
          amount,
          period: period || "MONTHLY",
          color: color || "#6366f1",
        },
      });
      return NextResponse.json(budget, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/finance  – delete transaction or account
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, id } = await req.json();

    if (action === "deleteTransaction") {
      const tx = await prisma.financeTransaction.findUnique({ where: { id } });
      if (!tx || tx.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      // Reverse balance
      const delta = tx.type === "INCOME" ? -tx.amount : tx.amount;
      await prisma.financeAccount.update({
        where: { id: tx.accountId },
        data: { balance: { increment: delta } },
      });
      await prisma.financeTransaction.delete({ where: { id } });
      return NextResponse.json({ message: "Deleted" });
    }

    if (action === "deleteAccount") {
      await prisma.financeAccount.delete({
        where: { id, userId: session.user.id },
      });
      return NextResponse.json({ message: "Deleted" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
