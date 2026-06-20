// ════════════════════════════════════════════════════════
// Novus AI — Provider Abstraction Layer
// The rest of the app NEVER imports a vendor SDK directly.
// It only depends on these interfaces + the getAIProvider() factory.
// ════════════════════════════════════════════════════════

export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AICompletionOptions {
  /** System / persona instruction. */
  system?: string;
  /** 0–1, higher = more creative. */
  temperature?: number;
  /** Max output tokens. */
  maxTokens?: number;
  /** Force the provider to return a single valid JSON object. */
  jsonMode?: boolean;
}

/**
 * Context Novus assembles about the user before asking the AI for guidance.
 * Vendor-agnostic — providers turn this into prompts internally.
 */
export interface NovusContext {
  name: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  habits: { total: number; completedToday: number; bestStreak: number };
  tasks: { total: number; doneToday: number; overdue: number };
  goals: { active: number; avgProgress: number };
  mood?: { score: number; label: string } | null;
  workout?: { thisWeek: number; lastSession?: string } | null;
  finance?: { net: number } | null;
  topGoal?: string | null;
}

/** Every AI provider Novus supports implements this contract. */
export interface AIProvider {
  readonly name: string;
  /** True when the provider is configured (has an API key). */
  isConfigured(): boolean;
  /** One-shot text completion. */
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string>;
  /** Generate the personalized daily briefing narrative. */
  generateBriefing(ctx: NovusContext): Promise<string>;
}
