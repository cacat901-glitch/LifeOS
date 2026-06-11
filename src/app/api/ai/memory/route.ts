import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildLifeMemoryPrompt } from "@/lib/ai/generators";
import { buildNovusContext } from "@/lib/ai/context";
import { fallbackChatReply } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

// POST /api/ai/memory
// body: { question: string }
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    const ctx = await buildDeepContext(session.user.id);
    const prompt = buildLifeMemoryPrompt(question, ctx);
    const provider = getAIProvider();

    let reply = "";
    try {
      reply = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.7, maxTokens: 500 });
    } catch (e) {
      console.error("Memory AI error:", e);
      const basicCtx = await buildNovusContext(session.user.id);
      reply = fallbackChatReply(question, basicCtx);
    }

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
