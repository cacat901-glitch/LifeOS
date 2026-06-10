import { prisma } from "@/lib/prisma";
import type { NovusContext } from "./types";

function timeOfDay(): NovusContext["timeOfDay"] {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

/** Assemble a vendor-agnostic snapshot of the user for the AI layer. */
export async function buildNovusContext(userId: string): Promise<NovusContext> {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [user, habits, tasks, goals, mood, workoutCount, lastWorkout, income, expense] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.habit.findMany({
      where: { userId, isArchived: false, isActive: true },
      include: { logs: { where: { date: { gte: todayStart, lte: todayEnd } } } },
    }),
    prisma.task.findMany({ where: { userId, isDeleted: false } }),
    prisma.goal.findMany({ where: { userId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    prisma.moodLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.workoutSession.count({ where: { userId, startTime: { gte: weekStart }, isCompleted: true } }),
    prisma.workoutSession.findFirst({ where: { userId }, orderBy: { startTime: "desc" } }),
    prisma.financeTransaction.aggregate({ where: { userId, type: "INCOME", date: { gte: monthStart } }, _sum: { amount: true } }).catch(() => null),
    prisma.financeTransaction.aggregate({ where: { userId, type: "EXPENSE", date: { gte: monthStart } }, _sum: { amount: true } }).catch(() => null),
  ]);

  const habitsCompleted = habits.filter((h) => h.logs.some((l) => l.completed)).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => h.currentStreak)) : 0;

  const todayTasks = tasks.filter((t) =>
    (t.dueDate && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= todayEnd) ||
    t.status === "TODO" || t.status === "IN_PROGRESS"
  );
  const doneToday = tasks.filter((t) => t.status === "DONE" && t.completedAt && new Date(t.completedAt) >= todayStart).length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < todayStart && t.status !== "DONE").length;

  const avgProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + (g.currentValue / (g.targetValue || 100)) * 100, 0) / goals.length)
    : 0;

  const net = ((income?._sum.amount || 0) - (expense?._sum.amount || 0));

  return {
    name: user?.name || "there",
    timeOfDay: timeOfDay(),
    habits: { total: habits.length, completedToday: habitsCompleted, bestStreak },
    tasks: { total: todayTasks.length, doneToday, overdue },
    goals: { active: goals.length, avgProgress },
    mood: mood ? { score: mood.score, label: mood.label || "" } : null,
    workout: { thisWeek: workoutCount, lastSession: lastWorkout?.name },
    finance: (income || expense) ? { net: Math.round(net) } : null,
    topGoal: goals[0]?.title ?? null,
  };
}
