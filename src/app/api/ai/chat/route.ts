import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider, type AIMessage } from "@/lib/ai";
import { buildNovusContext } from "@/lib/ai/context";
import { fallbackChatReply } from "@/lib/ai/prompts";
import {
  buildAgentSystemPrompt,
  parseAgentDecision,
  executeActions,
  describeAction,
  hasDestructive,
  KNOWN_ACTION_TYPES,
  type NovusAction,
  type ActionResult,
} from "@/lib/ai/actions";

export const dynamic = "force-dynamic";

// POST /api/ai/chat — Ask Novus (agentic: can take real actions)
//
// Request shapes:
//   { messages: { role, content }[] }            → reason + (maybe) act
//   { confirmActions: NovusAction[] }             → execute pre-confirmed destructive actions
export async function POST(req: Request) {
  let ctx: Awaited<ReturnType<typeof buildNovusContext>> | null = null;
  let lastUserMessage = "";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = (await req.json()) as {
      messages?: AIMessage[];
      confirmActions?: NovusAction[];
    };

    // ── Confirmation path: the user has approved destructive action(s) ──
    if (Array.isArray(body.confirmActions) && body.confirmActions.length > 0) {
      const actions = sanitizeActions(body.confirmActions);
      if (!actions.length) {
        return NextResponse.json({ error: "No valid actions to execute" }, { status: 400 });
      }
      const results = await executeActions(userId, actions);
      return NextResponse.json({
        reply: composeResultReply("Done.", results),
        executed: true,
        results,
        accountDeleted: results.some((r) => r.type === "delete_account" && r.ok),
      });
    }

    // ── Reasoning path ──────────────────────────────────────────────
    const messages = body.messages;
    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }
    lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    ctx = await buildNovusContext(userId);
    const system = buildAgentSystemPrompt(ctx);

    const provider = getAIProvider();
    const raw = await provider.complete(messages, { system, temperature: 0.4, maxTokens: 800 });

    const decision = parseAgentDecision(raw);

    // Model didn't return a structured decision — treat it as a plain reply.
    if (!decision) {
      return NextResponse.json({
        reply: (raw || "").trim() || fallbackChatReply(lastUserMessage, ctx),
        provider: provider.name,
        actions: [],
      });
    }

    // Pure conversation — no actions requested.
    if (decision.actions.length === 0) {
      return NextResponse.json({ reply: decision.reply, provider: provider.name, actions: [] });
    }

    // Destructive actions require explicit confirmation before anything runs.
    if (hasDestructive(decision.actions)) {
      return NextResponse.json({
        reply: decision.reply,
        provider: provider.name,
        requiresConfirmation: true,
        pendingActions: decision.actions,
        confirmationSummary: decision.actions.map(describeAction),
      });
    }

    // Safe actions — execute immediately and report real results.
    const results = await executeActions(userId, decision.actions);
    return NextResponse.json({
      reply: composeResultReply(decision.reply, results),
      provider: provider.name,
      executed: true,
      results,
      actions: decision.actions,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    if (ctx) {
      return NextResponse.json({
        reply: fallbackChatReply(lastUserMessage, ctx),
        provider: "fallback",
        degraded: true,
        actions: [],
      });
    }
    return NextResponse.json({
      reply: "I couldn't reach my full intelligence right now — give it another try in a moment.",
      provider: "fallback",
      degraded: true,
      actions: [],
    });
  }
}

/** Keep only well-formed, known actions (defense-in-depth for the confirm path). */
function sanitizeActions(actions: NovusAction[]): NovusAction[] {
  return actions
    .filter((a) => a && typeof a.type === "string" && KNOWN_ACTION_TYPES.has(a.type as any))
    .map((a) => ({ ...a }));
}

/**
 * Build the final user-facing reply: lead with the model's friendly message,
 * then surface any failures truthfully (and success summaries when the model
 * gave no lead).
 */
function composeResultReply(lead: string, results: ActionResult[]): string {
  const failures = results.filter((r) => !r.ok);
  const successes = results.filter((r) => r.ok);

  const parts: string[] = [];
  if (lead && lead.trim()) parts.push(lead.trim());

  // If the model gave no meaningful lead, summarise successes explicitly.
  if ((!lead || !lead.trim()) && successes.length) {
    parts.push(successes.map((s) => s.summary).join(" "));
  }

  if (failures.length) {
    parts.push(failures.map((f) => `⚠️ ${f.summary}`).join(" "));
  }

  return parts.join("\n\n") || "Done.";
}
