import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/habits
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: {
        category: true,
        logs: { where: { date: { gte: todayStart, lte: todayEnd } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(habits);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/habits
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, icon, color, frequency, targetDays, targetCount, categoryId, reminderEnabled, reminderTime } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Free plan limit
    const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
    if (subscription?.plan === "FREE") {
      const count = await prisma.habit.count({ where: { userId: session.user.id, isArchived: false } });
      if (count >= 3) {
        return NextResponse.json(
          { error: "Free plan is limited to 3 habits. Upgrade to Pro for unlimited habits." },
          { status: 403 }
        );
      }
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        description,
        icon: icon || "✅",
        color: color || "#6366f1",
        frequency: frequency || "DAILY",
        targetDays: targetDays || [],
        targetCount: targetCount || 1,
        categoryId,
        reminderEnabled: reminderEnabled || false,
        reminderTime,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/habits - toggle completion with proper date-based streak logic
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { habitId, date, completed } = await req.json();

    const today = date ? new Date(date) : new Date();
    today.setHours(0,0,0,0);

    // Upsert today's log
    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date: today } },
      update: { completed },
      create: { userId: session.user.id, habitId, date: today, completed },
    });

    // Recalculate streak from actual log history (date-based, not increment)
    await recalcStreak(habitId);

    return NextResponse.json(log);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/habits
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { habitId } = await req.json();
    await prisma.habit.update({
      where: { id: habitId, userId: session.user.id },
      data: { isArchived: true, isActive: false },
    });
    return NextResponse.json({ message: "Habit deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Streak recalculation ─────────────────────────────────────────────────────
// Counts consecutive completed days ending today (or yesterday if not yet done today).
async function recalcStreak(habitId: string) {
  const logs = await prisma.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!logs.length) {
    await prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak: 0 },
    });
    return;
  }

  // Deduplicate & normalise to midnight timestamps
  const days = Array.from(new Set(logs.map((l) => {
    const d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime();
  }))).sort((a, b) => b - a);

  const now = new Date(); now.setHours(0,0,0,0);
  const todayTs     = now.getTime();
  const yesterdayTs = todayTs - 86400000;

  // Streak must include today OR yesterday (so it doesn't reset if not yet logged today)
  if (days[0] !== todayTs && days[0] !== yesterdayTs) {
    await prisma.habit.update({ where: { id: habitId }, data: { currentStreak: 0 } });
    return;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 86400000) {
      streak++;
    } else {
      break;
    }
  }

  const habit = await prisma.habit.findUnique({ where: { id: habitId }, select: { longestStreak: true, totalCompletions: true } });
  await prisma.habit.update({
    where: { id: habitId },
    data: {
      currentStreak: streak,
      longestStreak: Math.max(streak, habit?.longestStreak ?? 0),
      // Recalculate totalCompletions from logs
      totalCompletions: await prisma.habitLog.count({ where: { habitId, completed: true } }),
    },
  });
}
