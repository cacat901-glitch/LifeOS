import type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";
import { NOVUS_PERSONA, buildBriefingPrompt, fallbackBriefing } from "./prompts";

// Groq — free, fast, no credit card, no EU/region restriction.
// OpenAI-compatible endpoint, so we just use fetch (no SDK dependency).
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  constructor(private apiKey = process.env.GROQ_API_KEY) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(messages: AIMessage[], options: AICompletionOptions = {}): Promise<string> {
    if (!this.apiKey) throw new Error("Groq is not configured");

    const payload = [
      { role: "system", content: options.system || NOVUS_PERSONA },
      ...messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    let lastError: unknown;
    for (const model of MODELS) {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: payload,
            temperature: options.temperature ?? 0.8,
            max_tokens: options.maxTokens ?? 600,
            ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          // Try next model on model-not-found / decommissioned
          if (res.status === 404 || res.status === 400 || errText.includes("decommissioned") || errText.includes("not found")) {
            lastError = new Error(`Groq ${model}: ${res.status} ${errText}`);
            continue;
          }
          throw new Error(`Groq error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        return (data.choices?.[0]?.message?.content ?? "").trim();
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw lastError;
  }

  async generateBriefing(ctx: NovusContext): Promise<string> {
    if (!this.isConfigured()) return fallbackBriefing(ctx);
    try {
      return await this.complete(
        [{ role: "user", content: buildBriefingPrompt(ctx) }],
        { system: NOVUS_PERSONA, temperature: 0.85, maxTokens: 320 }
      );
    } catch (e) {
      console.error("Groq briefing failed, using fallback:", e);
      return fallbackBriefing(ctx);
    }
  }
}
