import type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";
import { GeminiProvider } from "./gemini";
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

export type ProviderName = "gemini" | "openai" | "claude" | "local";

/**
 * The single entry point the rest of Novus uses.
 * To add OpenAI/Claude/Local later: implement AIProvider and register here.
 */
export function getAIProvider(preferred?: ProviderName): AIProvider {
  const choice = preferred || (process.env.NOVUS_AI_PROVIDER as ProviderName) || "gemini";

  switch (choice) {
    case "gemini": {
      const gemini = new GeminiProvider();
      return gemini.isConfigured() ? gemini : new FallbackProvider();
    }
    // case "openai": return new OpenAIProvider();   // future
    // case "claude": return new ClaudeProvider();   // future
    // case "local":  return new LocalProvider();    // future
    default:
      return new FallbackProvider();
  }
}

export { NOVUS_PERSONA };
