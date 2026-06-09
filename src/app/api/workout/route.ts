import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/workout - Get workout sessions
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      include: {
        sets: { include: { exercise: true } },
        template: true,
      },
      orderBy: { startTime: "desc" },
      take: limit,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/workout - Create a workout session
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, templateId, notes, bodyWeight } = body;

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        name: name || "Quick Workout",
        templateId,
        notes,
        bodyWeight,
      },
    });

    return NextResponse.json(workoutSession, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/workout - Add set to session or complete session
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, action, setData } = body;

    if (action === "complete") {
      const workoutSession = await prisma.workoutSession.update({
        where: { id: sessionId, userId: session.user.id },
        data: {
          isCompleted: true,
          endTime: new Date(),
          duration: body.duration,
        },
        include: { sets: true },
      });

      // Calculate stats
      const totalVolume = workoutSession.sets.reduce(
        (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
        0
      );
      const totalSets = workoutSession.sets.length;
      const totalReps = workoutSession.sets.reduce((sum, set) => sum + (set.reps || 0), 0);

      await prisma.workoutSession.update({
        where: { id: sessionId },
        data: { totalVolume, totalSets, totalReps },
      });

      // Award XP
      await prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: 25 } },
      });

      return NextResponse.json(workoutSession);
    }

    if (action === "addSet" && setData) {
      const set = await prisma.workoutSet.create({
        data: {
          sessionId,
          exerciseId: setData.exerciseId,
          setNumber: setData.setNumber,
          reps: setData.reps,
          weight: setData.weight,
          rpe: setData.rpe,
          isWarmup: setData.isWarmup || false,
          isPersonalRecord: setData.isPersonalRecord || false,
        },
      });

      return NextResponse.json(set);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
