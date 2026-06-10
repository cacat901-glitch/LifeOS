import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, AICompletionOptions, NovusContext } from "./types";
import { NOVUS_PERSONA, buildBriefingPrompt, fallbackBriefing } from "./prompts";

const MODEL = "gemini-1.5-flash";

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
    const model = this.client.getGenerativeModel({
      model: MODEL,
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

    // Last message is the live prompt; everything before is history
    const last = history.pop();
    if (!last) return "";

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last.parts[0].text);
    return result.response.text().trim();
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
