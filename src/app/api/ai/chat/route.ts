import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider, type AIMessage } from "@/lib/ai";
import { buildNovusContext } from "@/lib/ai/context";
import { NOVUS_PERSONA, fallbackChatReply } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

// POST /api/ai/chat — Ask Novus
// body: { messages: { role, content }[] }
export async function POST(req: Request) {
  let ctx: Awaited<ReturnType<typeof buildNovusContext>> | null = null;
  let lastUserMessage = "";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = (await req.json()) as { messages: AIMessage[] };
    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }
    lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    // Ground the AI with the user's live context
    ctx = await buildNovusContext(session.user.id);
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
    // Live model unavailable (quota / region / network) — degrade gracefully
    // to Novus's built-in intelligence so the user still gets a useful reply.
    if (ctx) {
      return NextResponse.json({
        reply: fallbackChatReply(lastUserMessage, ctx),
        provider: "fallback",
        degraded: true,
      });
    }
    return NextResponse.json({
      reply: "I couldn't reach my full intelligence right now — give it another try in a moment.",
      provider: "fallback",
      degraded: true,
    });
  }
}
