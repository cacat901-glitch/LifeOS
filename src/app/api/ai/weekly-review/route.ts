import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildWeeklyReviewPrompt, parseWeeklyReview } from "@/lib/ai/generators";
import { generateWeeklyExtras, type PrevWeekStats } from "@/lib/ai/intelligence";

export const dynamic = "force-dynamic";

// GET /api/ai/weekly-review            → generate or return cached review
// GET /api/ai/weekly-review?new=1       → force a fresh review
// GET /api/ai/weekly-review?history=1   → list past reviews
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // History list
    if (searchParams.get("history") === "1") {
      const reports = await prisma.aIReport.findMany({
        where: { userId, type: "WEEKLY_REVIEW" },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({
        reports: reports.map((r) => {
          let parsed: any = null;
          try { parsed = JSON.parse(r.content); } catch { /* ignore */ }
          return { id: r.id, createdAt: r.createdAt, parsed };
        }),
      });
    }

    const forceNew = searchParams.get("new") === "1";

    // Return this week's cached review if present
    if (!forceNew) {
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
      const cached = await prisma.aIReport.findFirst({
        where: { userId, type: "WEEKLY_REVIEW", createdAt: { gte: weekStart } },
        orderBy: { createdAt: "desc" },
      });
      if (cached) {
        return NextResponse.json({ review: safeParse(cached.content), cached: true, createdAt: cached.createdAt });
      }
    }

    // Previous review (for week-over-week comparison)
    let prevStats: PrevWeekStats | null = null;
    try {
      const prev = await prisma.aIReport.findFirst({
        where: { userId, type: "WEEKLY_REVIEW" },
        orderBy: { createdAt: "desc" },
      });
      if (prev) prevStats = safeParse(prev.content)?.stats ?? null;
    } catch { /* ignore */ }

    // Generate
    const ctx = await buildDeepContext(userId);
    const prompt = buildWeeklyReviewPrompt(ctx);
    const provider = getAIProvider();
    let raw = "";
    try {
      raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.75, maxTokens: 1000 });
    } catch (e) {
      console.error("Weekly review AI error:", e);
    }
    const base = parseWeeklyReview(raw, ctx);
    const extras = generateWeeklyExtras(ctx, prevStats);
    const review = { ...base, ...extras };

    await prisma.aIReport.create({
      data: { userId, type: "WEEKLY_REVIEW", content: JSON.stringify(review), date: new Date() },
    });

    return NextResponse.json({ review, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function safeParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}

export async function POST() {
  return NextResponse.json({ error: "Use GET" }, { status: 405 });
}
