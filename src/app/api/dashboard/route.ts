import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLifeScoreGrade } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Habits
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false, isActive: true },
      include: {
        logs: { where: { date: { gte: todayStart, lte: todayEnd } } },
      },
    });
    const habitsCompleted = habits.filter((h) => h.logs.some((l) => l.completed)).length;

    // Tasks today
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDeleted: false,
        OR: [
          { dueDate: { gte: todayStart, lte: todayEnd } },
          { status: { in: ["TODO", "IN_PROGRESS"] } },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 5,
    });
    const tasksDone = tasks.filter((t) => t.status === "DONE").length;

    // Goals
    const goals = await prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // Today's mood
    const todayMood = await prisma.moodLog.findFirst({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
    });

    // Recent journal entries
    const recentJournal = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 1,
    });

    // Recent workout
    const recentWorkout = await prisma.workoutSession.findFirst({
      where: { userId },
      orderBy: { startTime: "desc" },
    });

    // User info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true, level: true },
    });

    // Life score breakdown
    const habitScore = habits.length > 0 ? Math.round((habitsCompleted / habits.length) * 100) : 0;
    const taskScore = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;
    const goalScore = goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + (g.currentValue / (g.targetValue || 100)) * 100, 0) / goals.length)
      : 0;
    const moodScore = todayMood ? todayMood.score * 10 : 0;
    const workoutScore = recentWorkout && new Date(recentWorkout.startTime) >= weekStart ? 100 : 0;

    const totalScore = Math.min(
      Math.round(habitScore * 0.30 + taskScore * 0.20 + goalScore * 0.15 + moodScore * 0.15 + workoutScore * 0.10),
      100
    );

    // Journal streak
    const journalLogs = await prisma.journalEntry.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 60,
    });
    const journalStreak = calcStreak(journalLogs.map((l) => l.date));

    // Mood streak
    const moodLogs = await prisma.moodLog.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 60,
    });
    const moodStreak = calcStreak(moodLogs.map((l) => l.date));

    // Best habit streak
    const bestHabitStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;

    // Workout streak (weekly sessions in last 7 days)
    const workoutCount = await prisma.workoutSession.count({
      where: { userId, startTime: { gte: weekStart }, isCompleted: true },
    });

    return NextResponse.json({
      user,
      habits: {
        list: habits.slice(0, 7).map((h) => ({
          id: h.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          isCompleted: h.logs.some((l) => l.completed),
          streak: h.currentStreak,
        })),
        completed: habitsCompleted,
        total: habits.length,
        bestStreak: bestHabitStreak,
      },
      tasks: {
        list: tasks.slice(0, 5).map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
        })),
        done: tasksDone,
        total: tasks.length,
      },
      goals: goals.slice(0, 4).map((g) => ({
        id: g.id,
        title: g.title,
        progress: Math.round((g.currentValue / (g.targetValue || 100)) * 100),
        color: g.color,
        targetDate: g.targetDate,
      })),
      mood: todayMood
        ? { score: todayMood.score, emoji: todayMood.emoji, label: todayMood.label }
        : null,
      recentJournal: recentJournal[0] ?? null,
      recentWorkout: recentWorkout ?? null,
      lifeScore: {
        total: totalScore,
        grade: getLifeScoreGrade(totalScore),
        breakdown: { habits: habitScore, tasks: taskScore, goals: goalScore, mood: moodScore, workout: workoutScore },
      },
      streaks: {
        habits: bestHabitStreak,
        journal: journalStreak,
        workout: workoutCount,
        mood: moodStreak,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates]
    .map((d) => { const n = new Date(d); n.setHours(0,0,0,0); return n.getTime(); })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b - a);
  let streak = 0;
  let expected = new Date();
  expected.setHours(0,0,0,0);
  for (const ts of sorted) {
    if (ts === expected.getTime() || ts === expected.getTime() - 86400000) {
      streak++;
      expected = new Date(ts - 86400000);
    } else break;
  }
  return streak;
}
