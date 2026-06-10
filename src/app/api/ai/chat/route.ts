import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider, type AIMessage } from "@/lib/ai";
import { buildNovusContext } from "@/lib/ai/context";
import { NOVUS_PERSONA } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

// POST /api/ai/chat — Ask Novus
// body: { messages: { role, content }[] }
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = (await req.json()) as { messages: AIMessage[] };
    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Ground the AI with the user's live context
    const ctx = await buildNovusContext(session.user.id);
    const contextBlock = `Here is the current context about the person you're helping (use it only when relevant):
- Name: ${ctx.name}
- Habits today: ${ctx.habits.completedToday}/${ctx.habits.total}, best streak ${ctx.habits.bestStreak}d
- Tasks: ${ctx.tasks.doneToday} done today, ${ctx.tasks.total} open, ${ctx.tasks.overdue} overdue
- Goals: ${ctx.goals.active} active at ${ctx.goals.avgProgress}% avg${ctx.topGoal ? `, top goal "${ctx.topGoal}"` : ""}
${ctx.mood ? `- Mood: ${ctx.mood.label} (${ctx.mood.score}/10)` : ""}`;

    const system = `${NOVUS_PERSONA}\n\n${contextBlock}\n\nAnswer the user's question or request directly and concisely. Be genuinely helpful and motivating.`;

    const provider = getAIProvider();
    const reply = await provider.complete(messages, { system, temperature: 0.8, maxTokens: 800 });

    return NextResponse.json({ reply, provider: provider.name });
  } catch (error: any) {
    console.error("Chat error:", error);
    // Return a graceful message instead of a 500 so the UI can display it
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      error: true,
    });
  }
}
