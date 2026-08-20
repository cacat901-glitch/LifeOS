"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, CalendarClock, Check, Circle, RefreshCw, X,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { NovusCore } from "@/components/novus/novus-core";

interface HabitItem { id: string; name: string; icon?: string; color?: string; isCompleted: boolean; streak: number }
interface TaskItem { id: string; title: string; priority: string; status: string; dueDate?: string | null }
interface GoalItem { id: string; title: string; progress: number; color?: string; targetDate?: string | null }
interface DashboardData {
  user: { name: string | null; xp: number; level: number } | null;
  habits: { list: HabitItem[]; completed: number; total: number; bestStreak: number };
  tasks: { list: TaskItem[]; done: number; total: number };
  goals: GoalItem[];
  mood: { score: number; emoji?: string | null; label?: string | null } | null;
  recentWorkout: { name?: string; startTime?: string; isCompleted?: boolean } | null;
  recentJournal?: { title?: string | null; date?: string } | null;
  lifeScore: { total: number; grade: string; breakdown: Record<string, number> };
  streaks: { habits: number; journal: number; workout: number; mood: number };
}

interface PredictiveInsight { type: "warning" | "opportunity" | "celebration"; title: string; message: string; action?: string }
type FocusItem = { id: string; title: string; meta: string; checked: boolean; onToggle: () => void };

const spring = { type: "spring" as const, stiffness: 420, damping: 34 };
const ease = [0.16, 1, 0.3, 1] as const;

export default function NowPage() {
  const { setNovusOpen } = useAppStore();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState("");
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);
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
      setBriefingLoading(false);
    });
    return () => { active = false; };
  }, []);

  const toggleHabit = async (habit: HabitItem) => {
    const nextCompleted = !habit.isCompleted;
    setData((current) => current ? ({ ...current, habits: { ...current.habits, completed: Math.max(0, current.habits.completed + (nextCompleted ? 1 : -1)), list: current.habits.list.map((item) => item.id === habit.id ? { ...item, isCompleted: nextCompleted } : item) } }) : current);
    const response = await fetch("/api/habits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId: habit.id, completed: nextCompleted }) });
    if (!response.ok) await fetchDashboard();
  };

  const toggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    setData((current) => current ? ({ ...current, tasks: { ...current.tasks, done: Math.max(0, current.tasks.done + (nextStatus === "DONE" ? 1 : -1)), list: current.tasks.list.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item) } }) : current);
    const response = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: task.id, status: nextStatus }) });
    if (!response.ok) await fetchDashboard();
  };

  if (loading) return <NowSkeleton />;
  if (!data) return <LoadFailure onRetry={() => { setLoading(true); fetchDashboard().finally(() => setLoading(false)); }} />;

  const firstName = data.user?.name?.trim().split(/\s+/)[0];
  const visibleInsights = insights.filter((item) => !dismissed.has(item.title));
  const openTasks = data.tasks.list.filter((item) => item.status !== "DONE");
  const openHabits = data.habits.list.filter((item) => !item.isCompleted);
  const focusItems: FocusItem[] = [
    ...openTasks.slice(0, 3).map((task) => ({ id: `task-${task.id}`, title: task.title, meta: taskMeta(task), checked: task.status === "DONE", onToggle: () => toggleTask(task) })),
    ...openHabits.slice(0, Math.max(0, 5 - Math.min(openTasks.length, 3))).map((habit) => ({ id: `habit-${habit.id}`, title: habit.name, meta: habit.streak > 0 ? `${habit.streak}-day habit rhythm` : "Habit for today", checked: habit.isCompleted, onToggle: () => toggleHabit(habit) })),
  ].slice(0, 5);
  const habitProgress = data.habits.total ? Math.round((data.habits.completed / data.habits.total) * 100) : 0;
  const taskProgress = data.tasks.total ? Math.round((data.tasks.done / data.tasks.total) * 100) : 0;
  const coreState = focusItems.length ? "attention" : (data.habits.completed || data.tasks.done) ? "positive" : "idle";

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className={cn("now-field pb-8", focusItems.length ? "now-field--active" : "now-field--calm")}>
      <header className="now-hero relative border-b border-white/[0.08] pb-8 pt-5 md:pb-10 lg:min-h-[530px]">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-4"><FieldLabel>Now</FieldLabel><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{timeContext(clock)}</p></div>
          <p className="font-mono text-[9px] tabular-nums tracking-[0.14em] text-muted-foreground">{clock ? formatTime(clock) : "—"}</p>
        </div>

        <div className="relative grid gap-7 pt-8 lg:grid-cols-12 lg:gap-6 lg:pt-10">
          <div className="relative z-10 lg:col-span-5 lg:flex lg:min-h-[410px] lg:flex-col lg:justify-center">
            <h2 className="text-balance font-display text-[clamp(2.85rem,5.4vw,5.6rem)] font-semibold leading-[0.88] tracking-[-0.065em]">{greeting(clock)},<br /><span className="text-foreground/48">{firstName || "welcome back"}.</span></h2>
            <div className="mt-6 max-w-xl md:mt-7">{briefingLoading ? <BriefingSkeleton /> : <p className="text-pretty text-sm leading-relaxed text-foreground/72 md:text-base">{briefing || buildCurrentSummary(data)}</p>}</div>
            <button onClick={() => setNovusOpen(true)} className="focus-ring group mt-7 inline-flex w-fit items-center gap-4 border border-primary/35 bg-black/20 px-4 py-3 text-left backdrop-blur-md" aria-label="Ask Novus about your current state">
              <span><span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-primary">Ask Novus</span><span className="mt-1 block text-sm text-foreground/86">Make sense of now</span></span><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative -mx-5 h-[245px] overflow-hidden sm:mx-0 md:h-[320px] lg:col-span-4 lg:h-auto lg:min-h-[410px]">
            <NovusCore state={coreState} className="absolute inset-[-8%] md:inset-[-12%] lg:inset-[-18%]" />
          </div>

          <aside className="instrument-panel instrument-panel--glance relative z-10 lg:col-span-3 lg:self-center" aria-label="Today at a glance">
            <div className="flex items-center justify-between"><FieldLabel>At a glance</FieldLabel><span className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary">Live</span></div>
            <div className="mt-5 grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.08]">
              <MetricCell label="Life score" value={data.lifeScore.total} suffix={data.lifeScore.grade} />
              <MetricCell label="Open tasks" value={openTasks.length} suffix={`${taskProgress}% done`} />
              <MetricCell label="Habits" value={data.habits.completed} suffix={`of ${data.habits.total}`} />
              <MetricCell label="Best streak" value={data.habits.bestStreak} suffix="days" />
            </div>
            <div className="mt-5"><LifeProfile data={data} reducedMotion={!!reduceMotion} compact /></div>
          </aside>
        </div>
      </header>

      <div className="instrument-grid grid gap-3 border-b border-white/[0.08] py-3 lg:grid-cols-12">
        <section className="instrument-panel instrument-panel--attention relative lg:col-span-7" aria-labelledby="attention-title">
          <FieldLabel>Attention</FieldLabel>
          {focusItems.length ? (
            <div className="mt-6 md:mt-8"><h3 id="attention-title" className="max-w-3xl text-balance font-display text-[clamp(2.4rem,4.4vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.058em]">{focusItems[0].title}</h3><p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{focusItems[0].meta}</p><div className="mt-8 max-w-3xl border-t border-white/[0.08]">{focusItems.map((item, index) => <AttentionRow key={item.id} item={item} index={index} reducedMotion={!!reduceMotion} primary={index === 0} />)}</div></div>
          ) : (
            <div className="mt-7 max-w-3xl md:mt-9"><h3 id="attention-title" className="text-balance font-display text-[clamp(2.65rem,4.8vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-foreground/88">Nothing is asking for your attention.</h3><p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">Your visible priorities are clear. Add something only when it matters.</p><Link href="/tasks" className="focus-ring group mt-7 inline-flex items-center gap-3 text-sm font-medium text-primary">Review tasks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>
          )}
        </section>
        <section className="instrument-panel lg:col-span-5" aria-labelledby="flow-title"><TodayFlow data={data} habitProgress={habitProgress} taskProgress={taskProgress} /></section>
      </div>

      <div className="instrument-grid grid gap-3 border-b border-white/[0.08] py-3 lg:grid-cols-12">
        <section className="instrument-panel lg:col-span-4" aria-label="Current Life Score"><LifeState data={data} reducedMotion={!!reduceMotion} /></section>
        <section className="instrument-panel lg:col-span-5" aria-labelledby="observed-title">
          <FieldLabel>Observed</FieldLabel>
          <div className="mt-6"><AnimatePresence mode="popLayout">{visibleInsights.length ? visibleInsights.slice(0, 3).map((insight, index) => (
            <motion.article key={insight.title} layout initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: 0.32, ease }} className="group relative border-t border-white/[0.08] py-5 pr-10 first:border-t-0 first:pt-0">
              <h3 id={index === 0 ? "observed-title" : undefined} className={cn("font-display font-medium tracking-[-0.035em]", index === 0 ? "text-3xl leading-tight md:text-4xl" : "text-xl")}>{insight.title}</h3><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{insight.message}</p>{insight.action && <p className="mt-4 text-sm font-medium text-primary">{insight.action}</p>}<button onClick={() => setDismissed((current) => new Set([...current, insight.title]))} className="focus-ring absolute right-0 top-3 flex h-9 w-9 items-center justify-center text-muted-foreground opacity-70 transition-opacity hover:text-foreground md:opacity-0 md:group-hover:opacity-100" aria-label={`Dismiss ${insight.title}`}><X className="h-4 w-4" /></button>
            </motion.article>
          )) : <motion.div key="empty-observation" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}><h3 id="observed-title" className="font-display text-3xl font-medium leading-tight tracking-[-0.04em] text-foreground/82 md:text-4xl">No pattern yet.</h3><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">As you record more days, changes worth noticing will appear here.</p><Link href="/journal" className="focus-ring group mt-6 inline-flex items-center gap-3 text-sm font-medium text-primary">Add today’s context <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></motion.div>}</AnimatePresence></div>
        </section>
        <section className="instrument-panel lg:col-span-3" aria-labelledby="next-title"><FieldLabel>Next</FieldLabel><Upcoming data={data} /></section>
      </div>

      <Trajectory data={data} />
    </motion.div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}

function AttentionRow({ item, index, reducedMotion, primary }: { item: FocusItem; index: number; reducedMotion: boolean; primary: boolean }) {
  return (
    <motion.button initial={reducedMotion ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04, duration: 0.28, ease }} onClick={item.onToggle} aria-pressed={item.checked} className="focus-ring group grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-white/[0.08] py-3.5 text-left md:py-4">
      <span className={cn("relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors", item.checked ? "border-primary bg-primary text-primary-foreground" : "border-white/[0.2] text-transparent group-hover:border-primary group-hover:text-primary/40")}><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
      <span className="min-w-0"><span className={cn("block truncate font-display font-medium tracking-[-0.02em]", primary ? "text-lg md:text-xl" : "text-base", item.checked && "text-muted-foreground line-through")}>{item.title}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">{item.meta}</span></span>
      <span className="font-mono text-[9px] tabular-nums text-muted-foreground/50">{String(index + 1).padStart(2, "0")}</span>
    </motion.button>
  );
}

function MetricCell({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return <div className="bg-black/25 p-3.5 backdrop-blur-md"><span className="block font-mono text-[7px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span><span className="mt-2 flex items-baseline gap-2"><strong className="ice-emphasis font-display text-2xl font-medium tabular-nums tracking-[-0.04em]">{value}</strong><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{suffix}</span></span></div>;
}

function LifeProfile({ data, reducedMotion, compact = false }: { data: DashboardData; reducedMotion: boolean; compact?: boolean }) {
  const dimensions = [
    ["Habits", data.lifeScore.breakdown.habits ?? 0],
    ["Tasks", data.lifeScore.breakdown.tasks ?? 0],
    ["Goals", data.lifeScore.breakdown.goals ?? 0],
    ["Mood", data.lifeScore.breakdown.mood ?? 0],
    ["Movement", data.lifeScore.breakdown.workout ?? 0],
  ] as const;
  return <div className={cn("space-y-3", compact && "space-y-2.5")}>{dimensions.map(([label, value], index) => <div key={label} className="grid grid-cols-[66px_1fr_24px] items-center gap-2"><span className="font-mono text-[7px] uppercase tracking-[0.13em] text-muted-foreground">{label}</span><span className="h-px overflow-hidden bg-white/[0.1]"><motion.span initial={reducedMotion ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.55, delay: index * 0.045, ease }} style={{ width: `${Math.max(1, value)}%` }} className="block h-full origin-left bg-primary" /></span><span className="text-right font-mono text-[8px] tabular-nums text-foreground/70">{value}</span></div>)}</div>;
}

function TodayFlow({ data, habitProgress, taskProgress }: { data: DashboardData; habitProgress: number; taskProgress: number }) {
  const rows = [
    { label: "Tasks", value: data.tasks.total ? `${data.tasks.done} of ${data.tasks.total} complete` : "No tasks recorded", progress: taskProgress },
    { label: "Habits", value: data.habits.total ? `${data.habits.completed} of ${data.habits.total} complete` : "No habits recorded", progress: habitProgress },
    { label: "Goals", value: data.goals.length ? `${data.goals.length} active` : "No active goals", progress: data.goals.length ? Math.round(data.goals.reduce((sum, goal) => sum + goal.progress, 0) / data.goals.length) : 0 },
  ];
  return <div><FieldLabel>Today’s flow</FieldLabel><h3 id="flow-title" className="mt-5 font-display text-3xl font-medium tracking-[-0.04em]">Your day in motion.</h3><div className="mt-7 space-y-5">{rows.map((row) => <div key={row.label}><div className="flex items-end justify-between gap-4"><span className="text-sm text-foreground/82">{row.label}</span><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">{row.value}</span></div><div className="mt-2 h-px bg-white/[0.1]"><div className="ice-filament h-px" style={{ width: `${Math.max(row.progress, row.progress ? 3 : 0)}%` }} /></div></div>)}</div><div className="mt-8 grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.08]"><div className="bg-black/25 p-4 backdrop-blur-md"><span className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground">Mood</span><p className="mt-2 text-sm text-foreground/82">{data.mood ? `${data.mood.score}/10${data.mood.label ? ` · ${data.mood.label}` : ""}` : "Not logged today"}</p></div><div className="bg-black/25 p-4 backdrop-blur-md"><span className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground">Movement</span><p className="mt-2 text-sm text-foreground/82">{data.recentWorkout?.name || "No recent workout"}</p></div></div></div>;
}

function LifeState({ data, reducedMotion }: { data: DashboardData; reducedMotion: boolean }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-5">
        <div><FieldLabel>Life Score</FieldLabel><motion.p initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="ice-emphasis mt-3 font-display text-[clamp(5.8rem,11vw,9rem)] font-semibold leading-[0.72] tracking-[-0.075em] text-primary">{data.lifeScore.total}</motion.p></div>
        <p className="pt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Grade <span className="text-foreground">{data.lifeScore.grade}</span></p>
      </div>
      <div className="mt-10"><LifeProfile data={data} reducedMotion={reducedMotion} /></div>
      <p className="mt-9 border-l border-white/[0.12] pl-4 text-sm leading-relaxed text-muted-foreground">{stateDirection(data)}</p>
    </div>
  );
}

function Upcoming({ data }: { data: DashboardData }) {
  const items = useMemo(() => {
    const tasks = data.tasks.list.filter((task) => task.status !== "DONE" && task.dueDate).map((task) => ({ id: `task-${task.id}`, title: task.title, date: task.dueDate!, kind: "Task", href: "/tasks" }));
    const goals = data.goals.filter((goal) => goal.targetDate).map((goal) => ({ id: `goal-${goal.id}`, title: goal.title, date: goal.targetDate!, kind: "Goal", href: "/goals" }));
    return [...tasks, ...goals].sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 4);
  }, [data]);

  if (!items.length) return <div className="mt-8"><CalendarClock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} /><h3 id="next-title" className="mt-5 font-display text-3xl font-medium leading-tight tracking-[-0.04em] text-foreground/82">The horizon is clear.</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Dated tasks and goal deadlines will appear here.</p><Link href="/goals" className="focus-ring group mt-6 inline-flex items-center gap-3 text-sm font-medium text-primary">Set a target date <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>;

  return <div className="mt-7 border-t border-white/[0.08]">{items.map((item, index) => <Link key={item.id} href={item.href} className="focus-ring group grid grid-cols-[42px_1fr] gap-3 border-b border-white/[0.08] py-4"><span className="font-mono text-[9px] tabular-nums text-primary">{String(index + 1).padStart(2, "0")}</span><span><span id={index === 0 ? "next-title" : undefined} className="block font-display text-lg font-medium tracking-[-0.025em]">{item.title}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">{item.kind} · {formatDeadline(item.date)}</span></span></Link>)}</div>;
}

function Trajectory({ data }: { data: DashboardData }) {
  return (
    <section className="grid gap-7 py-10 md:grid-cols-[170px_1fr_auto] md:items-end md:py-12" aria-labelledby="trajectory-title">
      <div><FieldLabel>Trajectory</FieldLabel><h3 id="trajectory-title" className="mt-2 font-display text-2xl font-medium tracking-[-0.035em]">Your rhythms</h3></div>
      <p className="max-w-4xl text-pretty font-display text-xl leading-relaxed tracking-[-0.025em] text-foreground/55 md:text-2xl">
        <TrajectoryValue value={data.streaks.habits} /> habit days · <TrajectoryValue value={data.streaks.journal} /> journal days · <TrajectoryValue value={data.streaks.workout} /> training this week · <TrajectoryValue value={data.streaks.mood} /> mood days
      </p>
      <Link href="/statistics" className="focus-ring group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
    </section>
  );
}

function TrajectoryValue({ value }: { value: number }) { return <span className="font-semibold tabular-nums text-foreground">{value}</span>; }
function BriefingSkeleton() { return <div className="space-y-2" aria-label="Loading Novus briefing"><div className="os-skeleton h-4 w-full max-w-xl" /><div className="os-skeleton h-4 w-4/5 max-w-lg" /></div>; }
function NowSkeleton() { return <div className="pb-8"><div className="grid min-h-[300px] gap-8 border-b border-white/[0.08] py-10 lg:grid-cols-12"><div className="os-skeleton h-3 w-24 lg:col-span-2" /><div className="lg:col-span-7"><div className="os-skeleton h-20 w-4/5" /><div className="mt-8 os-skeleton h-4 w-3/5" /></div></div><div className="grid gap-10 border-b border-white/[0.08] py-12 lg:grid-cols-12"><div className="os-skeleton h-64 lg:col-span-8" /><div className="os-skeleton h-64 lg:col-span-4" /></div></div>; }
function LoadFailure({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><Circle className="h-7 w-7 text-muted-foreground" /><h2 className="mt-5 font-display text-2xl font-semibold">Now could not be loaded.</h2><p className="mt-2 text-sm text-muted-foreground">Your data was not changed.</p><button onClick={onRetry} className="focus-ring mt-6 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><RefreshCw className="h-4 w-4" />Try again</button></div>; }

function greeting(clock: Date | null) { const hour = clock?.getHours() ?? new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; }
function timeContext(clock: Date | null) { return (clock ?? new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }
function formatTime(clock: Date) { return clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function buildCurrentSummary(data: DashboardData) { const remainingHabits = Math.max(0, data.habits.total - data.habits.completed); const remainingTasks = Math.max(0, data.tasks.total - data.tasks.done); if (!data.habits.total && !data.tasks.total && !data.goals.length) return "You have no open tasks, habits, or goals yet. Add one when you’re ready."; const parts = [`${remainingTasks} open ${remainingTasks === 1 ? "task" : "tasks"}`, `${remainingHabits} ${remainingHabits === 1 ? "habit" : "habits"} left today`]; if (data.goals.length) parts.push(`${data.goals.length} active ${data.goals.length === 1 ? "goal" : "goals"}`); return `${parts.join(", ")}. Your Life Score is ${data.lifeScore.total}.`; }
function stateDirection(data: DashboardData) { if (!data.habits.total && !data.tasks.total && !data.goals.length && !data.mood) return "Your score will take shape as you begin recording daily life."; const remaining = Math.max(0, data.tasks.total - data.tasks.done) + Math.max(0, data.habits.total - data.habits.completed); return remaining ? `${remaining} visible ${remaining === 1 ? "commitment remains" : "commitments remain"} in today’s state.` : "Today’s visible commitments are complete."; }
function taskMeta(task: TaskItem) { const parts = [task.priority ? `${titleCase(task.priority)} priority` : "Task"]; if (task.dueDate) parts.push(formatDeadline(task.dueDate)); return parts.join(" · "); }
function titleCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function formatDeadline(value: string) { const date = new Date(value); const today = new Date(); const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1); if (date.toDateString() === today.toDateString()) return "Today"; if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"; return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
