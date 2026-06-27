import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDeepContext } from "@/lib/ai/deep-context";
import { generateDiscoveries } from "@/lib/ai/intelligence";

export const dynamic = "force-dynamic";

// GET /api/discoveries — proactive insights from the user's real data.
// Regenerates + upserts (preserving dismissed/saved state) and returns active ones.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const ctx = await buildDeepContext(userId);
    const generated = generateDiscoveries(ctx);

    try {
      // Upsert each (don't clobber dismissed/saved flags)
      for (const g of generated) {
        await prisma.discovery.upsert({
          where: { userId_signature: { userId, signature: g.signature } },
          update: { title: g.title, explanation: g.explanation, confidence: g.confidence, evidence: g.evidence, modules: g.modules },
          create: { userId, signature: g.signature, title: g.title, explanation: g.explanation, confidence: g.confidence, evidence: g.evidence, modules: g.modules },
        });
      }
      const active = await prisma.discovery.findMany({
        where: { userId, isDismissed: false },
        orderBy: [{ isSaved: "desc" }, { confidence: "desc" }, { createdAt: "desc" }],
        take: 12,
      });
      const saved = await prisma.discovery.findMany({
        where: { userId, isSaved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ discoveries: active, saved, persisted: true });
    } catch {
      // Table not synced yet — return generated (ephemeral) so the feature still works
      const ephemeral = generated.map((g) => ({
        id: g.signature, ...g, isDismissed: false, isSaved: false, createdAt: new Date().toISOString(),
      }));
      return NextResponse.json({ discoveries: ephemeral, saved: [], persisted: false });
    }
  } catch (e) {
    console.error("Discoveries error:", e);
    return NextResponse.json({ discoveries: [], saved: [], persisted: false });
  }
}

// PATCH /api/discoveries — { id, action: "dismiss" | "save" | "unsave" }
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { id, action } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });

    const data =
      action === "dismiss" ? { isDismissed: true } :
      action === "save" ? { isSaved: true } :
      action === "unsave" ? { isSaved: false } : null;
    if (!data) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    try {
      await prisma.discovery.update({ where: { id, userId }, data });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, note: "Discoveries not yet persisted (DB sync pending)" });
    }
  } catch (e) {
    console.error("Discoveries PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
