import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { buildNovusContext } from "@/lib/ai/context";

export const dynamic = "force-dynamic";

// GET /api/ai/briefing — the personalized daily narrative
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await buildNovusContext(session.user.id);
    const provider = getAIProvider();
    const briefing = await provider.generateBriefing(ctx);

    return NextResponse.json({
      briefing,
      provider: provider.name,
      context: {
        habits: ctx.habits,
        tasks: ctx.tasks,
        goals: ctx.goals,
        mood: ctx.mood,
        topGoal: ctx.topGoal,
      },
    });
  } catch (error) {
    console.error("Briefing error:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
