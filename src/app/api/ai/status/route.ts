import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/status
 * Returns which AI provider is active and whether it's live or fallback.
 * Used by the UI to show "Powered by Groq" vs "Offline mode" indicators.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = getAIProvider();
  const isLive = provider.name !== "fallback";

  // Do a lightweight test completion to confirm the key actually works
  let confirmed = false;
  let errorHint = "";

  if (isLive) {
    try {
      const result = await provider.complete(
        [{ role: "user", content: "Reply with exactly: ok" }],
        { temperature: 0, maxTokens: 5 }
      );
      confirmed = result.toLowerCase().includes("ok") || result.length > 0;
    } catch (e: any) {
      confirmed = false;
      const msg = e?.message || "";
      if (msg.includes("429") || msg.includes("quota")) errorHint = "quota_exceeded";
      else if (msg.includes("401") || msg.includes("403") || msg.includes("invalid")) errorHint = "invalid_key";
      else if (msg.includes("404") || msg.includes("not found")) errorHint = "model_not_found";
      else errorHint = "unknown";
    }
  }

  const PROVIDER_LABELS: Record<string, string> = {
    groq:     "Groq (Llama 3.3)",
    gemini:   "Google Gemini",
    fallback: "Offline mode",
  };

  return NextResponse.json({
    provider: provider.name,
    label: PROVIDER_LABELS[provider.name] || provider.name,
    isLive,
    confirmed,
    errorHint,
    status: !isLive
      ? "Running on built-in intelligence. Add a GROQ_API_KEY to unlock full AI."
      : confirmed
        ? `Live · Powered by ${PROVIDER_LABELS[provider.name]}`
        : errorHint === "quota_exceeded"
          ? "Key found but quota is exhausted — try again later or check billing."
          : errorHint === "invalid_key"
            ? "API key is invalid or unauthorized."
            : "Key found but test failed — check Vercel logs.",
  });
}
