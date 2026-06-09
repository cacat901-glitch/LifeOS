import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals - Get all goals
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const goals = await prisma.goal.findMany({
      where,
      include: {
        milestones: { orderBy: { order: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/goals - Create a goal
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, vision, type, targetDate, targetValue, unit, color, icon, categoryId, milestones } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        vision,
        type: type || "LONG_TERM",
        targetDate: targetDate ? new Date(targetDate) : null,
        targetValue: targetValue || 100,
        unit,
        color: color || "#6366f1",
        icon: icon || "target",
        categoryId,
        milestones: milestones
          ? {
              create: milestones.map((m: any, i: number) => ({
                userId: session.user.id,
                title: m.title,
                description: m.description,
                targetDate: m.targetDate ? new Date(m.targetDate) : null,
                order: i,
              })),
            }
          : undefined,
      },
      include: { milestones: true },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/goals - Update goal progress
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalId, currentValue, status, milestoneId, milestoneCompleted } = await req.json();

    if (milestoneId) {
      await prisma.goalMilestone.update({
        where: { id: milestoneId, userId: session.user.id },
        data: {
          isCompleted: milestoneCompleted,
          completedAt: milestoneCompleted ? new Date() : null,
        },
      });
    }

    if (goalId) {
      const updateData: any = {};
      if (currentValue !== undefined) updateData.currentValue = currentValue;
      if (status) {
        updateData.status = status;
        if (status === "COMPLETED") updateData.completedAt = new Date();
      }

      const goal = await prisma.goal.update({
        where: { id: goalId, userId: session.user.id },
        data: updateData,
        include: { milestones: true },
      });

      return NextResponse.json(goal);
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
