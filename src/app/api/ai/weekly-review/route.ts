import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildWeeklyReviewPrompt, parseWeeklyReview } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

// GET /api/ai/weekly-review — generate or return cached review
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const forceNew = searchParams.get("new") === "1";

    // Check for a review generated this week
    if (!forceNew) {
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
      const cached = await prisma.aIReport.findFirst({
        where: { userId: session.user.id, type: "WEEKLY_REVIEW", createdAt: { gte: weekStart } },
        orderBy: { createdAt: "desc" },
      });
      if (cached) {
        return NextResponse.json({ review: JSON.parse(cached.content), cached: true, createdAt: cached.createdAt });
      }
    }

    // Generate new review
    const ctx = await buildDeepContext(session.user.id);
    const prompt = buildWeeklyReviewPrompt(ctx);
    const provider = getAIProvider();
    let raw = "";
    try {
      raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.75, maxTokens: 1000 });
    } catch (e) {
      console.error("Weekly review AI error:", e);
    }
    const review = parseWeeklyReview(raw, ctx);

    // Store
    await prisma.aIReport.create({
      data: { userId: session.user.id, type: "WEEKLY_REVIEW", content: JSON.stringify(review), date: new Date() },
    });

    return NextResponse.json({ review, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/ai/weekly-review?history=1 — list past reviews
export async function POST() {
  return NextResponse.json({ error: "Use GET" }, { status: 405 });
}
