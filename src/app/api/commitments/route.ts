import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/commitments — active commitments (Promise Memory)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    try {
      const commitments = await prisma.commitment.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ commitments });
    } catch {
      return NextResponse.json({ commitments: [] });
    }
  } catch (e) {
    console.error("Commitments GET error:", e);
    return NextResponse.json({ commitments: [] });
  }
}

// POST /api/commitments — manually add a commitment { text, relatedModule? }
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { text, relatedModule } = await req.json();
    if (!text || typeof text !== "string") return NextResponse.json({ error: "Missing text" }, { status: 400 });
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 3);
    try {
      const commitment = await prisma.commitment.create({
        data: { userId, text: text.trim().slice(0, 280), relatedModule: relatedModule || null, checkInDate },
      });
      return NextResponse.json({ commitment });
    } catch {
      return NextResponse.json({ error: "Commitments aren't enabled yet (database sync pending)." }, { status: 503 });
    }
  } catch (e) {
    console.error("Commitments POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/commitments — { id, action: "complete" | "abandon" }
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { id, action } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });
    const data =
      action === "complete" ? { status: "COMPLETED" as const, completedAt: new Date() } :
      action === "abandon" ? { status: "ABANDONED" as const, completedAt: new Date() } : null;
    if (!data) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    try {
      await prisma.commitment.update({ where: { id, userId }, data });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false });
    }
  } catch (e) {
    console.error("Commitments PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
