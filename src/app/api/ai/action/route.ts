import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildNLActionPrompt, parseNLAction } from "@/lib/ai/generators";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/action
 * Natural language → platform objects.
 * body: { input: string, execute?: boolean }
 *
 * If execute=true, creates the objects in the database.
 * If execute=false (default), returns a preview for the user to confirm.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { input, execute = false } = await req.json();
    if (!input) return NextResponse.json({ error: "input required" }, { status: 400 });

    // Parse intent with AI
    const prompt = buildNLActionPrompt(input);
    const provider = getAIProvider();
    let raw = "";
    try { raw = await provider.complete([{ role: "user", content: prompt }], { temperature: 0.3, maxTokens: 600 }); }
    catch (e) { console.error("NL action AI error:", e); }

    const action = parseNLAction(raw);
    if (!execute) return NextResponse.json({ action, preview: true });

    // Execute — create the objects
    const created: Record<string, any> = {};

    if (action.type === "CREATE_GOAL" || action.type === "CREATE_PLAN") {
      const goal = await prisma.goal.create({
        data: {
          userId: session.user.id,
          title: action.extracted.title || input.slice(0, 100),
          description: action.extracted.description,
          type: "LONG_TERM",
          targetDate: action.extracted.targetDate ? new Date(action.extracted.targetDate) : null,
          milestones: action.extracted.milestones?.length ? {
            create: action.extracted.milestones.map((m, i) => ({
              userId: session.user.id,
              title: m,
              order: i,
            })),
          } : undefined,
        },
        include: { milestones: true },
      });
      created.goal = goal;
    }

    if (action.type === "CREATE_HABIT") {
      const habit = await prisma.habit.create({
        data: {
          userId: session.user.id,
          title: action.extracted.title || input.slice(0, 100),
          frequency: "DAILY",
        } as any,
      });
      created.habit = habit;
    }

    if (action.type === "CREATE_TASK") {
      const task = await prisma.task.create({
        data: {
          userId: session.user.id,
          title: action.extracted.title || input.slice(0, 200),
          priority: "MEDIUM",
        },
      });
      created.task = task;
    }

    // Create supporting habits/tasks for plans
    if (action.type === "CREATE_PLAN") {
      if (action.extracted.habits?.length) {
        created.habits = await Promise.all(action.extracted.habits.map(h =>
          prisma.habit.create({ data: { userId: session.user.id, name: h, frequency: "DAILY" } })
        ));
      }
      if (action.extracted.tasks?.length) {
        created.tasks = await Promise.all(action.extracted.tasks.map(t =>
          prisma.task.create({ data: { userId: session.user.id, title: t, priority: "MEDIUM" } })
        ));
      }
    }

    return NextResponse.json({ action, created, executed: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
