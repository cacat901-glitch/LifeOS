"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, HeartPulse, Sparkles, FlaskConical, ArrowRight, Award } from "lucide-react";
import { NovusMark } from "@/components/shared/novus-logo";
import { Discoveries } from "@/components/novus/discoveries";
import { cn } from "@/lib/utils";

interface WeeklyReview {
  narrative: string;
  biggestWin: string;
  biggestWeakness: string;
  keyLesson: string;
  focusNextWeek: string;
  stats: { habitRate: number; workouts: number; avgMood: number; tasksCompleted: number; goalsProgress: number };
  // Upgraded fields (optional for backwards-compat with older cached reviews)
  consistencyTrend?: { direction: "up" | "down" | "steady"; text: string };
  personalityEvolution?: string;
  recoveryAnalysis?: string;
  whatChanged?: string[];
  emotionalAchievements?: { key: string; name: string; description: string }[];
  recommendedExperiment?: { title: string; hypothesis: string; durationDays: number; actions: string[]; predictedOutcome: string };
}

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cached, setCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();
  const [startingExp, setStartingExp] = useState(false);

  const startExperiment = async () => {
    if (!review?.recommendedExperiment) return;
    setStartingExp(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review.recommendedExperiment),
      });
      if (res.ok) router.push("/dashboard");
    } finally {
      setStartingExp(false);
    }
  };

  const load = useCallback(async (forceNew = false) => {
    setLoading(true);
    if (forceNew) setGenerating(true);
    try {
      const r = await fetch(`/api/ai/weekly-review${forceNew ? "?new=1" : ""}`);
      if (r.ok) {
        const d = await r.json();
        setReview(d.review);
        setCached(d.cached || false);
        setCachedAt(d.createdAt || null);
      }
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const r = await fetch("/api/ai/weekly-review?history=1");
    if (r.ok) { const d = await r.json(); setHistory(d.reports || []); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ReviewSkeleton />;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary/70 mb-1">Novus AI</p>
            <h1 className="text-3xl font-semibold tracking-tight">Weekly Review</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cached && cachedAt ? `Generated ${new Date(cachedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}` : "Just generated"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
              className="text-xs px-3 py-2 rounded-xl glass hover:bg-muted/50 transition-colors">
              History
            </button>
            <button onClick={() => load(true)} disabled={generating}
              className="text-xs px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {generating ? "Generating…" : "Regenerate"}
            </button>
          </div>
        </div>
      </motion.div>

      {!review ? (
        <div className="glass-panel rounded-[24px] p-12 text-center">
          <NovusMark size="lg" className="mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No review yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate your first weekly review to see how you&apos;re doing.</p>
          <button onClick={() => load(true)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Generate Review
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Habit Rate",  value: `${review.stats.habitRate}%` },
              { label: "Workouts",    value: String(review.stats.workouts) },
              { label: "Avg Mood",    value: `${review.stats.avgMood}/10` },
              { label: "Tasks Done",  value: String(review.stats.tasksCompleted) },
              { label: "Goal Prog.",  value: `${review.stats.goalsProgress}%` },
            ].map((s) => (
              <div key={s.label} className="relative glass-panel rounded-2xl p-4 overflow-hidden text-center">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-primary" />
                <div className="font-display text-xl font-semibold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main narrative */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="relative overflow-hidden glass-panel rounded-[24px] p-6 sm:p-8">
            <div className="relative flex items-start gap-4">
              <NovusMark size="md" className="shrink-0" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-primary/70 mb-3">Novus&apos;s take on your week</p>
                <p className="text-lg md:text-xl leading-relaxed font-medium text-foreground/90">{review.narrative}</p>
              </div>
            </div>
          </motion.div>

          {/* Four quadrants */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Biggest Win",          value: review.biggestWin,       icon: "🏆", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Biggest Weakness",     value: review.biggestWeakness,  icon: "⚠️", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "Key Lesson",           value: review.keyLesson,        icon: "💡", color: "text-sky-400",    bg: "bg-sky-500/10 border-sky-500/20" },
              { label: "Focus for Next Week",  value: review.focusNextWeek,    icon: "🎯", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
            ].map((q) => (
              <div key={q.label} className={cn("rounded-2xl border p-5", q.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{q.icon}</span>
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", q.color)}>{q.label}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">{q.value}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Upgraded review sections ── */}

          {/* Consistency trend + what changed */}
          {(review.consistencyTrend || review.whatChanged) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
              className="glass-panel rounded-[24px] p-6">
              <div className="flex items-center gap-2 mb-3">
                {review.consistencyTrend?.direction === "up" ? <TrendingUp className="h-4 w-4 text-primary" />
                  : review.consistencyTrend?.direction === "down" ? <TrendingDown className="h-4 w-4 text-amber-400" />
                  : <Minus className="h-4 w-4 text-muted-foreground" />}
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">What changed this week</span>
              </div>
              {review.consistencyTrend && <p className="text-sm text-foreground/90 mb-3">{review.consistencyTrend.text}</p>}
              {review.whatChanged && review.whatChanged.length > 0 && (
                <ul className="space-y-1.5">
                  {review.whatChanged.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span><span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* Evolution + Recovery */}
          {(review.personalityEvolution || review.recoveryAnalysis) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {review.personalityEvolution && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                  className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.9} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personality evolution</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{review.personalityEvolution}</p>
                </motion.div>
              )}
              {review.recoveryAnalysis && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                  className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="h-4 w-4 text-primary" strokeWidth={1.9} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recovery</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{review.recoveryAnalysis}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Emotional achievements */}
          {review.emotionalAchievements && review.emotionalAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
              className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-primary" strokeWidth={1.9} /> Emotional wins
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {review.emotionalAchievements.map((a) => (
                  <div key={a.key} className="flex gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.9} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommended experiment */}
          {review.recommendedExperiment && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass-panel rounded-[24px] p-6">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="h-4 w-4 text-primary" strokeWidth={1.9} />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Recommended experiment for next week</span>
              </div>
              <h3 className="font-display text-lg font-semibold">{review.recommendedExperiment.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{review.recommendedExperiment.hypothesis}</p>
              <button onClick={startExperiment} disabled={startingExp}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
                {startingExp ? "Starting…" : `Start ${review.recommendedExperiment.durationDays}-day experiment`}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Discoveries */}
          <Discoveries limit={3} />

          {/* Explore further */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3">
            <Link href="/analyst" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm hover:bg-muted/50 transition-colors">
              🧠 Deep Life Analysis
            </Link>
            <Link href="/habits" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm hover:bg-muted/50 transition-colors">
              ✅ Review Habits
            </Link>
            <Link href="/goals" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm hover:bg-muted/50 transition-colors">
              🎯 Update Goals
            </Link>
          </motion.div>
        </>
      )}

      {/* History panel */}
      {showHistory && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Past Reviews</h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past reviews yet.</p>
          ) : history.map((r: any) => (
            <div key={r.id} className="glass-panel rounded-2xl p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => { setReview(r.parsed); setShowHistory(false); }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-US", { weekday: "short" })}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.parsed?.narrative?.slice(0, 120)}…</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="h-20 rounded-2xl shimmer"/>
      <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer"/>)}</div>
      <div className="h-48 rounded-[24px] shimmer"/>
      <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer"/>)}</div>
    </div>
  );
}
