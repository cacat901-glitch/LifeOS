"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
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

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: i * 0.08 } }),
};

export default function DashboardPage() {
  const router = useRouter();
  const { setCommandOpen } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState<string>("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  const fetchBriefing = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/briefing");
      if (res.ok) { const d = await res.json(); setBriefing(d.briefing || ""); }
    } finally { setBriefingLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); fetchBriefing(); }, [fetchDashboard, fetchBriefing]);

  const toggleHabit = async (habitId: string, done: boolean) => {
    await fetch("/api/habits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId, completed: !done }) });
    fetchDashboard();
  };
  const toggleTask = async (taskId: string, status: string) => {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, status: status === "DONE" ? "TODO" : "DONE" }) });
    fetchDashboard();
  };

  if (loading) return <DashboardSkeleton />;

  const d = data!;
  const lifeScore = d?.lifeScore ?? { total: 0, grade: "—", breakdown: {} };
  const habits = d?.habits ?? { list: [], completed: 0, total: 0, bestStreak: 0 };
  const tasks = d?.tasks ?? { list: [], done: 0, total: 0 };
  const goals = d?.goals ?? [];
  const streaks = d?.streaks ?? { habits: 0, journal: 0, workout: 0, mood: 0 };

  return (
    <div className="space-y-8 pb-12">

      {/* ════════ AI BRIEFING — the centerpiece ════════ */}
      <motion.section variants={fadeUp} initial="hidden" animate="show"
        className="relative overflow-hidden rounded-[28px] glass-panel p-7 md:p-10">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="pulse-ring relative">
              <NovusMark size="lg" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium tracking-wide uppercase text-primary/80">Novus Briefing</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>

            {briefingLoading ? (
              <div className="space-y-3 max-w-2xl">
                <div className="h-6 w-3/4 rounded-lg shimmer" />
                <div className="h-6 w-full rounded-lg shimmer" />
                <div className="h-6 w-2/3 rounded-lg shimmer" />
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                className="text-lg md:text-2xl leading-relaxed font-medium text-balance max-w-3xl text-foreground/90"
              >
                {briefing}
              </motion.p>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
              <ActionChip label="Ask Novus" onClick={() => setCommandOpen(true)} primary
                icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <ActionChip label="Log mood" onClick={() => router.push("/mood")}
                icon="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <ActionChip label="Review goals" onClick={() => router.push("/goals")}
                icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ════════ Vital signs row ════════ */}
      <motion.section
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <VitalCard i={0} label="Life Score" value={String(lifeScore.total)} sub={`Grade ${lifeScore.grade}`} accent="from-indigo-500 to-violet-500" />
        <VitalCard i={1} label="Habits today" value={`${habits.completed}/${habits.total}`} sub={habits.bestStreak > 0 ? `${habits.bestStreak}-day streak` : "Build momentum"} accent="from-emerald-500 to-teal-500" />
        <VitalCard i={2} label="Tasks left" value={String(Math.max(tasks.total - tasks.done, 0))} sub={`${tasks.done} done today`} accent="from-sky-500 to-cyan-500" />
        <VitalCard i={3} label="Mood" value={d?.mood ? d.mood.emoji : "—"} sub={d?.mood ? d.mood.label : "Not logged"} accent="from-pink-500 to-rose-500" />
      </motion.section>

      {/* ════════ Main grid ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="lg:col-span-2 glass-panel rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Today&apos;s rhythm</h3>
            <button onClick={() => router.push("/habits")} className="text-xs text-primary hover:underline">Open habits</button>
          </div>

          {habits.list.length === 0 ? (
            <EmptyHint icon="✦" text="No habits yet. Design the rhythm of your days." action="Create a habit" onClick={() => router.push("/habits")} />
          ) : (
            <div className="space-y-1.5">
              {habits.list.map((h, i) => (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => toggleHabit(h.id, h.isCompleted)}
                  className="w-full group flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors text-left"
                >
                  <span className={cn(
                    "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                    h.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 group-hover:border-primary"
                  )}>
                    {h.isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className="text-lg">{h.icon || "✦"}</span>
                  <span className={cn("flex-1 text-sm font-medium", h.isCompleted && "line-through text-muted-foreground")}>{h.name}</span>
                  {h.streak > 0 && <span className="text-xs text-muted-foreground">{h.streak}d</span>}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="glass-panel rounded-[24px] p-6 flex flex-col">
          <h3 className="font-semibold mb-4">Life Score</h3>
          <div className="flex items-center justify-center py-2">
            <ScoreRing value={lifeScore.total} grade={lifeScore.grade} />
          </div>
          <div className="space-y-2.5 mt-4">
            {[
              { label: "Habits", key: "habits", c: "bg-emerald-500" },
              { label: "Tasks", key: "tasks", c: "bg-sky-500" },
              { label: "Goals", key: "goals", c: "bg-violet-500" },
              { label: "Mood", key: "mood", c: "bg-pink-500" },
              { label: "Workout", key: "workout", c: "bg-amber-500" },
            ].map(({ label, key, c }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div className={cn("h-full rounded-full", c)}
                    initial={{ width: 0 }} animate={{ width: `${lifeScore.breakdown[key] ?? 0}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.3 }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{lifeScore.breakdown[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ════════ Second grid ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="glass-panel rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Focus</h3>
            <button onClick={() => router.push("/tasks")} className="text-xs text-primary hover:underline">All tasks</button>
          </div>
          {tasks.list.length === 0 ? (
            <EmptyHint icon="◎" text="Nothing on deck." action="Add a task" onClick={() => router.push("/tasks")} small />
          ) : (
            <div className="space-y-1.5">
              {tasks.list.map((t) => (
                <button key={t.id} onClick={() => toggleTask(t.id, t.status)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left">
                  <span className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                    t.status === "DONE" ? "bg-primary border-primary text-white" : "border-muted-foreground/30")}>
                    {t.status === "DONE" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className={cn("flex-1 text-sm", t.status === "DONE" && "line-through text-muted-foreground")}>{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="glass-panel rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Trajectory</h3>
            <button onClick={() => router.push("/goals")} className="text-xs text-primary hover:underline">All goals</button>
          </div>
          {goals.length === 0 ? (
            <EmptyHint icon="✧" text="No goals set." action="Set a goal" onClick={() => router.push("/goals")} small />
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

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="glass-panel rounded-[24px] p-6">
          <h3 className="font-semibold mb-4">Momentum</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Habits", v: streaks.habits, icon: "✦" },
              { label: "Journal", v: streaks.journal, icon: "✎" },
              { label: "Workout", v: streaks.workout, icon: "⟁" },
              { label: "Mood", v: streaks.mood, icon: "♡" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-muted/30 p-4 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-2xl font-semibold gradient-text">{s.v}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ActionChip({ label, onClick, icon, primary }: { label: string; onClick: () => void; icon: string; primary?: boolean }) {
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium transition-all",
      primary
        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.8)] hover:opacity-90"
        : "bg-muted/50 hover:bg-muted text-foreground border border-border/50"
    )}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} /></svg>
      {label}
    </button>
  );
}

function VitalCard({ i, label, value, sub, accent }: { i: number; label: string; value: string; sub: string; accent: string }) {
  return (
    <motion.div variants={fadeUp} custom={i} className="relative glass-panel rounded-[22px] p-5 overflow-hidden lift">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-80", accent)} />
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
    </motion.div>
  );
}

function ScoreRing({ value, grade }: { value: number; grade: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">Grade {grade}</span>
      </div>
    </div>
  );
}

function EmptyHint({ icon, text, action, onClick, small }: { icon: string; text: string; action: string; onClick: () => void; small?: boolean }) {
  return (
    <div className={cn("text-center", small ? "py-6" : "py-10")}>
      <div className="text-2xl mb-2 text-muted-foreground">{icon}</div>
      <p className="text-sm text-muted-foreground mb-3">{text}</p>
      <button onClick={onClick} className="text-sm font-medium text-primary hover:underline">{action} →</button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-52 rounded-[28px] shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-[22px] shimmer" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-[24px] shimmer" />
        <div className="h-72 rounded-[24px] shimmer" />
      </div>
    </div>
  );
}
