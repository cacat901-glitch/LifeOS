import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";
import { NOVUS_PERSONA, buildBriefingPrompt, fallbackBriefing } from "./prompts";

// Use the stable v2 flash model. Falls back down the list if one isn't available.
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest"];
const MODEL = MODELS[0];

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI | null = null;

  constructor(private apiKey = process.env.GEMINI_API_KEY) {
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.client);
  }

  async complete(messages: AIMessage[], options: AICompletionOptions = {}): Promise<string> {
    if (!this.client) throw new Error("Gemini is not configured");

    const systemInstruction = options.system || NOVUS_PERSONA;

    // Try each model in priority order — gracefully handles deprecations
    let lastError: unknown;
    for (const modelName of MODELS) {
      try {
        const model = this.client.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            temperature: options.temperature ?? 0.8,
            maxOutputTokens: options.maxTokens ?? 600,
          },
        });

        // Map our roles → Gemini "user"/"model" history
        const history = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

        const last = history.pop();
        if (!last) return "";

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(last.parts[0].text);
        return result.response.text().trim();
      } catch (e: any) {
        // 404 = model not found, try next one
        if (e?.status === 404 || e?.message?.includes("not found")) {
          lastError = e;
          continue;
        }
        throw e; // any other error (auth, quota, etc.) — rethrow immediately
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
      console.error("Gemini briefing failed, using fallback:", e);
      return fallbackBriefing(ctx);
    }
  }
}
