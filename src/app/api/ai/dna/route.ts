import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { buildDnaPrompt, parseDna, fallbackDna, type LifeDNA } from "@/lib/ai/intelligence";

export const dynamic = "force-dynamic";

// GET /api/ai/dna?refresh=1 — the deepest AI profile (Life DNA).
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const refresh = new URL(req.url).searchParams.get("refresh") === "1";

    // Cache (weekly) via AIReport
    if (!refresh) {
      try {
        const cached = await prisma.aIReport.findFirst({
          where: { userId, type: "LIFE_DNA" },
          orderBy: { createdAt: "desc" },
        });
        if (cached && Date.now() - new Date(cached.createdAt).getTime() < 7 * 86400000 && cached.metadata) {
          return NextResponse.json({ dna: cached.metadata, cached: true });
        }
      } catch {
        /* AIReport unavailable — fall through to fresh */
      }
    }

    const ctx = await buildDeepContext(userId);
    const provider = getAIProvider();
    let dna: LifeDNA;
    let providerName = "fallback";

    if (provider.isConfigured()) {
      try {
        const raw = await provider.complete([{ role: "user", content: buildDnaPrompt(ctx) }], {
          temperature: 0.6,
          maxTokens: 1100,
          jsonMode: true,
        });
        dna = parseDna(raw) || fallbackDna(ctx);
        providerName = provider.name;
      } catch {
        dna = fallbackDna(ctx);
      }
    } else {
      dna = fallbackDna(ctx);
    }

    // Cache
    try {
      await prisma.aIReport.create({
        data: { userId, type: "LIFE_DNA", content: dna.identity, metadata: dna as any },
      });
    } catch {
      /* non-fatal */
    }

    return NextResponse.json({ dna, cached: false, provider: providerName });
  } catch (e) {
    console.error("DNA error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
