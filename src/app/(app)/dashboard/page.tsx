"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Circle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { NovusCore } from "@/components/novus/novus-core";
import { RadialInstrument, SignalTrace } from "@/components/visual-system/instruments";

interface HabitItem { id: string; name: string; isCompleted: boolean; streak: number }
interface TaskItem { id: string; title: string; priority: string; status: string; dueDate?: string | null }
interface GoalItem { id: string; title: string; progress: number; targetDate?: string | null }
interface DashboardData {
  user: { name: string | null; xp: number; level: number } | null;
  habits: { list: HabitItem[]; completed: number; total: number; bestStreak: number };
  tasks: { list: TaskItem[]; done: number; total: number };
  goals: GoalItem[];
  mood: { score: number; label?: string | null } | null;
  recentWorkout: { name?: string; startTime?: string; isCompleted?: boolean } | null;
  recentJournal?: { title?: string | null; date?: string } | null;
  lifeScore: { total: number; grade: string; breakdown: Record<string, number> };
  streaks: { habits: number; journal: number; workout: number; mood: number };
}

interface PredictiveInsight { type: "warning" | "opportunity" | "celebration"; title: string; message: string; action?: string }
type FocusItem = { id: string; title: string; meta: string; checked: boolean; onToggle: () => void; href: string };

const ease = [0.16, 1, 0.3, 1] as const;

export default function NowPage() {
  const { setNovusOpen } = useAppStore();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState("");
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    const response = await fetch("/api/dashboard");
    if (response.ok) setData(await response.json());
  }, []);

  useEffect(() => {
    setClock(new Date());
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch("/api/dashboard").then((response) => response.ok ? response.json() : null),
      fetch("/api/ai/briefing").then((response) => response.ok ? response.json() : null),
      fetch("/api/ai/insights").then((response) => response.ok ? response.json() : null),
    ]).then(([dashboardResult, briefingResult, insightsResult]) => {
      if (!active) return;
      if (dashboardResult.status === "fulfilled" && dashboardResult.value) setData(dashboardResult.value);
      if (briefingResult.status === "fulfilled") setBriefing(briefingResult.value?.briefing || "");
      if (insightsResult.status === "fulfilled") setInsights(insightsResult.value?.insights || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const toggleHabit = async (habit: HabitItem) => {
    const isCompleted = !habit.isCompleted;
    setData((current) => current ? ({
      ...current,
      habits: {
        ...current.habits,
        completed: Math.max(0, current.habits.completed + (isCompleted ? 1 : -1)),
        list: current.habits.list.map((item) => item.id === habit.id ? { ...item, isCompleted } : item),
      },
    }) : current);
    const response = await fetch("/api/habits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId: habit.id, completed: isCompleted }) });
    if (!response.ok) await fetchDashboard();
  };

  const toggleTask = async (task: TaskItem) => {
    const status = task.status === "DONE" ? "TODO" : "DONE";
    setData((current) => current ? ({
      ...current,
      tasks: {
        ...current.tasks,
        done: Math.max(0, current.tasks.done + (status === "DONE" ? 1 : -1)),
        list: current.tasks.list.map((item) => item.id === task.id ? { ...item, status } : item),
      },
    }) : current);
    const response = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: task.id, status }) });
    if (!response.ok) await fetchDashboard();
  };

  if (loading) return <NowSkeleton />;
  if (!data) return <LoadFailure onRetry={() => { setLoading(true); fetchDashboard().finally(() => setLoading(false)); }} />;

  const firstName = data.user?.name?.trim().split(/\s+/)[0] || "welcome back";
  const openTasks = data.tasks.list.filter((item) => item.status !== "DONE");
  const openHabits = data.habits.list.filter((item) => !item.isCompleted);
  const focusItems: FocusItem[] = [
    ...openTasks.slice(0, 3).map((task) => ({ id: `task-${task.id}`, title: task.title, meta: taskMeta(task), checked: task.status === "DONE", onToggle: () => toggleTask(task), href: "/tasks" })),
    ...openHabits.slice(0, Math.max(0, 4 - Math.min(openTasks.length, 3))).map((habit) => ({ id: `habit-${habit.id}`, title: habit.name, meta: habit.streak ? `${habit.streak}-day streak` : "Habit for today", checked: habit.isCompleted, onToggle: () => toggleHabit(habit), href: "/habits" })),
  ].slice(0, 4);
  const taskProgress = percent(data.tasks.done, data.tasks.total);
  const habitProgress = percent(data.habits.completed, data.habits.total);
  const goalProgress = data.goals.length ? Math.round(data.goals.reduce((sum, goal) => sum + goal.progress, 0) / data.goals.length) : 0;
  const overallProgress = averagePresent([
    data.tasks.total ? taskProgress : null,
    data.habits.total ? habitProgress : null,
    data.goals.length ? goalProgress : null,
  ]);
  const scoreTrace = [
    data.lifeScore.breakdown.habits ?? 0,
    data.lifeScore.breakdown.tasks ?? 0,
    data.lifeScore.breakdown.goals ?? 0,
    data.lifeScore.breakdown.mood ?? 0,
    data.lifeScore.breakdown.workout ?? 0,
  ];
  const coreState = focusItems.length ? "attention" : (data.habits.completed || data.tasks.done) ? "positive" : "idle";
  const summary = briefing || buildCurrentSummary(data);

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.32 }} className="now-canonical">
      <section className="now-desktop" aria-label="Now overview">
        <NovusCore state={coreState} variant="mark" className="now-desktop__environment" />
        <div className="now-desktop__hero">
          <div className="now-desktop__context">
            <MetaLabel>{timeContext(clock)}</MetaLabel>
            <span className="now-live">Live</span>
          </div>
          <div className="now-desktop__copy">
            <h2>{greeting(clock)},<br />{firstName}.</h2>
            <p>{summary}</p>
          </div>
          <NovusCore state={coreState} variant="desktop-hero" className="now-desktop__liquid" />
          <div className="now-desktop__dial">
            <RadialInstrument value={data.lifeScore.total} label="Life score" />
            <span>Grade {data.lifeScore.grade}</span>
          </div>
        </div>

        <div className="now-metric-row">
          <MetricInstrument label="Life score" value={data.lifeScore.total} detail={`Grade ${data.lifeScore.grade}`} values={scoreTrace} />
          <MetricInstrument label="Tasks" value={openTasks.length} detail={`${data.tasks.done} completed`} bars={Math.min(7, data.tasks.total)} activeBars={Math.min(7, data.tasks.done)} />
          <MetricInstrument label="Habits" value={data.habits.total} detail={`${data.habits.bestStreak} day best streak`} progress={habitProgress} />
          <MetricInstrument label="Progress" value={`${overallProgress}%`} detail="Today" progress={overallProgress} />
          <MetricInstrument label="Momentum" value={momentumLabel(data.lifeScore.total)} detail={`${data.lifeScore.total}/100`} values={[taskProgress, habitProgress, goalProgress, data.mood?.score ? data.mood.score * 10 : 0]} />
        </div>

        <div className="now-lower-grid">
          <InstrumentSection className="now-today" label="Today">
            <h3>Make sense of now.</h3>
            <FocusList items={focusItems} empty="Nothing needs action right now." />
            <button onClick={() => setNovusOpen(true)} className="now-panel-link">Ask Novus <ArrowRight /></button>
          </InstrumentSection>

          <InstrumentSection label="Up next">
            <div className="now-up-next">
              {(insights.length ? insights.slice(0, 3).map((insight, index) => ({ id: `${insight.title}-${index}`, title: insight.title, meta: insight.action || insight.message, onClick: () => setNovusOpen(true) })) : focusItems.slice(0, 3).map((item) => ({ id: item.id, title: item.title, meta: item.meta, onClick: item.onToggle }))).map((item, index) => (
                <button key={item.id} onClick={item.onClick} className="now-intel-row">
                  <span className="now-row-icon">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                  <ArrowRight />
                </button>
              ))}
              {!insights.length && !focusItems.length && <EmptyInstrument>No immediate suggestions.</EmptyInstrument>}
            </div>
          </InstrumentSection>

          <InstrumentSection label="Recent activity" className="now-activity">
            <ActivityList data={data} />
          </InstrumentSection>
        </div>
      </section>

      <section className="now-mobile" aria-label="Now mobile overview">
        <div className="now-mobile__date"><MetaLabel>{timeContext(clock)}</MetaLabel><span className="now-live">Live</span></div>
        <div className="now-mobile__hero">
          <h2>{greeting(clock)},<br />{firstName}.</h2>
          <p>{summary}</p>
          <NovusCore state={coreState} className="now-mobile__liquid" />
        </div>
        <button className="mobile-score-card" onClick={() => setNovusOpen(true)} aria-label="Ask Novus about your Life Score">
          <NovusCore state={coreState} variant="mark" className="mobile-score-card__liquid" />
          <RadialInstrument value={data.lifeScore.total} label="Life score" />
          <span><MetaLabel>Life score</MetaLabel><strong>{data.lifeScore.total}</strong><small>Grade {data.lifeScore.grade}</small></span>
          <ArrowRight />
        </button>
        <button onClick={() => setNovusOpen(true)} className="mobile-ask-card"><span><MetaLabel>Ask Novus</MetaLabel><strong>Make sense of now</strong></span><ArrowRight /></button>
        <InstrumentSection label="Attention" className="mobile-attention">
          {focusItems.length ? <><h3>{focusItems[0].title}</h3><p>{focusItems[0].meta}</p><FocusList items={focusItems.slice(0, 3)} /></> : <><h3>Nothing is asking for your attention.</h3><p>Your visible priorities are clear.</p></>}
        </InstrumentSection>
        <div className="mobile-mini-grid">
          <MetricInstrument label="Tasks" value={openTasks.length} detail={`${taskProgress}% done`} progress={taskProgress} />
          <MetricInstrument label="Habits" value={data.habits.total} detail={`${habitProgress}% today`} progress={habitProgress} />
        </div>
      </section>
    </motion.div>
  );
}

function InstrumentSection({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <section className={cn("target-instrument", className)}><MetaLabel>{label}</MetaLabel>{children}</section>;
}

function MetricInstrument({ label, value, detail, values, progress, bars, activeBars }: { label: string; value: number | string; detail: string; values?: number[]; progress?: number; bars?: number; activeBars?: number }) {
  return (
    <article className="target-instrument metric-instrument">
      <div className="metric-instrument__head"><span>{label}</span><ArrowRight /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {values ? <SignalTrace values={values} label={label} /> : bars ? <div className="metric-bars">{Array.from({ length: bars }, (_, index) => <i key={index} className={index < (activeBars || 0) ? "is-active" : ""} style={{ height: `${32 + ((index * 17) % 58)}%` }} />)}</div> : <div className="metric-progress"><i style={{ width: `${progress || 0}%` }} /></div>}
    </article>
  );
}

function FocusList({ items, empty }: { items: FocusItem[]; empty?: string }) {
  if (!items.length) return empty ? <EmptyInstrument>{empty}</EmptyInstrument> : null;
  return <div className="focus-list">{items.map((item) => <button key={item.id} onClick={item.onToggle} aria-pressed={item.checked}><span className="focus-list__check"><Check /></span><span><strong>{item.title}</strong><small>{item.meta}</small></span></button>)}</div>;
}

function ActivityList({ data }: { data: DashboardData }) {
  const items = useMemo(() => {
    const activity: { id: string; title: string; meta: string }[] = [];
    data.tasks.list.filter((task) => task.status === "DONE").slice(0, 2).forEach((task) => activity.push({ id: `done-${task.id}`, title: task.title, meta: "Task completed" }));
    data.habits.list.filter((habit) => habit.isCompleted).slice(0, 2).forEach((habit) => activity.push({ id: `habit-${habit.id}`, title: habit.name, meta: habit.streak ? `${habit.streak}-day streak` : "Habit completed" }));
    if (data.recentWorkout?.name) activity.push({ id: "workout", title: data.recentWorkout.name, meta: "Recent workout" });
    if (data.recentJournal?.title) activity.push({ id: "journal", title: data.recentJournal.title, meta: "Recent journal entry" });
    return activity.slice(0, 4);
  }, [data]);
  if (!items.length) return <EmptyInstrument>Completed tasks, habits, journal entries, and workouts will appear here.</EmptyInstrument>;
  return <div className="activity-list">{items.map((item) => <div key={item.id}><span className="activity-dot" /><span><strong>{item.title}</strong><small>{item.meta}</small></span></div>)}</div>;
}

function EmptyInstrument({ children }: { children: React.ReactNode }) { return <p className="instrument-empty">{children}</p>; }
function MetaLabel({ children }: { children: React.ReactNode }) { return <span className="target-meta">{children}</span>; }

function NowSkeleton() { return <div className="now-canonical"><div className="now-skeleton os-skeleton" /><div className="now-skeleton-row">{Array.from({ length: 5 }, (_, index) => <div key={index} className="os-skeleton" />)}</div></div>; }
function LoadFailure({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><Circle className="h-7 w-7 text-muted-foreground" /><h2 className="mt-5 font-display text-2xl font-semibold">Now could not be loaded.</h2><p className="mt-2 text-sm text-muted-foreground">Your data was not changed.</p><button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 border border-primary/30 px-5 py-2.5 text-sm"><RefreshCw className="h-4 w-4" />Try again</button></div>; }

function percent(value: number, total: number) { return total ? Math.round((value / total) * 100) : 0; }
function averagePresent(values: Array<number | null>) { const present = values.filter((value): value is number => value !== null); return present.length ? Math.round(present.reduce((sum, value) => sum + value, 0) / present.length) : 0; }
function momentumLabel(score: number) { return score >= 75 ? "Strong" : score >= 50 ? "Building" : score > 0 ? "Starting" : "Quiet"; }
function greeting(clock: Date | null) { const hour = clock?.getHours() ?? new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; }
function timeContext(clock: Date | null) { return (clock ?? new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" }); }
function buildCurrentSummary(data: DashboardData) { const remainingHabits = Math.max(0, data.habits.total - data.habits.completed); const remainingTasks = Math.max(0, data.tasks.total - data.tasks.done); if (!data.habits.total && !data.tasks.total && !data.goals.length) return "You have no open tasks, habits, or goals yet. Add one when you’re ready."; const parts = [`${remainingTasks} open ${remainingTasks === 1 ? "task" : "tasks"}`, `${remainingHabits} ${remainingHabits === 1 ? "habit" : "habits"} left today`]; if (data.goals.length) parts.push(`${data.goals.length} active ${data.goals.length === 1 ? "goal" : "goals"}`); return `${parts.join(", ")}. Your Life Score is ${data.lifeScore.total}.`; }
function taskMeta(task: TaskItem) { const parts = [task.priority ? `${titleCase(task.priority)} priority` : "Task"]; if (task.dueDate) parts.push(formatDeadline(task.dueDate)); return parts.join(" · "); }
function titleCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function formatDeadline(value: string) { const date = new Date(value); const today = new Date(); const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1); if (date.toDateString() === today.toDateString()) return "Today"; if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"; return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
