import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - Get all tasks
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: any = {
      userId: session.user.id,
      isDeleted: false,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: { category: true, subtasks: true },
      orderBy: [{ priority: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks - Create a task
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, dueDate, categoryId, tags, estimatedMinutes, parentId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId,
        tags: tags || [],
        estimatedMinutes,
        parentId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tasks - Update task status
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, status, ...updates } = await req.json();

    const task = await prisma.task.update({
      where: { id: taskId, userId: session.user.id },
      data: {
        ...updates,
        status,
        completedAt: status === "DONE" ? new Date() : null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/tasks - Soft delete a task
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await req.json();

    await prisma.task.update({
      where: { id: taskId, userId: session.user.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
