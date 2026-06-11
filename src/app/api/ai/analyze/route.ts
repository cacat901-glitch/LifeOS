import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildLifeAnalysisPrompt, parseLifeAnalysis } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const forceNew = searchParams.get("new") === "1";

    // Cache: one analysis per week
    if (!forceNew) {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const cached = await prisma.aIReport.findFirst({
        where: { userId: session.user.id, type: "LIFE_ANALYSIS", createdAt: { gte: weekAgo } },
        orderBy: { createdAt: "desc" },
      });
      if (cached) return NextResponse.json({ analysis: JSON.parse(cached.content), cached: true, cachedAt: cached.createdAt });
    }

    const ctx = await buildDeepContext(session.user.id);
    const prompt = buildLifeAnalysisPrompt(ctx);
    const provider = getAIProvider();
    let raw = "";
    try { raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.7, maxTokens: 1500 }); }
    catch (e) { console.error("Life analysis AI error:", e); }

    const analysis = parseLifeAnalysis(raw, ctx);
    await prisma.aIReport.create({
      data: { userId: session.user.id, type: "LIFE_ANALYSIS", content: JSON.stringify(analysis), date: new Date() },
    });
    return NextResponse.json({ analysis, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
