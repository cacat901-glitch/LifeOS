import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider, type AIMessage } from "@/lib/ai";
import { buildNovusContext } from "@/lib/ai/context";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { fallbackChatReply } from "@/lib/ai/prompts";
import {
  isDecisionQuestion,
  buildDecisionPrompt,
  parseDecision,
  fallbackDecision,
  formatDecision,
  detectCommitment,
  commitmentFollowUp,
} from "@/lib/ai/intelligence";
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

// GET /api/ai/chat — lightweight diagnostic.
// Lets you verify (from a browser) that the agentic action code is actually
// deployed. The OLD chat route has no GET handler and returns 405, so if you
// see this JSON, the new code is live.
export async function GET() {
  let provider = "unknown";
  try {
    provider = getAIProvider().name;
  } catch {
    /* ignore */
  }
  return NextResponse.json({
    ok: true,
    build: "agentic-actions-v2",
    actionsEnabled: true,
    supportedActions: Array.from(KNOWN_ACTION_TYPES),
    provider,
    providerLive: provider !== "fallback",
    note:
      provider === "fallback"
        ? "No AI key detected at runtime — set GROQ_API_KEY in Vercel and redeploy. Without it, Ask Novus cannot extract actions."
        : `AI provider '${provider}' is configured. Ask Novus can perform real actions.`,
  });
}

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

    // Promise Memory — capture commitments said in passing (non-blocking, best-effort).
    await captureCommitment(userId, lastUserMessage);

    // Decision analysis — when the user is weighing a decision, respond with
    // structured reasoning instead of an action.
    if (isDecisionQuestion(lastUserMessage)) {
      const decisionReply = await runDecisionAnalysis(userId, lastUserMessage);
      if (decisionReply) {
        return NextResponse.json({ reply: decisionReply, provider: getAIProvider().name, actions: [] });
      }
    }

    ctx = await buildNovusContext(userId);
    let system = buildAgentSystemPrompt(ctx);

    // Make Novus aware of its own proactive discoveries.
    try {
      const discoveries = await prisma.discovery.findMany({
        where: { userId, isDismissed: false },
        orderBy: { confidence: "desc" },
        take: 3,
      });
      if (discoveries.length) {
        system +=
          "\n\nRECENT DISCOVERIES (patterns you've noticed about this user — reference naturally only if relevant):\n" +
          discoveries.map((d) => `- ${d.title} (${d.confidence}% confident)`).join("\n");
      }
    } catch {
      /* discoveries table may not be synced yet */
    }

    const provider = getAIProvider();
    const raw = await provider.complete(messages, { system, temperature: 0.3, maxTokens: 800, jsonMode: true });

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

/** Capture a passing commitment ("I'll start working out") into Promise Memory. */
async function captureCommitment(userId: string, text: string): Promise<void> {
  try {
    const c = detectCommitment(text);
    if (!c) return;
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 3);
    await prisma.commitment.create({
      data: { userId, text: c.text, relatedModule: c.relatedModule, checkInDate: checkIn, followUp: commitmentFollowUp(c.text) },
    });
  } catch {
    /* commitments table may not be synced yet — ignore */
  }
}

/** Structured decision analysis for advice/decision questions. */
async function runDecisionAnalysis(userId: string, question: string): Promise<string | null> {
  try {
    const deep = await buildDeepContext(userId);
    const provider = getAIProvider();
    let analysis;
    if (provider.isConfigured()) {
      const raw = await provider.complete([{ role: "user", content: buildDecisionPrompt(question, deep) }], {
        temperature: 0.5,
        maxTokens: 900,
        jsonMode: true,
      });
      analysis = parseDecision(raw) || fallbackDecision(question, deep);
    } else {
      analysis = fallbackDecision(question, deep);
    }
    return formatDecision(question, analysis);
  } catch {
    return null;
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
