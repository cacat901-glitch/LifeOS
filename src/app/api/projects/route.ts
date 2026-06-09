import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        tasks: { orderBy: { order: "asc" } },
        notes: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Auto-calculate progress from tasks
    const enriched = projects.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t) => t.status === "DONE").length;
      const progress = total > 0 ? Math.round((done / total) * 100) : p.progress;
      return { ...p, progress };
    });

    return NextResponse.json(enriched);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/projects  – create project
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, status, priority, color, icon, startDate, dueDate } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        description,
        status: status || "ACTIVE",
        priority: priority || "MEDIUM",
        color: color || "#6366f1",
        icon: icon || "📁",
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { tasks: true, notes: true, _count: { select: { tasks: true } } },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/projects  – update project OR add/update task
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── Update project fields ──────────────────────────────
    if (action === "updateProject" || !action) {
      const { projectId, ...data } = body;
      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      if (data.startDate) data.startDate = new Date(data.startDate);
      delete data.action;

      const project = await prisma.project.update({
        where: { id: projectId, userId: session.user.id },
        data,
        include: { tasks: true, notes: true, _count: { select: { tasks: true } } },
      });
      return NextResponse.json(project);
    }

    // ── Add task to project ────────────────────────────────
    if (action === "addTask") {
      const { projectId, title, description, priority, dueDate } = body;
      const task = await prisma.projectTask.create({
        data: {
          projectId,
          userId: session.user.id,
          title,
          description,
          priority: priority || "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      return NextResponse.json(task);
    }

    // ── Update task status ─────────────────────────────────
    if (action === "updateTask") {
      const { taskId, status, title } = body;
      const task = await prisma.projectTask.update({
        where: { id: taskId, userId: session.user.id },
        data: {
          ...(status && { status }),
          ...(title && { title }),
          ...(status === "DONE" && { completedAt: new Date() }),
          ...(status && status !== "DONE" && { completedAt: null }),
        },
      });
      return NextResponse.json(task);
    }

    // ── Delete task ────────────────────────────────────────
    if (action === "deleteTask") {
      const { taskId } = body;
      await prisma.projectTask.delete({ where: { id: taskId, userId: session.user.id } });
      return NextResponse.json({ message: "Deleted" });
    }

    // ── Add note ───────────────────────────────────────────
    if (action === "addNote") {
      const { projectId, content } = body;
      const note = await prisma.projectNote.create({
        data: { projectId, userId: session.user.id, content },
      });
      return NextResponse.json(note);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/projects  – delete project
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await req.json();
    await prisma.project.delete({ where: { id: projectId, userId: session.user.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
