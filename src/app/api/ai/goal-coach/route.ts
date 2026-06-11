import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildGoalCoachPrompt, parseGoalCoach } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

// POST /api/ai/goal-coach
// body: { goalTitle, goalDescription?, currentProgress?, goalId? }
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goalTitle, goalDescription, currentProgress = 0, goalId } = await req.json();
    if (!goalTitle) return NextResponse.json({ error: "goalTitle required" }, { status: 400 });

    const ctx = await buildDeepContext(session.user.id);
    const prompt = buildGoalCoachPrompt(goalTitle, goalDescription || "", currentProgress, ctx);
    const provider = getAIProvider();
    let raw = "";
    try { raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.75, maxTokens: 1000 }); }
    catch (e) { console.error("Goal coach AI error:", e); }

    const plan = parseGoalCoach(raw);

    // Save AI insights to the goal
    if (goalId) {
      await prisma.goal.updateMany({
        where: { id: goalId, userId: session.user.id },
        data: { aiInsights: JSON.stringify(plan) },
      });
    }

    return NextResponse.json({ plan });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
