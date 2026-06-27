"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CalendarCheck,
  Brain,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Lightbulb,
  PartyPopper,
  Flame,
  BookOpen,
  Dumbbell,
  Heart,
  Target,
  ListTodo,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { AIStatusBadge } from "@/components/shared/ai-status";
import { Discoveries } from "@/components/novus/discoveries";
import { cn } from "@/lib/utils";

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

interface PredictiveInsight {
  type: "warning" | "opportunity" | "celebration";
  title: string;
  message: string;
  action: string;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: i * 0.07 } }),
};

const INSIGHT_STYLE: Record<PredictiveInsight["type"], { border: string; text: string; icon: LucideIcon }> = {
  warning: { border: "border-amber-500/25", text: "text-amber-400", icon: AlertTriangle },
  opportunity: { border: "border-sky-500/25", text: "text-sky-400", icon: Lightbulb },
  celebration: { border: "border-primary/30", text: "text-primary", icon: PartyPopper },
};

export default function DashboardPage() {
  const router = useRouter();
  const { setNovusOpen } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const fetchDashboard = useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard");
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
    try {
      const r = await fetch("/api/ai/briefing");
      if (r.ok) {
        const d = await r.json();
        setBriefing(d.briefing || "");
      }
    } finally {
      setBriefingLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const r = await fetch("/api/ai/insights");
      if (r.ok) {
        const d = await r.json();
        setInsights(d.insights || []);
      }
    } catch {
      /* silent — insights are non-critical */
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchBriefing();
    fetchInsights();
  }, [fetchDashboard, fetchBriefing, fetchInsights]);

  const toggleHabit = async (id: string, done: boolean) => {
    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: id, completed: !done }),
    });
    fetchDashboard();
  };
  const toggleTask = async (id: string, status: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id, status: status === "DONE" ? "TODO" : "DONE" }),
    });
    fetchDashboard();
  };

  if (loading) return <DashboardSkeleton />;

  const d = data!;
  const lifeScore = d?.lifeScore ?? { total: 0, grade: "—", breakdown: {} };
  const habits = d?.habits ?? { list: [], completed: 0, total: 0, bestStreak: 0 };
  const tasks = d?.tasks ?? { list: [], done: 0, total: 0 };
  const goals = d?.goals ?? [];
  const streaks = d?.streaks ?? { habits: 0, journal: 0, workout: 0, mood: 0 };
  const visibleInsights = insights.filter((i) => !dismissedInsights.has(i.title));
  const firstName = (d?.user?.name || "there").split(" ")[0];

  return (
    <div className="space-y-5 pb-12">
      {/* ══ PREDICTIVE INSIGHTS ══ */}
      <AnimatePresence>
        {visibleInsights.map((insight) => {
          const s = INSIGHT_STYLE[insight.type];
          const Icon = s.icon;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease }}
              className={cn("flex items-start gap-3 rounded-xl border bg-card/50 p-4 text-sm", s.border)}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.text)} strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", s.text)}>{insight.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{insight.message}</p>
                <p className={cn("mt-1.5 text-xs font-medium", s.text)}>{insight.action}</p>
              </div>
              <button
                onClick={() => setDismissedInsights((p) => new Set(Array.from(p).concat(insight.title)))}
                className="tap-small mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ══ AI BRIEFING ══ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-border bg-card/60 p-5 sm:p-7 md:p-8"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Novus Briefing
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:inline">
            · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" })}
          </span>
          <AIStatusBadge variant="dot" className="ml-auto" />
        </div>

        {briefingLoading ? (
          <div className="max-w-2xl space-y-2.5">
            <div className="h-5 w-3/4 rounded-lg shimmer" />
            <div className="h-5 w-full rounded-lg shimmer" />
            <div className="h-5 w-1/2 rounded-lg shimmer" />
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-balance font-display text-xl font-medium leading-snug text-foreground md:text-2xl lg:text-[1.7rem]"
          >
            {briefing || `Good to see you, ${firstName}. Let's make today count.`}
          </motion.p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <ActionChip label="Ask Novus" onClick={() => setNovusOpen(true)} icon={Sparkles} primary />
          <ActionChip label="Weekly Review" onClick={() => router.push("/review")} icon={CalendarCheck} />
          <ActionChip label="Analyze my life" onClick={() => router.push("/analyst")} icon={Brain} />
        </div>
      </motion.section>

      {/* ══ DISCOVERIES (proactive AI) ══ */}
      <Discoveries limit={3} />

      {/* ══ VITAL SIGNS ══ */}
      <motion.section
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <VitalCard i={0} icon={Target} label="Life Score" value={String(lifeScore.total)} sub={`Grade ${lifeScore.grade}`} accent />
        <VitalCard i={1} icon={Flame} label="Habits today" value={`${habits.completed}/${habits.total}`} sub={habits.bestStreak > 0 ? `${habits.bestStreak}-day streak` : "Start today"} />
        <VitalCard i={2} icon={ListTodo} label="Tasks left" value={String(Math.max(tasks.total - tasks.done, 0))} sub={`${tasks.done} done today`} />
        <VitalCard i={3} icon={Smile} label="Mood" value={d?.mood ? d.mood.emoji : "—"} sub={d?.mood ? d.mood.label : "Not logged"} />
      </motion.section>

      {/* ══ MAIN GRID ══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's rhythm */}
        <Card i={1} className="lg:col-span-2">
          <CardHead title="Today's rhythm" link={{ href: "/habits", label: "Open habits" }} />
          {habits.list.length === 0 ? (
            <EmptyHint icon={Flame} text="No habits yet. Design the rhythm of your days." action="Create a habit" href="/habits" />
          ) : (
            <div className="space-y-0.5">
              {habits.list.map((h, i) => (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleHabit(h.id, h.isCompleted)}
                  className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-secondary/50"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all",
                      h.isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border group-hover:border-primary/60"
                    )}
                  >
                    {h.isCompleted && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="text-base">{h.icon || "•"}</span>
                  <span className={cn("flex-1 text-sm font-medium", h.isCompleted && "text-muted-foreground line-through")}>
                    {h.name}
                  </span>
                  {h.streak > 0 && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{h.streak}d</span>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </Card>

        {/* Life Score ring */}
        <Card i={2} className="flex flex-col">
          <CardHead title="Life Score" link={{ href: "/analyst", label: "Explain" }} />
          <div className="flex items-center justify-center py-2">
            <ScoreRing value={lifeScore.total} grade={lifeScore.grade} />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: "Habits", key: "habits" },
              { label: "Tasks", key: "tasks" },
              { label: "Goals", key: "goals" },
              { label: "Mood", key: "mood" },
              { label: "Workout", key: "workout" },
            ].map(({ label, key }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-14 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${lifeScore.breakdown[key] ?? 0}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.3 }}
                  />
                </div>
                <span className="w-7 text-right text-xs font-medium tabular-nums">{lifeScore.breakdown[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ SECOND GRID ══ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tasks */}
        <Card i={3}>
          <CardHead title="Focus" link={{ href: "/tasks", label: "All tasks" }} />
          {tasks.list.length === 0 ? (
            <EmptyHint icon={ListTodo} text="Nothing on deck." action="Add a task" href="/tasks" small />
          ) : (
            <div className="space-y-0.5">
              {tasks.list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id, t.status)}
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-secondary/50"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      t.status === "DONE" ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}
                  >
                    {t.status === "DONE" && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={cn("flex-1 text-sm", t.status === "DONE" && "text-muted-foreground line-through")}>
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Goals */}
        <Card i={4}>
          <CardHead title="Trajectory" link={{ href: "/goals", label: "All goals" }} />
          {goals.length === 0 ? (
            <EmptyHint icon={Target} text="No goals set." action="Set a goal" href="/goals" small />
          ) : (
            <div className="space-y-3.5">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="truncate pr-2 font-medium">{g.title}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${g.progress}%` }}
                      transition={{ duration: 0.8, ease }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Momentum + AI shortcuts */}
        <Card i={5}>
          <h3 className="mb-4 font-display text-base font-semibold">Momentum</h3>
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            {[
              { label: "Habits", v: streaks.habits, icon: Flame },
              { label: "Journal", v: streaks.journal, icon: BookOpen },
              { label: "Workout", v: streaks.workout, icon: Dumbbell },
              { label: "Mood", v: streaks.mood, icon: Heart },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                  <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <div className="font-display text-xl font-semibold text-primary">{s.v}</div>
                  <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-0.5 border-t border-border pt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Novus AI</p>
            {[
              { label: "Weekly Review", href: "/review", icon: CalendarCheck },
              { label: "Analyze my life", href: "/analyst", icon: Brain },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setNovusOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
              Ask Novus
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function Card({ children, className, i = 0 }: { children: React.ReactNode; className?: string; i?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={i}
      className={cn("rounded-2xl border border-border bg-card/60 p-5 md:p-6", className)}
    >
      {children}
    </motion.div>
  );
}

function CardHead({ title, link }: { title: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {link && (
        <Link href={link.href} className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-primary">
          {link.label}
        </Link>
      )}
    </div>
  );
}

function ActionChip({ label, onClick, icon: Icon, primary }: { label: string; onClick: () => void; icon: LucideIcon; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "border border-border bg-secondary/40 text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
      {label}
    </button>
  );
}

function VitalCard({ i, icon: Icon, label, value, sub, accent }: { i: number; icon: LucideIcon; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-border/80"
    >
      {accent && <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground/60")} strokeWidth={1.75} />
      </div>
      <p className="truncate font-display text-2xl font-semibold tracking-tight md:text-3xl">{value}</p>
      <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function ScoreRing({ value, grade }: { value: number; grade: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Grade {grade}</span>
      </div>
    </div>
  );
}

function EmptyHint({ icon: Icon, text, action, href, small }: { icon: LucideIcon; text: string; action: string; href: string; small?: boolean }) {
  return (
    <div className={cn("text-center", small ? "py-5" : "py-8")}>
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
      <p className="mb-2 text-sm text-muted-foreground">{text}</p>
      <Link href={href} className="text-sm font-medium text-primary hover:underline">
        {action} →
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-44 rounded-2xl shimmer" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 rounded-2xl shimmer lg:col-span-2" />
        <div className="h-64 rounded-2xl shimmer" />
      </div>
    </div>
  );
}
