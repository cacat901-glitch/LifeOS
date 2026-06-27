import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDeepContext } from "@/lib/ai/deep-context";
import {
  proposeExperiment,
  snapshotFromContext,
  summarizeExperiment,
  type ExperimentSnapshot,
} from "@/lib/ai/intelligence";

export const dynamic = "force-dynamic";

// GET /api/experiments — active + completed experiments, plus a fresh proposal.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    let active = null;
    let completed: any[] = [];
    try {
      active = await prisma.experiment.findFirst({ where: { userId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
      completed = await prisma.experiment.findMany({
        where: { userId, status: { in: ["COMPLETED", "FAILED", "ABANDONED"] } },
        orderBy: { completedAt: "desc" },
        take: 10,
      });
    } catch {
      /* table not synced */
    }

    // Only suggest a new one when nothing is running.
    let proposal = null;
    if (!active) {
      const ctx = await buildDeepContext(userId);
      proposal = proposeExperiment(ctx);
    }

    return NextResponse.json({ active, completed, proposal });
  } catch (e) {
    console.error("Experiments GET error:", e);
    return NextResponse.json({ active: null, completed: [], proposal: null });
  }
}

// POST /api/experiments — start an experiment (captures a baseline snapshot).
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const body = await req.json();

    const ctx = await buildDeepContext(userId);
    const baseline = snapshotFromContext(ctx);
    const durationDays = Math.min(Math.max(Number(body.durationDays) || 7, 1), 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    try {
      const exp = await prisma.experiment.create({
        data: {
          userId,
          title: String(body.title || "Untitled Experiment").slice(0, 120),
          hypothesis: String(body.hypothesis || ""),
          durationDays,
          actions: Array.isArray(body.actions) ? body.actions.filter((a: any) => typeof a === "string").slice(0, 8) : [],
          predictedOutcome: String(body.predictedOutcome || ""),
          endDate,
          baseline: baseline as any,
        },
      });
      return NextResponse.json({ experiment: exp });
    } catch {
      return NextResponse.json({ error: "Experiments aren't enabled yet (database sync pending)." }, { status: 503 });
    }
  } catch (e) {
    console.error("Experiments POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/experiments — { id, action: "complete" | "abandon" }
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const { id, action } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    try {
      const exp = await prisma.experiment.findFirst({ where: { id, userId } });
      if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (action === "abandon") {
        const updated = await prisma.experiment.update({ where: { id }, data: { status: "ABANDONED", completedAt: new Date() } });
        return NextResponse.json({ experiment: updated });
      }

      // Complete → measure before/after and summarise
      const ctx = await buildDeepContext(userId);
      const after = snapshotFromContext(ctx);
      const before = (exp.baseline as unknown as ExperimentSnapshot) || after;
      const { status, actualOutcome, aiSummary } = summarizeExperiment(exp.title, exp.predictedOutcome, before, after);

      const updated = await prisma.experiment.update({
        where: { id },
        data: { status, actualOutcome, aiSummary, result: after as any, completedAt: new Date() },
      });

      // Add to timeline
      try {
        await prisma.timelineEvent.create({
          data: {
            userId,
            type: "EXPERIMENT_COMPLETED",
            title: `Experiment: ${exp.title}`,
            description: aiSummary,
            date: new Date(),
            isHighlight: true,
            icon: "experiment",
          },
        });
      } catch {
        /* timeline optional */
      }

      return NextResponse.json({ experiment: updated });
    } catch {
      return NextResponse.json({ error: "Experiments aren't enabled yet (database sync pending)." }, { status: 503 });
    }
  } catch (e) {
    console.error("Experiments PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
