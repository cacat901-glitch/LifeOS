"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { AIStatusBadge } from "@/components/shared/ai-status";
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

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: i * 0.08 } }),
};

const INSIGHT_COLORS = {
  warning:     { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  icon: "⚠️" },
  opportunity: { bg: "bg-sky-500/10",    border: "border-sky-500/30",    text: "text-sky-400",    icon: "💡" },
  celebration: { bg: "bg-emerald-500/10",border: "border-emerald-500/30",text: "text-emerald-400",icon: "🎉" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { setCommandOpen } = useAppStore();
  const [data, setData]                     = useState<DashboardData | null>(null);
  const [briefing, setBriefing]             = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [insights, setInsights]             = useState<PredictiveInsight[]>([]);
  const [loading, setLoading]               = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const fetchDashboard = useCallback(async () => {
    try { const r = await fetch("/api/dashboard"); if (r.ok) setData(await r.json()); }
    finally { setLoading(false); }
  }, []);

  const fetchBriefing = useCallback(async () => {
    try { const r = await fetch("/api/ai/briefing"); if (r.ok) { const d = await r.json(); setBriefing(d.briefing || ""); } }
    finally { setBriefingLoading(false); }
  }, []);

  const fetchInsights = useCallback(async () => {
    try { const r = await fetch("/api/ai/insights"); if (r.ok) { const d = await r.json(); setInsights(d.insights || []); } }
    catch { /* silent — insights are non-critical */ }
  }, []);

  useEffect(() => { fetchDashboard(); fetchBriefing(); fetchInsights(); }, [fetchDashboard, fetchBriefing, fetchInsights]);

  const toggleHabit = async (id: string, done: boolean) => {
    await fetch("/api/habits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId: id, completed: !done }) });
    fetchDashboard();
  };
  const toggleTask = async (id: string, status: string) => {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id, status: status === "DONE" ? "TODO" : "DONE" }) });
    fetchDashboard();
  };

  if (loading) return <DashboardSkeleton />;

  const d = data!;
  const lifeScore = d?.lifeScore ?? { total: 0, grade: "—", breakdown: {} };
  const habits = d?.habits ?? { list: [], completed: 0, total: 0, bestStreak: 0 };
  const tasks  = d?.tasks  ?? { list: [], done: 0, total: 0 };
  const goals  = d?.goals  ?? [];
  const streaks = d?.streaks ?? { habits: 0, journal: 0, workout: 0, mood: 0 };
  const visibleInsights = insights.filter(i => !dismissedInsights.has(i.title));

  return (
    <div className="space-y-6 pb-12">

      {/* ══ PREDICTIVE INSIGHTS ══ */}
      <AnimatePresence>
        {visibleInsights.map((insight) => {
          const s = INSIGHT_COLORS[insight.type];
          return (
            <motion.div key={insight.title}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease }}
              className={cn("flex items-start gap-3 p-4 rounded-2xl border text-sm", s.bg, s.border)}>
              <span className="text-lg shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("font-semibold", s.text)}>{insight.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{insight.message}</p>
                <p className={cn("mt-1.5 text-xs font-medium", s.text)}>{insight.action}</p>
              </div>
              <button onClick={() => setDismissedInsights(p => new Set(Array.from(p).concat(insight.title)))}
                className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 tap-small">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ══ AI BRIEFING ══ */}
      <motion.section variants={fadeUp} initial="hidden" animate="show"
        className="relative overflow-hidden rounded-[24px] glass-panel p-5 sm:p-7 md:p-9">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <div className="relative shrink-0">
            <div className="pulse-ring relative"><NovusMark size="md" /></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium tracking-wide uppercase text-primary/80">Novus Briefing</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
              <AIStatusBadge variant="dot" className="ml-auto" />
            </div>
            {briefingLoading ? (
              <div className="space-y-2.5 max-w-2xl">
                {[3, 4, 2].map((w, i) => <div key={i} className={`h-5 w-${w}/4 rounded-lg shimmer`} />)}
              </div>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                className="text-base md:text-xl lg:text-2xl leading-relaxed font-medium text-balance max-w-3xl text-foreground/90">
                {briefing}
              </motion.p>
            )}
            <div className="flex flex-wrap gap-2 mt-5">
              <ActionChip label="Ask Novus" onClick={() => setCommandOpen(true)} primary icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <ActionChip label="Weekly Review" onClick={() => router.push("/review")} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              <ActionChip label="Analyze My Life" onClick={() => router.push("/analyst")} icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══ VITAL SIGNS ══ */}
      <motion.section variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <VitalCard i={0} label="Life Score"   value={String(lifeScore.total)}           sub={`Grade ${lifeScore.grade}`}                                          accent="from-indigo-500 to-violet-500" />
        <VitalCard i={1} label="Habits today" value={`${habits.completed}/${habits.total}`} sub={habits.bestStreak > 0 ? `${habits.bestStreak}-day streak` : "Start today"} accent="from-emerald-500 to-teal-500" />
        <VitalCard i={2} label="Tasks left"   value={String(Math.max(tasks.total - tasks.done, 0))} sub={`${tasks.done} done`}                                   accent="from-sky-500 to-cyan-500" />
        <VitalCard i={3} label="Mood"         value={d?.mood ? d.mood.emoji : "—"}      sub={d?.mood ? d.mood.label : "Not logged"}                              accent="from-pink-500 to-rose-500" />
      </motion.section>

      {/* ══ MAIN GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Today's rhythm */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="lg:col-span-2 glass-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today&apos;s rhythm</h3>
            <Link href="/habits" className="text-xs text-primary hover:underline">Open habits</Link>
          </div>
          {habits.list.length === 0 ? (
            <EmptyHint icon="✦" text="No habits yet. Design the rhythm of your days." action="Create a habit" href="/habits" />
          ) : (
            <div className="space-y-1">
              {habits.list.map((h, i) => (
                <motion.button key={h.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => toggleHabit(h.id, h.isCompleted)}
                  className="w-full group flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors text-left">
                  <span className={cn("w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                    h.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 group-hover:border-primary")}>
                    {h.isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <span className="text-lg">{h.icon || "✦"}</span>
                  <span className={cn("flex-1 text-sm font-medium", h.isCompleted && "line-through text-muted-foreground")}>{h.name}</span>
                  {h.streak > 0 && <span className="text-xs text-muted-foreground">{h.streak}d</span>}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Life Score ring */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="glass-panel rounded-[24px] p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Life Score</h3>
            <Link href="/analyst" className="text-xs text-primary hover:underline">Explain</Link>
          </div>
          <div className="flex items-center justify-center py-2">
            <ScoreRing value={lifeScore.total} grade={lifeScore.grade} />
          </div>
          <div className="space-y-2 mt-4">
            {[
              { label: "Habits",  key: "habits",  c: "bg-emerald-500" },
              { label: "Tasks",   key: "tasks",   c: "bg-sky-500" },
              { label: "Goals",   key: "goals",   c: "bg-violet-500" },
              { label: "Mood",    key: "mood",    c: "bg-pink-500" },
              { label: "Workout", key: "workout", c: "bg-amber-500" },
            ].map(({ label, key, c }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div className={cn("h-full rounded-full", c)}
                    initial={{ width: 0 }} animate={{ width: `${lifeScore.breakdown[key] ?? 0}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.3 }} />
                </div>
                <span className="text-xs font-medium w-7 text-right">{lifeScore.breakdown[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══ SECOND GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Tasks */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="glass-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Focus</h3>
            <Link href="/tasks" className="text-xs text-primary hover:underline">All tasks</Link>
          </div>
          {tasks.list.length === 0 ? (
            <EmptyHint icon="◎" text="Nothing on deck." action="Add a task" href="/tasks" small />
          ) : (
            <div className="space-y-1">
              {tasks.list.map((t) => (
                <button key={t.id} onClick={() => toggleTask(t.id, t.status)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left">
                  <span className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                    t.status === "DONE" ? "bg-primary border-primary text-white" : "border-muted-foreground/30")}>
                    {t.status === "DONE" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <span className={cn("flex-1 text-sm", t.status === "DONE" && "line-through text-muted-foreground")}>{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Goals */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="glass-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Trajectory</h3>
            <Link href="/goals" className="text-xs text-primary hover:underline">All goals</Link>
          </div>
          {goals.length === 0 ? (
            <EmptyHint icon="✧" text="No goals set." action="Set a goal" href="/goals" small />
          ) : (
            <div className="space-y-3.5">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate pr-2">{g.title}</span>
                    <span className="text-muted-foreground shrink-0">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.8, ease }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Streaks + AI shortcuts */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="glass-panel rounded-[24px] p-5 md:p-6">
          <h3 className="font-semibold mb-4">Momentum</h3>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[
              { label: "Habits",  v: streaks.habits,  icon: "✦" },
              { label: "Journal", v: streaks.journal, icon: "✎" },
              { label: "Workout", v: streaks.workout, icon: "⟁" },
              { label: "Mood",    v: streaks.mood,    icon: "♡" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-muted/30 p-3 text-center">
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-xl font-semibold gradient-text">{s.v}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          {/* AI quick actions */}
          <div className="space-y-1.5 border-t border-border/40 pt-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Novus AI</p>
            {[
              { label: "Weekly Review",     href: "/review",   icon: "📊" },
              { label: "Analyze My Life",   href: "/analyst",  icon: "🧠" },
              { label: "Ask Novus",         action: () => setCommandOpen(true), icon: "✦" },
            ].map((item) => (
              item.action
                ? <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-left text-sm">
                    <span>{item.icon}</span><span className="text-muted-foreground">{item.label}</span>
                  </button>
                : <Link key={item.label} href={item.href!}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-sm">
                    <span>{item.icon}</span><span className="text-muted-foreground">{item.label}</span>
                  </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function ActionChip({ label, onClick, icon, primary }: { label: string; onClick: () => void; icon: string; primary?: boolean }) {
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium transition-all",
      primary ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.8)] hover:opacity-90"
              : "bg-muted/50 hover:bg-muted text-foreground border border-border/50")}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon}/></svg>
      {label}
    </button>
  );
}

function VitalCard({ i, label, value, sub, accent }: { i: number; label: string; value: string; sub: string; accent: string }) {
  return (
    <motion.div variants={fadeUp} custom={i} className="relative glass-panel rounded-[20px] p-4 overflow-hidden lift">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-80", accent)} />
      <p className="text-[10px] text-muted-foreground mb-1.5">{label}</p>
      <p className="text-2xl md:text-3xl font-semibold tracking-tight truncate">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>
    </motion.div>
  );
}

function ScoreRing({ value, grade }: { value: number; grade: string }) {
  const r = 52; const circ = 2 * Math.PI * r; const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8"/>
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#sg)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease }}/>
        <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8"/><stop offset="50%" stopColor="#a855f7"/><stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient></defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">Grade {grade}</span>
      </div>
    </div>
  );
}

function EmptyHint({ icon, text, action, href, small }: { icon: string; text: string; action: string; href: string; small?: boolean }) {
  return (
    <div className={cn("text-center", small ? "py-5" : "py-8")}>
      <div className="text-xl mb-2 text-muted-foreground">{icon}</div>
      <p className="text-sm text-muted-foreground mb-2">{text}</p>
      <Link href={href} className="text-sm font-medium text-primary hover:underline">{action} →</Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 rounded-[24px] shimmer"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[20px] shimmer"/>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-[24px] shimmer"/>
        <div className="h-64 rounded-[24px] shimmer"/>
      </div>
    </div>
  );
}
