import type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { NOVUS_PERSONA, fallbackBriefing } from "./prompts";

export type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";

/**
 * Local / no-op provider used when no AI key is configured.
 * Keeps Novus fully functional (deterministic copy) with zero external deps.
 */
class FallbackProvider implements AIProvider {
  readonly name = "fallback";
  isConfigured() { return true; }
  async complete(messages: AIMessage[]): Promise<string> {
    const last = messages.filter((m) => m.role === "user").pop();
    return last
      ? "I'm running in offline mode right now — connect a Gemini API key to unlock the full Novus intelligence. In the meantime, focus on the single most important thing you can move forward today."
      : "";
  }
  async generateBriefing(ctx: NovusContext): Promise<string> {
    return fallbackBriefing(ctx);
  }
}

export type ProviderName = "groq" | "gemini" | "openai" | "claude" | "local";

/**
 * The single entry point the rest of Novus uses.
 *
 * Selection order:
 *  1. NOVUS_AI_PROVIDER env var (explicit override), or `preferred` arg
 *  2. Auto-detect: GROQ_API_KEY → Groq (free, no region lock),
 *                  else GEMINI_API_KEY → Gemini,
 *                  else deterministic Fallback.
 *
 * To add OpenAI/Claude/Local later: implement AIProvider and register here.
 */
export function getAIProvider(preferred?: ProviderName): AIProvider {
  const explicit = preferred || (process.env.NOVUS_AI_PROVIDER as ProviderName | undefined);

  if (explicit) {
    switch (explicit) {
      case "groq": { const p = new GroqProvider(); return p.isConfigured() ? p : new FallbackProvider(); }
      case "gemini": { const p = new GeminiProvider(); return p.isConfigured() ? p : new FallbackProvider(); }
      default: return new FallbackProvider();
    }
  }

  // Auto-detect by which key is present
  const groq = new GroqProvider();
  if (groq.isConfigured()) return groq;

  const gemini = new GeminiProvider();
  if (gemini.isConfigured()) return gemini;

  return new FallbackProvider();
}

export { NOVUS_PERSONA };
