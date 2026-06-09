"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Stats {
  habits: { rate: number; total: number; streak: number; chartData: number[] };
  tasks: { completed: number; total: number; rate: number; chartData: number[] };
  goals: { active: number; avgProgress: number; completed: number };
  mood: { average: number; total: number; chartData: number[] };
  workout: { sessions: number; thisWeek: number; totalVolume: number; chartData: number[] };
  journal: { total: number; words: number; avgMood: number; chartData: number[] };
  lifeScore: { current: number; grade: string };
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const load = useCallback(async () => {
    // Fetch all data in parallel
    const [habitsRes, tasksRes, goalsRes, moodRes, workoutRes, journalRes, dashRes] = await Promise.allSettled([
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/mood?days=30").then((r) => r.json()),
      fetch("/api/workout?limit=100").then((r) => r.json()),
      fetch("/api/journal?limit=100").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]);

    const habits = habitsRes.status === "fulfilled" ? habitsRes.value : [];
    const tasks = tasksRes.status === "fulfilled" ? tasksRes.value : [];
    const goals = goalsRes.status === "fulfilled" ? goalsRes.value : [];
    const moodData = moodRes.status === "fulfilled" ? moodRes.value : { entries: [], stats: {} };
    const workouts = workoutRes.status === "fulfilled" ? workoutRes.value : [];
    const journalData = journalRes.status === "fulfilled" ? journalRes.value : { entries: [], total: 0 };
    const dash = dashRes.status === "fulfilled" ? dashRes.value : null;

    const completedHabitsToday = Array.isArray(habits) ? habits.filter((h: any) => h.logs?.some((l: any) => l.completed)).length : 0;
    const habitRate = Array.isArray(habits) && habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0;

    const doneTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "DONE").length : 0;
    const taskRate = Array.isArray(tasks) && tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const activeGoals = Array.isArray(goals) ? goals.filter((g: any) => g.status === "ACTIVE") : [];
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s: number, g: any) => s + (g.currentValue / (g.targetValue || 100)) * 100, 0) / activeGoals.length)
      : 0;

    const moodEntries = moodData.entries || [];
    const moodChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const log = moodEntries.find((e: any) => new Date(e.date).setHours(0,0,0,0) === d.getTime());
      return log ? log.score : 0;
    });

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const workoutArray = Array.isArray(workouts) ? workouts : [];
    const thisWeekW = workoutArray.filter((s: any) => new Date(s.startTime) >= weekAgo).length;
    const wChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      return workoutArray.filter((s: any) => new Date(s.startTime).setHours(0,0,0,0) === d.getTime()).length;
    });

    const journalEntries = journalData.entries || [];
    const jChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      return journalEntries.filter((e: any) => new Date(e.date).setHours(0,0,0,0) === d.getTime()).length;
    });

    setStats({
      habits: { rate: habitRate, total: Array.isArray(habits) ? habits.length : 0, streak: dash?.streaks?.habits || 0, chartData: Array.from({length:7},(_,i)=>{
        const d=new Date(); d.setDate(d.getDate()-(6-i)); d.setHours(0,0,0,0);
        const dayHabits=Array.isArray(habits)?habits:[];
        if(dayHabits.length===0) return 0;
        // approximate from logs
        return 0;
      }) },
      tasks: { completed: doneTasks, total: Array.isArray(tasks) ? tasks.length : 0, rate: taskRate, chartData: Array.from({length:7},()=>0) },
      goals: { active: activeGoals.length, avgProgress: avgGoalProgress, completed: Array.isArray(goals) ? goals.filter((g: any) => g.status === "COMPLETED").length : 0 },
      mood: { average: moodData.stats?.average || 0, total: moodEntries.length, chartData: moodChart },
      workout: { sessions: workoutArray.length, thisWeek: thisWeekW, totalVolume: workoutArray.reduce((s: number, w: any) => s + w.totalVolume, 0), chartData: wChart },
      journal: { total: journalData.total || 0, words: journalEntries.reduce((s: number, e: any) => s + (e.wordCount || 0), 0), avgMood: 0, chartData: jChart },
      lifeScore: { current: dash?.lifeScore?.total || 0, grade: dash?.lifeScore?.grade || "—" },
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="animate-pulse space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted/50" />)}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-sm text-muted-foreground">Your comprehensive analytics</p>
        </div>
        <div className="flex gap-2">
          {(["week","month","year"] as const).map((p) => (
            <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)} className="capitalize">{p}</Button>
          ))}
        </div>
      </div>

      {/* Life Score Hero */}
      <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Life Score</h3>
            <div className="text-right">
              <span className="text-3xl font-bold gradient-text">{stats.lifeScore.current}</span>
              <span className="text-lg text-muted-foreground ml-1">· {stats.lifeScore.grade}</span>
            </div>
          </div>
          <Progress value={stats.lifeScore.current} className="h-3" />
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="✅ Habits" color="bg-green-500"
          stats={[{ label: "Today's Rate", value: `${stats.habits.rate}%` }, { label: "Active Habits", value: String(stats.habits.total) }, { label: "Best Streak", value: `🔥 ${stats.habits.streak}` }]}
          chartData={stats.habits.chartData} chartMax={100} />
        <StatCard title="📋 Tasks" color="bg-blue-500"
          stats={[{ label: "Completed", value: String(stats.tasks.completed) }, { label: "Total", value: String(stats.tasks.total) }, { label: "Rate", value: `${stats.tasks.rate}%` }]}
          chartData={stats.tasks.chartData} chartMax={10} />
        <StatCard title="🎯 Goals" color="bg-purple-500"
          stats={[{ label: "Active", value: String(stats.goals.active) }, { label: "Avg Progress", value: `${stats.goals.avgProgress}%` }, { label: "Completed", value: String(stats.goals.completed) }]}
          chartData={[]} chartMax={100} />
        <StatCard title="💜 Mood" color="bg-pink-500"
          stats={[{ label: "30-day Avg", value: String(stats.mood.average) }, { label: "Entries", value: String(stats.mood.total) }, { label: "Tracked Days", value: String(stats.mood.total) }]}
          chartData={stats.mood.chartData} chartMax={10} />
        <StatCard title="💪 Workout" color="bg-orange-500"
          stats={[{ label: "Total Sessions", value: String(stats.workout.sessions) }, { label: "This Week", value: String(stats.workout.thisWeek) }, { label: "Volume", value: stats.workout.totalVolume > 999 ? `${(stats.workout.totalVolume/1000).toFixed(1)}k kg` : `${Math.round(stats.workout.totalVolume)}kg` }]}
          chartData={stats.workout.chartData} chartMax={3} />
        <StatCard title="📝 Journal" color="bg-cyan-500"
          stats={[{ label: "Total Entries", value: String(stats.journal.total) }, { label: "Words Written", value: stats.journal.words > 999 ? `${(stats.journal.words/1000).toFixed(1)}k` : String(stats.journal.words) }, { label: "This Week", value: String(stats.journal.chartData.reduce((a,b)=>a+b,0)) }]}
          chartData={stats.journal.chartData} chartMax={3} />
      </div>

      {/* Goals detail */}
      {stats.goals.active > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Goals Progress</CardTitle></CardHeader>
          <CardContent>
            <GoalsDetail />
          </CardContent>
        </Card>
      )}

      {/* Finance Stats */}
      <FinanceStats />
    </div>
  );
}

function StatCard({ title, color, stats: statItems, chartData, chartMax }: { title: string; color: string; stats: {label: string; value: string}[]; chartData: number[]; chartMax: number }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {statItems.map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        {chartData.length > 0 && (
          <div className="flex items-end gap-0.5 h-16">
            {chartData.map((v, i) => (
              <div key={i} className={`flex-1 ${color}/60 rounded-t-sm transition-all`} style={{ height: chartMax > 0 ? `${(v / chartMax) * 100}%` : "0%", minHeight: v > 0 ? "4px" : "0" }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalsDetail() {
  const [goals, setGoals] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/goals").then((r) => r.json()).then((d) => setGoals(Array.isArray(d) ? d.filter((g: any) => g.status === "ACTIVE") : []));
  }, []);
  return (
    <div className="space-y-3">
      {goals.map((g) => {
        const pct = Math.min(Math.round((g.currentValue / (g.targetValue || 100)) * 100), 100);
        return (
          <div key={g.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{g.title}</span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        );
      })}
    </div>
  );
}


// ── Finance Stats ──────────────────────────────────────────────────────────
function FinanceStats() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/finance?months=1")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data || (data.accounts ?? []).length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const { stats, monthlyChart } = data;
  const maxBar = Math.max(...(monthlyChart ?? []).flatMap((m: any) => [m.income, m.expenses]), 1);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">💳 Finance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary card */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">This Month</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-sm font-bold text-green-500">{fmt(stats.income)}</div>
                <div className="text-[10px] text-muted-foreground">Income</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-sm font-bold text-red-500">{fmt(stats.expenses)}</div>
                <div className="text-[10px] text-muted-foreground">Expenses</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className={`text-sm font-bold ${stats.net >= 0 ? "text-blue-500" : "text-red-500"}`}>{fmt(stats.net)}</div>
                <div className="text-[10px] text-muted-foreground">Saved</div>
              </div>
            </div>
            <div className="space-y-2">
              {(stats.topCategories ?? []).slice(0, 4).map((c: any) => {
                const pct = stats.expenses > 0 ? Math.round((c.amount / stats.expenses) * 100) : 0;
                return (
                  <div key={c.category} className="space-y-0.5">
                    <div className="flex justify-between text-xs"><span>{c.category}</span><span className="text-muted-foreground">{fmt(c.amount)} · {pct}%</span></div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 6-month chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">6-Month Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-36">
              {(monthlyChart ?? []).map((bar: any) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: "110px" }}>
                    <div className="flex-1 bg-green-500/70 rounded-t-sm transition-all"
                      style={{ height: `${(bar.income / maxBar) * 100}%`, minHeight: bar.income > 0 ? "3px" : "0" }} />
                    <div className="flex-1 bg-red-500/70 rounded-t-sm transition-all"
                      style={{ height: `${(bar.expenses / maxBar) * 100}%`, minHeight: bar.expenses > 0 ? "3px" : "0" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/70 inline-block" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />Expenses</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
