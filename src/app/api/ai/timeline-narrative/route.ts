import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import {
  buildTimelineNarrativePrompt,
  parseTimelineNarrative,
  fallbackTimelineNarrative,
  type TimelineNarrative,
} from "@/lib/ai/intelligence";

export const dynamic = "force-dynamic";

// GET /api/ai/timeline-narrative?refresh=1 — AI life chapters + reflections (cached weekly)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const refresh = new URL(req.url).searchParams.get("refresh") === "1";

    if (!refresh) {
      try {
        const cached = await prisma.aIReport.findFirst({
          where: { userId, type: "TIMELINE_NARRATIVE" },
          orderBy: { createdAt: "desc" },
        });
        if (cached && Date.now() - new Date(cached.createdAt).getTime() < 7 * 86400000 && cached.metadata) {
          return NextResponse.json({ narrative: cached.metadata, cached: true });
        }
      } catch { /* fall through */ }
    }

    const ctx = await buildDeepContext(userId);
    const provider = getAIProvider();
    let narrative: TimelineNarrative;
    if (provider.isConfigured()) {
      try {
        const raw = await provider.complete([{ role: "user", content: buildTimelineNarrativePrompt(ctx) }], {
          temperature: 0.7, maxTokens: 900, jsonMode: true,
        });
        narrative = parseTimelineNarrative(raw) || fallbackTimelineNarrative(ctx);
      } catch {
        narrative = fallbackTimelineNarrative(ctx);
      }
    } else {
      narrative = fallbackTimelineNarrative(ctx);
    }

    try {
      await prisma.aIReport.create({
        data: { userId, type: "TIMELINE_NARRATIVE", content: narrative.currentChapter.title, metadata: narrative as any },
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({ narrative, cached: false });
  } catch (e) {
    console.error("Timeline narrative error:", e);
    return NextResponse.json({ narrative: null });
  }
}
