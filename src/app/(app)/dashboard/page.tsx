"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Brain, CalendarClock, Check, ChevronRight, Circle, Clock3,
  Dumbbell, Flame, ListTodo, NotebookPen, RefreshCw, Smile, Sparkles,
  Target, TrendingUp, X, type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

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

const spring = { type: "spring" as const, stiffness: 390, damping: 32 };
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

  const fetchDashboard = useCallback(async () => {
    const response = await fetch("/api/dashboard");
    if (response.ok) setData(await response.json());
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch("/api/dashboard").then((r) => r.ok ? r.json() : null),
      fetch("/api/ai/briefing").then((r) => r.ok ? r.json() : null),
      fetch("/api/ai/insights").then((r) => r.ok ? r.json() : null),
    ]).then(([dashboardResult, briefingResult, insightsResult]) => {
      if (!active) return;
      if (dashboardResult.status === "fulfilled" && dashboardResult.value) setData(dashboardResult.value);
      if (briefingResult.status === "fulfilled") setBriefing(briefingResult.value?.briefing || "");
      if (insightsResult.status === "fulfilled") setInsights(insightsResult.value?.insights || []);
      setLoading(false); setBriefingLoading(false);
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
  const focusItems = [
    ...openTasks.slice(0, 3).map((item) => ({ kind: "task" as const, item })),
    ...openHabits.slice(0, Math.max(0, 4 - Math.min(openTasks.length, 3))).map((item) => ({ kind: "habit" as const, item })),
  ].slice(0, 4);
  const fallbackSummary = buildCurrentSummary(data);

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="pb-10">
      <section className="relative min-h-[420px] overflow-hidden border-b border-white/[0.07] pb-10 pt-6 md:min-h-[510px] md:pb-14 md:pt-10">
        <div className="life-horizon pointer-events-none absolute inset-x-[-20%] bottom-[-52%] h-[78%] rounded-[50%]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{timeContext()}</p>
            <h2 className="mt-4 text-balance font-display text-[clamp(3.25rem,9vw,8.25rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-foreground">
              {greeting()},<br />
              <span className="text-muted-foreground">{firstName || "welcome back"}.</span>
            </h2>
            <div className="mt-8 max-w-2xl md:mt-10">
              {briefingLoading ? <BriefingSkeleton /> : <p className="text-pretty text-base leading-relaxed text-foreground/78 md:text-xl md:leading-relaxed">{briefing || fallbackSummary}</p>}
            </div>
          </div>

          <button onClick={() => setNovusOpen(true)} className="focus-ring group self-end rounded-[24px] bg-white/[0.035] p-5 text-left transition-colors hover:bg-white/[0.065] md:p-6" aria-label="Ask Novus about your current state">
            <div className="flex items-center justify-between"><Sparkles className="h-5 w-5 text-primary" /><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div>
            <p className="mt-6 font-display text-xl font-medium tracking-[-0.02em]">Ask about what matters now</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Novus can explain this state or act on it.</p>
          </button>
        </div>
      </section>

      <CurrentState data={data} reducedMotion={!!reduceMotion} />

      <div className="grid border-b border-white/[0.07] lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]">
        <section className="py-10 lg:border-r lg:border-white/[0.07] lg:py-14 lg:pr-12 xl:pr-16">
          <SectionHeading label="What matters now" href="/tasks" action="Open tasks" />
          {focusItems.length ? (
            <div className="mt-7 divide-y divide-white/[0.07]">
              {focusItems.map((focus, index) => focus.kind === "task" ? (
                <FocusRow key={focus.item.id} index={index} title={focus.item.title} meta={taskMeta(focus.item)} checked={focus.item.status === "DONE"} icon={ListTodo} onToggle={() => toggleTask(focus.item)} reducedMotion={!!reduceMotion} />
              ) : (
                <FocusRow key={focus.item.id} index={index} title={focus.item.name} meta={focus.item.streak > 0 ? `${focus.item.streak}-day streak · Habit` : "Habit"} checked={focus.item.isCompleted} icon={Flame} onToggle={() => toggleHabit(focus.item)} reducedMotion={!!reduceMotion} />
              ))}
            </div>
          ) : <EditorialEmpty icon={Check} title="Nothing is asking for your attention." body="You have completed the visible priorities for now." href="/tasks" action="Review all tasks" />}
        </section>

        <section className="py-10 lg:py-14 lg:pl-12 xl:pl-16">
          <SectionHeading label="Up next" />
          <div className="mt-7 space-y-1">
            <UpNext data={data} />
          </div>
        </section>
      </div>

      <section className="border-b border-white/[0.07] py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em]">Novus noticed</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Signals derived from the life data you have recorded.</p>
          </div>
          <div>
            <AnimatePresence mode="popLayout">
              {visibleInsights.length ? visibleInsights.slice(0, 3).map((insight) => (
                <motion.article key={insight.title} layout initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="group relative border-t border-white/[0.07] py-5 pr-10 first:border-t-0 first:pt-0">
                  <p className="font-display text-xl font-medium tracking-[-0.02em] md:text-2xl">{insight.title}</p>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{insight.message}</p>
                  {insight.action && <p className="mt-3 text-sm font-medium text-primary">{insight.action}</p>}
                  <button onClick={() => setDismissed((current) => new Set([...current, insight.title]))} className="focus-ring absolute right-0 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-70 hover:bg-white/[0.05] hover:text-foreground md:opacity-0 md:group-hover:opacity-100" aria-label={`Dismiss ${insight.title}`}><X className="h-4 w-4" /></button>
                </motion.article>
              )) : <motion.div key="empty-insight"><EditorialEmpty icon={Brain} title="No new pattern yet." body="As you record more days, Novus will surface meaningful changes here." href="/journal" action="Add today’s context" compact /></motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Momentum data={data} />
    </motion.div>
  );
}

function CurrentState({ data, reducedMotion }: { data: DashboardData; reducedMotion: boolean }) {
  const score = data.lifeScore.total;
  const breakdown = [
    ["Habits", data.lifeScore.breakdown.habits ?? 0], ["Tasks", data.lifeScore.breakdown.tasks ?? 0],
    ["Goals", data.lifeScore.breakdown.goals ?? 0], ["Mood", data.lifeScore.breakdown.mood ?? 0],
    ["Movement", data.lifeScore.breakdown.workout ?? 0],
  ] as const;
  return (
    <section className="border-b border-white/[0.07] py-9 md:py-12">
      <div className="grid gap-9 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center lg:gap-14">
        <div className="flex items-end gap-4">
          <motion.span initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="font-display text-[clamp(4.5rem,10vw,7rem)] font-semibold leading-[0.75] tracking-[-0.07em] text-primary">{score}</motion.span>
          <div className="pb-1"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Life Score</p><p className="mt-1 text-sm text-foreground">Grade {data.lifeScore.grade}</p></div>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-1" aria-hidden="true">
            {breakdown.map(([label, value], index) => <span key={label} className="h-px overflow-hidden bg-white/[0.1]"><motion.span initial={reducedMotion ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.65, delay: index * 0.05, ease }} style={{ width: `${Math.max(2, value)}%` }} className="block h-full origin-left bg-primary/70" /></span>)}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-5">
            {breakdown.map(([label, value]) => <div key={label}><div className="font-display text-xl font-semibold tabular-nums md:text-2xl">{value}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FocusRow({ title, meta, checked, icon: Icon, onToggle, index, reducedMotion }: { title: string; meta: string; checked: boolean; icon: LucideIcon; onToggle: () => void; index: number; reducedMotion: boolean }) {
  return <motion.button initial={reducedMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.045, duration: 0.35, ease }} onClick={onToggle} aria-pressed={checked} className="focus-ring group flex w-full items-center gap-4 py-4 text-left md:py-5"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all", checked ? "border-primary bg-primary text-primary-foreground" : "border-white/[0.13] text-muted-foreground group-hover:border-primary/50 group-hover:text-primary")}>{checked ? <Check className="h-4 w-4" strokeWidth={2.7} /> : <Icon className="h-4 w-4" strokeWidth={1.7} />}</span><span className="min-w-0 flex-1"><span className={cn("block truncate font-display text-lg font-medium tracking-[-0.02em] md:text-xl", checked && "text-muted-foreground line-through")}>{title}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{meta}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" /></motion.button>;
}

function UpNext({ data }: { data: DashboardData }) {
  const items = useMemo(() => {
    const taskItems = data.tasks.list.filter((task) => task.status !== "DONE" && task.dueDate).map((task) => ({ id: task.id, title: task.title, date: task.dueDate!, kind: "Task", href: "/tasks", icon: ListTodo }));
    const goalItems = data.goals.filter((goal) => goal.targetDate).map((goal) => ({ id: goal.id, title: goal.title, date: goal.targetDate!, kind: "Goal", href: "/goals", icon: Target }));
    return [...taskItems, ...goalItems].sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 4);
  }, [data]);
  if (!items.length) return <EditorialEmpty icon={CalendarClock} title="The horizon is clear." body="Dated tasks and goal deadlines will appear here." href="/goals" action="Set a target date" compact />;
  return <>{items.map((item) => { const Icon = item.icon; return <Link key={`${item.kind}-${item.id}`} href={item.href} className="focus-ring group flex items-center gap-3 rounded-[16px] px-1 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-white/[0.04] text-muted-foreground"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.title}</span><span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{item.kind} · {formatDeadline(item.date)}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1" /></Link>; })}</>;
}

function Momentum({ data }: { data: DashboardData }) {
  const signals = [
    { label: "Habit streak", value: data.streaks.habits, suffix: "days", icon: Flame },
    { label: "Journal rhythm", value: data.streaks.journal, suffix: "days", icon: NotebookPen },
    { label: "Training", value: data.streaks.workout, suffix: "this week", icon: Dumbbell },
    { label: "Mood logged", value: data.streaks.mood, suffix: "days", icon: Smile },
  ];
  return <section className="py-10 md:py-14"><SectionHeading label="Momentum" href="/statistics" action="See detail" /><div className="mt-8 grid grid-cols-2 gap-y-9 sm:grid-cols-4">{signals.map(({ label, value, suffix, icon: Icon }, index) => <div key={label} className={cn("relative pr-5 sm:px-6", index > 0 && "sm:border-l sm:border-white/[0.07]", index === 0 && "sm:pl-0")}><Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} /><div className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] md:text-5xl">{value}</div><div className="mt-2 text-sm font-medium">{label}</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{suffix}</div></div>)}</div></section>;
}

function SectionHeading({ label, href, action }: { label: string; href?: string; action?: string }) {
  return <div className="flex items-center justify-between gap-4"><h3 className="font-display text-2xl font-semibold tracking-[-0.035em] md:text-3xl">{label}</h3>{href && <Link href={href} className="focus-ring group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">{action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>}</div>;
}

function EditorialEmpty({ icon: Icon, title, body, href, action, compact }: { icon: LucideIcon; title: string; body: string; href: string; action: string; compact?: boolean }) {
  return <div className={cn("flex items-start gap-4", compact ? "py-5" : "py-10")}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.04] text-muted-foreground"><Icon className="h-4 w-4" /></span><div><p className="font-display text-lg font-medium">{title}</p><p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p><Link href={href} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">{action}<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>;
}

function BriefingSkeleton() { return <div className="space-y-2" aria-label="Loading Novus briefing"><div className="os-skeleton h-5 w-full max-w-xl rounded" /><div className="os-skeleton h-5 w-4/5 max-w-lg rounded" /></div>; }
function NowSkeleton() { return <div className="pb-10"><div className="min-h-[430px] border-b border-white/[0.07] py-10"><div className="os-skeleton h-3 w-28 rounded" /><div className="mt-6 os-skeleton h-32 w-4/5 max-w-3xl rounded-[20px]" /><div className="mt-9 os-skeleton h-5 w-3/5 max-w-xl rounded" /></div><div className="grid gap-8 border-b border-white/[0.07] py-12 lg:grid-cols-4">{[0,1,2,3].map((i) => <div key={i} className="os-skeleton h-20 rounded-[18px]" />)}</div></div>; }
function LoadFailure({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><Circle className="h-7 w-7 text-muted-foreground" /><h2 className="mt-5 font-display text-2xl font-semibold">Now could not be loaded.</h2><p className="mt-2 text-sm text-muted-foreground">Your data was not changed.</p><button onClick={onRetry} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><RefreshCw className="h-4 w-4" />Try again</button></div>; }

function greeting() { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; }
function timeContext() { return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }
function buildCurrentSummary(data: DashboardData) { const remainingHabits = Math.max(0, data.habits.total - data.habits.completed); const remainingTasks = Math.max(0, data.tasks.total - data.tasks.done); if (!data.habits.total && !data.tasks.total && !data.goals.length) return "Your operating system is ready. Begin with one habit, task, or goal and this space will form around your life."; const parts = [`${remainingTasks} open ${remainingTasks === 1 ? "task" : "tasks"}`, `${remainingHabits} ${remainingHabits === 1 ? "habit" : "habits"} left today`]; if (data.goals.length) parts.push(`${data.goals.length} active ${data.goals.length === 1 ? "goal" : "goals"}`); return `${parts.join(", ")}. Your Life Score is ${data.lifeScore.total}.`; }
function taskMeta(task: TaskItem) { const parts = [task.priority ? `${titleCase(task.priority)} priority` : "Task"]; if (task.dueDate) parts.push(formatDeadline(task.dueDate)); return parts.join(" · "); }
function titleCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function formatDeadline(value: string) { const date = new Date(value); const today = new Date(); const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1); if (date.toDateString() === today.toDateString()) return "Today"; if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"; return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
