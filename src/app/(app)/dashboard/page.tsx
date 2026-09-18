"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Circle, RefreshCw, ListChecks, Flame, Target, NotebookPen } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { NovusCore } from "@/components/novus/novus-core";
import { NowLiquidField } from "@/components/novus/now-liquid-field";
import { RadialInstrument } from "@/components/visual-system/instruments";

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
  const { setNovusOpen, openNovusWithPrompt } = useAppStore();
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
  const coreState = focusItems.length ? "attention" : (data.habits.completed || data.tasks.done) ? "positive" : "idle";
  const summary = briefing || buildCurrentSummary(data);
  const upNextItems = insights.length
    ? insights.slice(0, 4).map((insight, index) => ({ id: `${insight.title}-${index}`, title: insight.title, meta: insight.action || insight.message, onClick: () => openNovusWithPrompt(insight.action || insight.title) }))
    : focusItems.length
      ? focusItems.slice(0, 4).map((item) => ({ id: item.id, title: item.title, meta: item.meta, onClick: item.onToggle }))
      : [
          { id: "priority-prompt", title: "Choose today's first priority", meta: "Novus", onClick: () => openNovusWithPrompt("Help me choose today's first priority.") },
          { id: "habit-prompt", title: "Design a habit that will stick", meta: "Novus", onClick: () => openNovusWithPrompt("Help me design a habit that will stick.") },
          { id: "goal-prompt", title: "Shape a realistic first goal", meta: "Novus", onClick: () => openNovusWithPrompt("Help me shape a realistic first goal.") },
          { id: "review-prompt", title: "Plan a simple evening review", meta: "Novus", onClick: () => openNovusWithPrompt("Help me plan a simple evening review.") },
        ];

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.32 }} className="now-canonical">
      <section className="now-desktop" aria-label="Now overview">
        <NowLiquidField />
        <div className="now-desktop__hero">
          <div className="now-desktop__context">
            <MetaLabel>{timeContext(clock)}</MetaLabel>
            <span className="now-live">Live</span>
          </div>
          <div className="now-desktop__copy">
            <h2>{greeting(clock)},<br />{firstName}.</h2>
            <p>{summary}</p>
          </div>
          <div className="now-desktop__dial">
            <RadialInstrument value={data.lifeScore.total} label="Life score" />
            <span>Grade {data.lifeScore.grade}</span>
          </div>
        </div>

        <div className="now-metric-row">
          <MetricInstrument kind="score" label="Life score" value={data.lifeScore.total} detail={`Grade ${data.lifeScore.grade}`} progress={data.lifeScore.total} />
          <MetricInstrument kind="tasks" label="Tasks" value={openTasks.length} detail={`${data.tasks.done} of ${data.tasks.total} completed`} progress={taskProgress} />
          <MetricInstrument kind="habits" label="Habits" value={data.habits.total} detail={`${data.habits.bestStreak} day best streak`} progress={habitProgress} />
          <MetricInstrument kind="progress" label="Progress" value={`${overallProgress}%`} detail="Today" progress={overallProgress} />
          <MetricInstrument kind="momentum" label="Momentum" value={momentumLabel(data.lifeScore.total)} detail="No trend history yet" progress={data.lifeScore.total} />
        </div>

        <div className="now-lower-grid">
          <InstrumentSection className="now-today" label="Today">
            <h3>Make sense of now.</h3>
            {focusItems.length ? <FocusList items={focusItems} /> : <StarterActions onAsk={() => setNovusOpen(true)} />}
            <button onClick={() => setNovusOpen(true)} className="now-panel-link">Ask Novus <ArrowRight /></button>
          </InstrumentSection>

          <InstrumentSection label="Up next">
            <div className="now-up-next">
              {upNextItems.map((item, index) => (
                <button key={item.id} onClick={item.onClick} className="now-intel-row">
                  <span className="now-row-icon" aria-hidden="true">{index === 0 ? <ListChecks /> : index === 1 ? <Flame /> : index === 2 ? <Target /> : <NotebookPen />}</span>
                  <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                  <ArrowRight />
                </button>
              ))}
            </div>
            <button onClick={() => setNovusOpen(true)} className="now-prompts-footer">View all prompts <ArrowRight /></button>
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

type MetricKind = "score" | "tasks" | "habits" | "progress" | "momentum";

function MetricInstrument({ kind = "progress", label, value, detail, progress = 0 }: { kind?: MetricKind; label: string; value: number | string; detail: string; progress?: number }) {
  const amount = Math.min(100, Math.max(0, progress));
  const dormant = amount === 0;
  return (
    <article className={cn("target-instrument metric-instrument", `metric-instrument--${kind}`, dormant && "is-dormant")}>
      <div className="metric-instrument__head"><span>{label}</span><ArrowRight /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {kind === "score" && <RadialInstrument value={progress} label="" className="metric-mini-radial" />}
      {kind === "tasks" && <div className="metric-bars" role="meter" aria-label="Task completion" aria-valuenow={amount} aria-valuemin={0} aria-valuemax={100}>{Array.from({ length: 10 }, (_, index) => <i key={index} style={{ height: '100%', '--fill': `${Math.min(1, Math.max(0, amount / 10 - index)) * 100}%` } as React.CSSProperties} />)}</div>}
      {kind === "habits" && <div className="metric-rhythm" role="meter" aria-label="Habit completion today, not a weekly history" aria-valuenow={amount} aria-valuemin={0} aria-valuemax={100}>{Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--fill': `${Math.min(1, Math.max(0, amount / 10 - index)) * 100}%` } as React.CSSProperties} />)}</div>}
      {kind === "progress" && <div className="now-completion-path" role="meter" aria-label="Overall completion" aria-valuenow={amount} aria-valuemin={0} aria-valuemax={100}><svg viewBox="0 0 120 36" aria-hidden="true"><path d="M3 30 C32 30 32 7 60 7 S93 30 117 6" pathLength="100"/><path d="M3 30 C32 30 32 7 60 7 S93 30 117 6" pathLength="100" style={{ strokeDasharray: `${amount} 100` }}/></svg></div>}
      {kind === "momentum" && <div className="now-momentum-dormant" aria-hidden="true"><svg viewBox="0 0 110 44"><path d="M2 30 H14 Q18 30 18 25 V21 Q18 17 22 17 H27 Q31 17 31 21 V27 Q31 31 35 31 H43 Q47 31 47 27 V25 Q47 21 51 21 H60 Q64 21 64 25 V28 Q64 32 68 32 H77 Q81 32 81 28 V21 Q81 17 85 17 H92 Q96 17 96 21 V25 Q96 29 100 29 H108" /></svg></div>}
    </article>
  );
}

function StarterActions({ onAsk }: { onAsk: () => void }) {
  const items = [
    { title: "Review today's priorities", meta: "Ask Novus", action: onAsk },
    { title: "Add your top three tasks", meta: "Open Tasks", href: "/tasks" },
    { title: "Create your first habit", meta: "Open Habits", href: "/habits" },
    { title: "Write a quick journal entry", meta: "Open Journal", href: "/journal" },
  ];
  return <div className="starter-actions">{items.map((item) => item.href
    ? <a key={item.title} href={item.href}><span className="focus-list__check"><Check /></span><span><strong>{item.title}</strong><small>{item.meta}</small></span></a>
    : <button key={item.title} onClick={item.action}><span className="focus-list__check"><Check /></span><span><strong>{item.title}</strong><small>{item.meta}</small></span></button>)}</div>;
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
  if (!items.length) return <div className="activity-dormant"><div className="activity-system-row"><Circle className="activity-system-icon" /><span><strong>Your activity timeline is ready</strong><small>Awaiting your first completed action</small></span></div><EmptyInstrument>Tasks, habits, journal entries, and workouts will appear here.</EmptyInstrument></div>;
  return <div className="activity-list">{items.map((item) => <div key={item.id}><span className="activity-dot" /><span><strong>{item.title}</strong><small>{item.meta}</small></span></div>)}</div>;
}

function EmptyInstrument({ children }: { children: React.ReactNode }) {
  return <div className="instrument-empty"><p>{children}</p><div className="instrument-dormant" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div><span>Awaiting signal</span></div>;
}
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
