"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NovusMark } from "@/components/shared/novus-logo";
import { cn } from "@/lib/utils";

interface LifeAnalysis {
  overallAssessment: string;
  whatsWorking: string[];
  whatsNotWorking: string[];
  hiddenPatterns: string[];
  opportunities: string[];
  suggestedPriorities: string[];
  score: number;
}

interface PatternItem {
  title: string;
  description: string;
  actionable: string;
  type: "positive" | "warning" | "neutral";
}

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const PATTERN_STYLE = {
  positive: { bg: "bg-emerald-500/10 border-emerald-500/20", icon: "↑", color: "text-emerald-400" },
  warning:  { bg: "bg-amber-500/10  border-amber-500/20",  icon: "!", color: "text-amber-400"   },
  neutral:  { bg: "bg-muted/40      border-border/50",     icon: "~", color: "text-muted-foreground" },
};

// Memory questions
const MEMORY_QUESTIONS = [
  "How have I changed since I started using Novus?",
  "What habits have had the biggest impact on my life?",
  "What are my biggest achievements so far?",
  "What goals am I neglecting?",
  "What patterns do you see in my behavior?",
];

export default function AnalystPage() {
  const [analysis, setAnalysis] = useState<LifeAnalysis | null>(null);
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cached, setCached] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "patterns" | "memory">("analysis");

  // Memory chat
  const [memQuestion, setMemQuestion] = useState("");
  const [memAnswer, setMemAnswer] = useState("");
  const [memLoading, setMemLoading] = useState(false);

  const loadAnalysis = useCallback(async (forceNew = false) => {
    setLoading(true);
    if (forceNew) setGenerating(true);
    try {
      const [ar, pr] = await Promise.all([
        fetch(`/api/ai/analyze${forceNew ? "?new=1" : ""}`),
        fetch("/api/ai/patterns"),
      ]);
      if (ar.ok) { const d = await ar.json(); setAnalysis(d.analysis); setCached(d.cached || false); }
      if (pr.ok) { const d = await pr.json(); setPatterns(d.patterns?.patterns || []); }
    } finally { setLoading(false); setGenerating(false); }
  }, []);

  const askMemory = async (q: string) => {
    if (!q.trim()) return;
    setMemLoading(true);
    setMemAnswer("");
    try {
      const r = await fetch("/api/ai/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
      if (r.ok) { const d = await r.json(); setMemAnswer(d.reply); }
    } finally { setMemLoading(false); }
  };

  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);

  const tabs = [
    { id: "analysis", label: "Life Analysis" },
    { id: "patterns", label: "Patterns" },
    { id: "memory",   label: "Life Memory" },
  ] as const;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <div className="relative overflow-hidden glass-panel rounded-[24px] p-6 sm:p-8">
          <div className="relative flex flex-col sm:flex-row items-start gap-4">
            <NovusMark size="lg" className="shrink-0" />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-primary/70 mb-1">Flagship Feature</p>
              <h1 className="text-3xl font-semibold tracking-tight">Analyze My Life</h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                A comprehensive AI analysis of your habits, goals, patterns, mood, and growth. The most honest feedback you&apos;ll ever read about yourself.
              </p>
              {cached && <p className="text-xs text-muted-foreground mt-2">Analysis cached — refreshes weekly</p>}
            </div>
            <button onClick={() => loadAnalysis(true)} disabled={generating}
              className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {generating ? "Analyzing…" : "Re-Analyze"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border/40 pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("px-4 py-2 text-sm font-medium rounded-t-xl transition-colors",
              activeTab === t.id ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ANALYSIS TAB ── */}
      {activeTab === "analysis" && (
        loading ? <AnalysisSkeleton /> :
        !analysis ? (
          <div className="glass-panel rounded-[24px] p-12 text-center">
            <NovusMark size="lg" className="mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ready to analyze your life?</h3>
            <p className="text-sm text-muted-foreground mb-4">Novus will study your habits, goals, mood, journal and more to give you the most comprehensive life review you&apos;ve ever had.</p>
            <button onClick={() => loadAnalysis(true)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              Analyze My Life
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score hero */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="relative overflow-hidden glass-panel rounded-[24px] p-6 sm:p-8">
              <div className="relative flex flex-col sm:flex-row gap-6 items-start">
                <div className="text-center sm:text-left shrink-0">
                  <div className="font-display text-6xl font-bold text-primary">{analysis.score}</div>
                  <div className="text-sm text-muted-foreground mt-1">Life Health Score</div>
                  <div className="mt-3 h-2 w-32 rounded-full bg-muted/60 overflow-hidden mx-auto sm:mx-0">
                    <motion.div className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }} animate={{ width: `${analysis.score}%` }} transition={{ duration: 1.2, ease }} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-primary/70 mb-2">Overall Assessment</p>
                  <p className="text-base md:text-lg leading-relaxed text-foreground/90">{analysis.overallAssessment}</p>
                </div>
              </div>
            </motion.div>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnalysisSection title="What's Working" items={analysis.whatsWorking} icon="✦" color="text-emerald-400" bg="bg-emerald-500/8 border-emerald-500/20" />
              <AnalysisSection title="What's Not Working" items={analysis.whatsNotWorking} icon="!" color="text-amber-400" bg="bg-amber-500/8 border-amber-500/20" />
              <AnalysisSection title="Hidden Patterns" items={analysis.hiddenPatterns} icon="◈" color="text-violet-400" bg="bg-violet-500/8 border-violet-500/20" />
              <AnalysisSection title="Opportunities" items={analysis.opportunities} icon="✧" color="text-sky-400" bg="bg-sky-500/8 border-sky-500/20" />
            </div>

            {/* Priorities */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-panel rounded-[24px] p-6">
              <p className="text-xs uppercase tracking-widest text-primary/70 mb-4">Suggested Priorities</p>
              <div className="space-y-3">
                {analysis.suggestedPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )
      )}

      {/* ── PATTERNS TAB ── */}
      {activeTab === "patterns" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Novus detects behavioral patterns from your data — correlations, cycles, and habits you may not have noticed.</p>
          {patterns.length === 0 ? (
            <div className="glass-panel rounded-[24px] p-10 text-center">
              <p className="text-2xl mb-3">◈</p>
              <p className="text-sm text-muted-foreground">Keep tracking habits, mood, and workouts to surface meaningful patterns.</p>
            </div>
          ) : patterns.map((p, i) => {
            const s = PATTERN_STYLE[p.type];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={cn("rounded-2xl border p-5", s.bg)}>
                <div className="flex items-start gap-3">
                  <span className={cn("w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5", s.color)}>{s.icon}</span>
                  <div>
                    <p className={cn("font-semibold", s.color)}>{p.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                    <p className="text-xs font-medium text-foreground/70 mt-2.5 pt-2.5 border-t border-border/30">
                      → {p.actionable}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── MEMORY TAB ── */}
      {activeTab === "memory" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Ask Novus anything about your journey — how you&apos;ve changed, what&apos;s worked, what you&apos;re neglecting.</p>

          {/* Quick questions */}
          <div className="flex flex-wrap gap-2">
            {MEMORY_QUESTIONS.map((q) => (
              <button key={q} onClick={() => { setMemQuestion(q); askMemory(q); }}
                className="text-xs px-3 py-1.5 rounded-full glass hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input value={memQuestion} onChange={(e) => setMemQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askMemory(memQuestion)}
              placeholder="Ask anything about your life…"
              className="flex-1 h-11 px-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={() => askMemory(memQuestion)} disabled={memLoading || !memQuestion.trim()}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {memLoading ? "…" : "Ask"}
            </button>
          </div>

          {/* Answer */}
          {memLoading && (
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <NovusMark size="sm" />
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {memAnswer && !memLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <NovusMark size="sm" className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-primary/70 uppercase tracking-wider mb-2">Novus</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{memAnswer}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisSection({ title, items, icon, color, bg }: { title: string; items: string[]; icon: string; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border p-5", bg)}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("font-bold", color)}>{icon}</span>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", color)}>{title}</p>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? <li className="text-sm text-muted-foreground">Insufficient data yet.</li>
          : items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={cn("mt-1 w-1 h-1 rounded-full shrink-0", color.replace("text-", "bg-"))} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
      </ul>
    </motion.div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 rounded-[24px] shimmer"/>
      <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer"/>)}</div>
      <div className="h-36 rounded-[24px] shimmer"/>
    </div>
  );
}
