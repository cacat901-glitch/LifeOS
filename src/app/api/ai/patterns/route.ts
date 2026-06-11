import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildPatternPrompt, parsePatterns, generatePredictiveInsights } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await buildDeepContext(session.user.id);

    // Predictive insights are deterministic (no AI call needed)
    const predictiveInsights = generatePredictiveInsights(ctx);

    // Pattern analysis uses AI
    const prompt = buildPatternPrompt(ctx);
    const provider = getAIProvider();
    let raw = "";
    try { raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.7, maxTokens: 800 }); }
    catch (e) { console.error("Patterns AI error:", e); }
    const patternReport = parsePatterns(raw);

    return NextResponse.json({ patterns: patternReport, predictiveInsights });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
