/**
 * Deep Context Builder
 * Assembles rich, multi-dimensional data from the user's history
 * for the AI engine to reason over. More thorough than the daily
 * NovusContext — used for reviews, analysis, and memory.
 */
import { prisma } from "@/lib/prisma";

export interface DeepContext {
  user: { name: string; joinedDaysAgo: number };

  habits: {
    list: Array<{ name: string; streak: number; totalCompletions: number; completionRate: number; frequency: string }>;
    avgCompletionRate: number;
    bestStreak: number;
    totalCompletions: number;
    last7Rate: number;
    last30Rate: number;
  };

  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    overdue: number;
    avgPriority: string;
  };

  goals: {
    active: number;
    completed: number;
    list: Array<{ title: string; progress: number; type: string; targetDate: string | null }>;
    avgProgress: number;
    topGoal: string | null;
  };

  mood: {
    entries: number;
    avgScore: number;
    trend: "improving" | "declining" | "stable";
    last7Avg: number;
    last30Avg: number;
    topEmotions: string[];
    topFactors: string[];
  };

  workout: {
    totalSessions: number;
    last7Sessions: number;
    last30Sessions: number;
    totalVolume: number;
    avgDuration: number;
    isConsistent: boolean;
  };

  journal: {
    totalEntries: number;
    totalWords: number;
    avgWordsPerEntry: number;
    last30Entries: number;
    avgMood: number;
    recentContent: string;
  };

  finance: {
    income30: number;
    expense30: number;
    net30: number;
    topExpenseCategory: string | null;
  };

  patterns: {
    workoutMoodCorrelation: boolean | null;
    journalConsistencyCorrelation: boolean | null;
    moodHabitCorrelation: boolean | null;
  };
}

export async function buildDeepContext(userId: string): Promise<DeepContext> {
  const since30 = new Date(); since30.setDate(since30.getDate() - 30); since30.setHours(0,0,0,0);
  const since7  = new Date(); since7.setDate(since7.getDate() - 7);   since7.setHours(0,0,0,0);
  const today   = new Date(); today.setHours(0,0,0,0);

  const [user, habits, allHabitLogs, tasks, goals, moodLogs, workoutSessions, journalEntries, finIncome, finExpense, topExpenseCat] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, createdAt: true } }),
    prisma.habit.findMany({ where: { userId, isArchived: false }, include: { logs: { where: { date: { gte: since30 } }, select: { completed: true, date: true } } } }),
    prisma.habitLog.findMany({ where: { userId, date: { gte: since30 }, completed: true }, select: { date: true } }),
    prisma.task.findMany({ where: { userId, isDeleted: false }, select: { status: true, priority: true, dueDate: true } }),
    prisma.goal.findMany({ where: { userId }, select: { title: true, currentValue: true, targetValue: true, type: true, targetDate: true, status: true } }),
    prisma.moodLog.findMany({ where: { userId, date: { gte: since30 } }, select: { score: true, date: true, emotions: true, factors: true }, orderBy: { date: "asc" } }),
    prisma.workoutSession.findMany({ where: { userId, isCompleted: true }, select: { startTime: true, duration: true, totalVolume: true }, orderBy: { startTime: "desc" }, take: 200 }),
    prisma.journalEntry.findMany({ where: { userId }, select: { content: true, wordCount: true, mood: true, date: true, title: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.financeTransaction.aggregate({ where: { userId, type: "INCOME", date: { gte: since30 } }, _sum: { amount: true } }).catch(() => null),
    prisma.financeTransaction.aggregate({ where: { userId, type: "EXPENSE", date: { gte: since30 } }, _sum: { amount: true } }).catch(() => null),
    prisma.financeTransaction.groupBy({ by: ["category"], where: { userId, type: "EXPENSE", date: { gte: since30 } }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take: 1 }).catch(() => []),
  ]);

  // ── Habits ─────────────────────────────────────────────────
  const habitList = habits.map((h) => {
    const completed = h.logs.filter((l) => l.completed).length;
    const rate = h.logs.length ? Math.round((completed / h.logs.length) * 100) : 0;
    return { name: h.name, streak: h.currentStreak, totalCompletions: h.totalCompletions, completionRate: rate, frequency: h.frequency };
  });
  const avgCompletionRate = habitList.length ? Math.round(habitList.reduce((s, h) => s + h.completionRate, 0) / habitList.length) : 0;
  const bestStreak = habitList.length ? Math.max(...habitList.map((h) => h.streak)) : 0;
  const logs7 = allHabitLogs.filter((l) => new Date(l.date) >= since7);
  const uniqueDays7 = new Set(logs7.map((l) => new Date(l.date).toDateString())).size;
  const last7Rate = habits.length ? Math.round((uniqueDays7 / 7) * 100) : 0;
  const last30Rate = allHabitLogs.length && habits.length
    ? Math.round((new Set(allHabitLogs.map((l) => new Date(l.date).toDateString())).size / 30) * 100) : 0;

  // ── Tasks ──────────────────────────────────────────────────
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "DONE").length;
  const taskRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  // ── Goals ──────────────────────────────────────────────────
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + (g.currentValue / (g.targetValue || 100)) * 100, 0) / activeGoals.length) : 0;

  // ── Mood ───────────────────────────────────────────────────
  const moodLast7 = moodLogs.filter((m) => new Date(m.date) >= since7);
  const avg30 = moodLogs.length ? +(moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length).toFixed(1) : 0;
  const avg7  = moodLast7.length ? +(moodLast7.reduce((s, m) => s + m.score, 0) / moodLast7.length).toFixed(1) : 0;
  const moodTrend: "improving" | "declining" | "stable" = avg7 > avg30 + 0.4 ? "improving" : avg7 < avg30 - 0.4 ? "declining" : "stable";
  const emotionCounts: Record<string, number> = {};
  const factorCounts: Record<string, number> = {};
  moodLogs.forEach((m) => {
    m.emotions.forEach((e) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
    m.factors.forEach((f) => { factorCounts[f] = (factorCounts[f] || 0) + 1; });
  });
  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([e]) => e);
  const topFactors  = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f]) => f);

  // ── Workouts ────────────────────────────────────────────────
  const w30 = workoutSessions.filter((s) => new Date(s.startTime) >= since30);
  const w7  = workoutSessions.filter((s) => new Date(s.startTime) >= since7);
  const totalVolume = workoutSessions.reduce((s, w) => s + w.totalVolume, 0);
  const avgDuration = workoutSessions.length
    ? Math.round(workoutSessions.reduce((s, w) => s + (w.duration || 0), 0) / workoutSessions.length) : 0;

  // ── Journal ─────────────────────────────────────────────────
  const j30 = journalEntries.filter((e) => new Date(e.date) >= since30);
  const totalWords = journalEntries.reduce((s, e) => s + (e.wordCount || 0), 0);
  const avgWords = journalEntries.length ? Math.round(totalWords / journalEntries.length) : 0;
  const jMoodAvg = journalEntries.filter((e) => e.mood).length
    ? +(journalEntries.filter((e) => e.mood).reduce((s, e) => s + (e.mood || 0), 0) / journalEntries.filter((e) => e.mood).length).toFixed(1) : 0;
  const recentContent = journalEntries.slice(0, 3)
    .map((e) => `[${new Date(e.date).toLocaleDateString()}] ${e.title || "Entry"}: ${(e.content || "").slice(0, 300)}`)
    .join("\n\n");

  // ── Pattern Detection ───────────────────────────────────────
  let workoutMoodCorrelation: boolean | null = null;
  if (moodLogs.length >= 5 && workoutSessions.length >= 3) {
    const workoutDaySet = new Set(workoutSessions.map((s) => new Date(s.startTime).toDateString()));
    const workoutMoods = moodLogs.filter((m) => workoutDaySet.has(new Date(m.date).toDateString())).map((m) => m.score);
    const restMoods = moodLogs.filter((m) => !workoutDaySet.has(new Date(m.date).toDateString())).map((m) => m.score);
    if (workoutMoods.length && restMoods.length) {
      const wAvg = workoutMoods.reduce((a, b) => a + b, 0) / workoutMoods.length;
      const rAvg = restMoods.reduce((a, b) => a + b, 0) / restMoods.length;
      workoutMoodCorrelation = wAvg - rAvg > 0.5;
    }
  }
  let moodHabitCorrelation: boolean | null = null;
  if (moodLogs.length >= 5 && allHabitLogs.length >= 10) {
    const habitDaySet = new Set(allHabitLogs.map((l) => new Date(l.date).toDateString()));
    const habitMoods = moodLogs.filter((m) => habitDaySet.has(new Date(m.date).toDateString())).map((m) => m.score);
    const noHabitMoods = moodLogs.filter((m) => !habitDaySet.has(new Date(m.date).toDateString())).map((m) => m.score);
    if (habitMoods.length && noHabitMoods.length) {
      const hAvg = habitMoods.reduce((a, b) => a + b, 0) / habitMoods.length;
      const nAvg = noHabitMoods.reduce((a, b) => a + b, 0) / noHabitMoods.length;
      moodHabitCorrelation = hAvg - nAvg > 0.4;
    }
  }

  return {
    user: { name: user?.name || "there", joinedDaysAgo: user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000) : 0 },
    habits: { list: habitList, avgCompletionRate, bestStreak, totalCompletions: habits.reduce((s, h) => s + h.totalCompletions, 0), last7Rate, last30Rate },
    tasks: { total: tasks.length, completed: doneTasks, completionRate: taskRate, overdue, avgPriority: "MEDIUM" },
    goals: { active: activeGoals.length, completed: completedGoals.length, list: activeGoals.map((g) => ({ title: g.title, progress: Math.round((g.currentValue / (g.targetValue || 100)) * 100), type: g.type, targetDate: g.targetDate ? new Date(g.targetDate).toLocaleDateString() : null })), avgProgress, topGoal: activeGoals[0]?.title ?? null },
    mood: { entries: moodLogs.length, avgScore: avg30, trend: moodTrend, last7Avg: avg7, last30Avg: avg30, topEmotions, topFactors },
    workout: { totalSessions: workoutSessions.length, last7Sessions: w7.length, last30Sessions: w30.length, totalVolume, avgDuration, isConsistent: w7.length >= 3 },
    journal: { totalEntries: journalEntries.length, totalWords, avgWordsPerEntry: avgWords, last30Entries: j30.length, avgMood: jMoodAvg, recentContent },
    finance: { income30: finIncome?._sum?.amount || 0, expense30: finExpense?._sum?.amount || 0, net30: (finIncome?._sum?.amount || 0) - (finExpense?._sum?.amount || 0), topExpenseCategory: (topExpenseCat as any[])[0]?.category ?? null },
    patterns: { workoutMoodCorrelation, journalConsistencyCorrelation: null, moodHabitCorrelation },
  };
}
