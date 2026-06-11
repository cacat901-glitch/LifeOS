import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { generatePredictiveInsights } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

// GET /api/ai/insights — deterministic predictive insights from live data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await buildDeepContext(session.user.id);
    const insights = generatePredictiveInsights(ctx);

    return NextResponse.json({ insights });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
