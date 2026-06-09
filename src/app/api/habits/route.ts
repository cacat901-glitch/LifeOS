import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/habits - Get all habits for the user
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        category: true,
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/habits - Create a new habit
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon, color, frequency, targetDays, targetCount, categoryId, reminderEnabled, reminderTime } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.plan === "FREE") {
      const habitCount = await prisma.habit.count({
        where: { userId: session.user.id, isArchived: false },
      });
      if (habitCount >= 3) {
        return NextResponse.json(
          { error: "Free plan is limited to 3 habits. Upgrade to Pro for unlimited habits." },
          { status: 403 }
        );
      }
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        description,
        icon: icon || "check",
        color: color || "#6366f1",
        frequency: frequency || "DAILY",
        targetDays: targetDays || [],
        targetCount: targetCount || 1,
        categoryId,
        reminderEnabled: reminderEnabled || false,
        reminderTime,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/habits - Toggle habit completion
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date, completed } = await req.json();

    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert habit log
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date: today },
      },
      update: { completed },
      create: {
        userId: session.user.id,
        habitId,
        date: today,
        completed,
      },
    });

    // Update streak
    if (completed) {
      const habit = await prisma.habit.findUnique({ where: { id: habitId } });
      if (habit) {
        const newStreak = habit.currentStreak + 1;
        await prisma.habit.update({
          where: { id: habitId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, habit.longestStreak),
            totalCompletions: habit.totalCompletions + 1,
          },
        });
      }
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error toggling habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// DELETE /api/habits - Archive (soft-delete) a habit
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { habitId } = await req.json();
    await prisma.habit.update({
      where: { id: habitId, userId: session.user.id },
      data: { isArchived: true, isActive: false },
    });
    return NextResponse.json({ message: "Habit deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
