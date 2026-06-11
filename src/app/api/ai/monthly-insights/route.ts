import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildMonthlyInsightsPrompt, parseMonthlyInsights } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const forceNew = searchParams.get("new") === "1";
    const history = searchParams.get("history") === "1";

    // Return history
    if (history) {
      const reports = await prisma.aIReport.findMany({
        where: { userId: session.user.id, type: "MONTHLY_INSIGHTS" },
        orderBy: { createdAt: "desc" },
        take: 12,
      });
      return NextResponse.json({ reports: reports.map(r => ({ ...r, parsed: JSON.parse(r.content) })) });
    }

    // Return cached this month
    if (!forceNew) {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const cached = await prisma.aIReport.findFirst({
        where: { userId: session.user.id, type: "MONTHLY_INSIGHTS", createdAt: { gte: monthStart } },
        orderBy: { createdAt: "desc" },
      });
      if (cached) return NextResponse.json({ insights: JSON.parse(cached.content), cached: true });
    }

    const ctx = await buildDeepContext(session.user.id);
    const prompt = buildMonthlyInsightsPrompt(ctx);
    const provider = getAIProvider();
    let raw = "";
    try { raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.75, maxTokens: 1200 }); }
    catch (e) { console.error("Monthly insights AI error:", e); }

    const insights = parseMonthlyInsights(raw, ctx);
    await prisma.aIReport.create({
      data: { userId: session.user.id, type: "MONTHLY_INSIGHTS", content: JSON.stringify(insights), date: new Date() },
    });
    return NextResponse.json({ insights, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
