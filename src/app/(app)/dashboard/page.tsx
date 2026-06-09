"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getGreeting, formatDate } from "@/lib/utils";

interface DashboardData {
  user: { name: string; xp: number; level: number } | null;
  habits: { list: any[]; completed: number; total: number; bestStreak: number };
  tasks: { list: any[]; done: number; total: number };
  goals: any[];
  mood: { score: number; emoji: string; label: string } | null;
  recentWorkout: any | null;
  lifeScore: { total: number; grade: string; breakdown: Record<string, number> };
  streaks: { habits: number; journal: number; workout: number; mood: number };
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "text-red-500", HIGH: "text-orange-500", MEDIUM: "text-yellow-500", LOW: "text-muted-foreground",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const greeting = getGreeting();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const toggleHabit = async (habitId: string, currentlyDone: boolean) => {
    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, completed: !currentlyDone }),
    });
    fetchDashboard();
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    });
    fetchDashboard();
  };

  if (loading) return <DashboardSkeleton />;

  const d = data!;
  const userName = d?.user?.name?.split(" ")[0] || "there";
  const lifeScore = d?.lifeScore ?? { total: 0, grade: "—", breakdown: {} };
  const habits = d?.habits ?? { list: [], completed: 0, total: 0, bestStreak: 0 };
  const tasks = d?.tasks ?? { list: [], done: 0, total: 0 };
  const goals = d?.goals ?? [];
  const streaks = d?.streaks ?? { habits: 0, journal: 0, workout: 0, mood: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Daily Briefing */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-semibold">{greeting}, {userName}</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-1 max-w-xl pt-1">
                {habits.total > 0 ? (
                  <p>You&apos;ve completed <span className="text-foreground font-medium">{habits.completed}/{habits.total}</span> habits today.</p>
                ) : (
                  <p>No habits yet — <Link href="/habits" className="text-primary underline">add your first habit</Link> to get started.</p>
                )}
                {d?.mood ? (
                  <p>Today&apos;s mood: <span className="text-foreground font-medium">{d.mood.emoji} {d.mood.label}</span></p>
                ) : (
                  <p className="text-primary font-medium">Don&apos;t forget to <Link href="/mood" className="underline">log your mood</Link> today.</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex shrink-0">AI Insight</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Life Score" value={String(lifeScore.total)} suffix={`/100 · ${lifeScore.grade}`} trend="" color="text-primary" />
        <StatCard title="Habits" value={`${habits.completed}/${habits.total}`} suffix="today" trend={habits.bestStreak > 0 ? `🔥 ${habits.bestStreak} streak` : "No streak yet"} color="text-green-500" />
        <StatCard title="Tasks" value={String(tasks.total - tasks.done)} suffix="remaining" trend={`${tasks.done} done`} color="text-blue-500" />
        <StatCard
          title="Mood"
          value={d?.mood ? d.mood.emoji : "—"}
          suffix={d?.mood ? d.mood.label : "Not logged"}
          trend=""
          color="text-yellow-500"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today&apos;s Habits</CardTitle>
            <Link href="/habits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View All</Link>
          </CardHeader>
          <CardContent>
            {habits.list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No habits yet.</p>
                <Link href="/habits" className="inline-flex items-center justify-center h-8 rounded-lg px-3 text-xs font-medium bg-primary text-primary-foreground mt-3">Add your first habit</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.list.map((habit) => (
                  <div key={habit.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <button
                      onClick={() => toggleHabit(habit.id, habit.isCompleted)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${habit.isCompleted ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30 hover:border-primary"}`}
                    >
                      {habit.isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className="text-lg">{habit.icon || "✅"}</span>
                    <span className={`flex-1 text-sm ${habit.isCompleted ? "line-through text-muted-foreground" : ""}`}>{habit.name}</span>
                    {habit.streak > 0 && <Badge variant="secondary" className="text-xs">🔥 {habit.streak}</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Life Score */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Life Score</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <div className="text-5xl font-bold gradient-text">{lifeScore.total}</div>
                <div className="text-sm text-muted-foreground mt-1">Grade: {lifeScore.grade}</div>
              </div>
              <div className="space-y-3 mt-2">
                {[
                  { label: "Habits", key: "habits", color: "bg-green-500" },
                  { label: "Tasks", key: "tasks", color: "bg-blue-500" },
                  { label: "Goals", key: "goals", color: "bg-purple-500" },
                  { label: "Mood", key: "mood", color: "bg-yellow-500" },
                  { label: "Workout", key: "workout", color: "bg-red-500" },
                ].map(({ label, key, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{lifeScore.breakdown[key] ?? 0}%</span>
                    </div>
                    <Progress value={lifeScore.breakdown[key] ?? 0} indicatorClassName={color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Workout */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Workout</CardTitle></CardHeader>
            <CardContent>
              {d?.recentWorkout ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{d.recentWorkout.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(d.recentWorkout.startTime)}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {d.recentWorkout.duration && <span>⏱ {d.recentWorkout.duration}min</span>}
                    {d.recentWorkout.totalVolume > 0 && <span>🏋️ {Math.round(d.recentWorkout.totalVolume)}kg</span>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-2xl">🏋️</span>
                  <p className="text-xs text-muted-foreground mt-2">No workouts yet</p>
                </div>
              )}
              <Link href="/workout" className="inline-flex items-center justify-center w-full h-8 rounded-lg px-3 text-xs font-medium bg-primary text-primary-foreground mt-3">Log Workout</Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Tasks</CardTitle>
            <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View All</Link>
          </CardHeader>
          <CardContent>
            {tasks.list.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No tasks yet. <Link href="/tasks" className="text-primary underline">Add one</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.list.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <button
                      onClick={() => toggleTask(task.id, task.status)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.status === "DONE" ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary"}`}
                    >
                      {task.status === "DONE" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className={`flex-1 text-sm ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Goals</CardTitle>
            <Link href="/goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View All</Link>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No goals yet. <Link href="/goals" className="text-primary underline">Set one</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate pr-2">{goal.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                    {goal.targetDate && <p className="text-xs text-muted-foreground">Target: {formatDate(goal.targetDate)}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Streaks</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Habits", value: streaks.habits, icon: "🔥" },
                { label: "Journal", value: streaks.journal, icon: "✍️" },
                { label: "Workout", value: streaks.workout, icon: "💪" },
                { label: "Mood", value: streaks.mood, icon: "💜" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-xl font-bold mt-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Widget */}
      <FinanceWidget />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "📝", label: "New Journal", href: "/journal" },
              { icon: "✅", label: "Habits", href: "/habits" },
              { icon: "📋", label: "Add Task", href: "/tasks" },
              { icon: "🎯", label: "New Goal", href: "/goals" },
              { icon: "🏋️", label: "Log Workout", href: "/workout" },
              { icon: "💜", label: "Log Mood", href: "/mood" },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="inline-flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
                <span className="text-xl">{action.icon}</span>
                <span className="text-xs">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, suffix, trend, color }: { title: string; value: string; suffix: string; trend: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          <span className="text-xs text-muted-foreground">{suffix}</span>
        </div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl bg-muted/50" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted/50" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-muted/50" />
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-muted/50" />
          <div className="h-28 rounded-2xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}


// ── Finance Widget ─────────────────────────────────────────────────────────
function FinanceWidget() {
  const [data, setData] = useState<{ stats: any; accounts: any[]; transactions: any[] } | null>(null);

  useEffect(() => {
    fetch("/api/finance?months=1")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data || data.accounts.length === 0) return null;

  const { stats, accounts, transactions } = data;

  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Finance</CardTitle>
        <Link href="/finance" className="text-xs text-primary hover:underline">View All</Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <div className={`text-lg font-bold ${stats.netWorth >= 0 ? "text-green-500" : "text-red-500"}`}>{fmt(stats.netWorth)}</div>
            <div className="text-xs text-muted-foreground">Net Worth</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <div className="text-lg font-bold text-green-500">+{fmt(stats.income)}</div>
            <div className="text-xs text-muted-foreground">Income</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <div className="text-lg font-bold text-red-500">-{fmt(stats.expenses)}</div>
            <div className="text-xs text-muted-foreground">Expenses</div>
          </div>
        </div>
        {transactions.slice(0, 3).map((tx: any) => (
          <div key={tx.id} className="flex items-center gap-3 py-2 border-t first:border-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${tx.type === "INCOME" ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"}`}>
              {tx.type === "INCOME" ? "↑" : "↓"}
            </div>
            <span className="flex-1 text-sm truncate">{tx.title}</span>
            <span className={`text-sm font-medium shrink-0 ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}>
              {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
