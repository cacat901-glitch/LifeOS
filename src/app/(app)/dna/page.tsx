"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Zap,
  EyeOff,
  Repeat,
  Flame,
  Gauge,
  HeartPulse,
  GitBranch,
  AlertTriangle,
  Target,
  type LucideIcon,
} from "lucide-react";
import { NovusMark } from "@/components/shared/novus-logo";

interface LifeDNA {
  identity: string;
  strengths: string[];
  blindSpots: string[];
  behavioralPatterns: string[];
  motivationPatterns: string[];
  productivityStyle: string;
  recoveryStyle: string;
  decisionStyle: string;
  currentRisks: string[];
  recommendedFocus: string[];
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function DnaPage() {
  const [dna, setDna] = useState<LifeDNA | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setGenerating(true);
    try {
      const res = await fetch(`/api/ai/dna${refresh ? "?refresh=1" : ""}`);
      if (res.ok) {
        const d = await res.json();
        setDna(d.dna);
      }
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-40 rounded-[24px] shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div>
        <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}</div>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="glass-panel rounded-[24px] p-10 text-center">
        <NovusMark size="lg" className="mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Novus needs a little more data to build your Life DNA. Keep using Novus for a few days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative overflow-hidden rounded-[24px] border border-border bg-card/60 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <NovusMark size="lg" className="shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">
              <Fingerprint className="h-3.5 w-3.5" strokeWidth={2} /> Life DNA
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Who you are, by the data</h1>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-foreground/90">{dna.identity}</p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={generating}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generating ? "Reading…" : "Regenerate"}
          </button>
        </div>
      </motion.div>

      {/* Styles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StyleCard icon={Gauge} label="Productivity style" text={dna.productivityStyle} delay={0.05} />
        <StyleCard icon={HeartPulse} label="Recovery style" text={dna.recoveryStyle} delay={0.1} />
        <StyleCard icon={GitBranch} label="Decision style" text={dna.decisionStyle} delay={0.15} />
      </div>

      {/* Strengths / Blind spots */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard icon={Zap} title="Strengths" items={dna.strengths} accent="primary" delay={0.05} />
        <ListCard icon={EyeOff} title="Blind spots" items={dna.blindSpots} accent="muted" delay={0.1} />
      </div>

      {/* Patterns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard icon={Repeat} title="Behavioral patterns" items={dna.behavioralPatterns} accent="muted" delay={0.05} />
        <ListCard icon={Flame} title="Motivation patterns" items={dna.motivationPatterns} accent="muted" delay={0.1} />
      </div>

      {/* Risks / Focus */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard icon={AlertTriangle} title="Current risks" items={dna.currentRisks} accent="amber" delay={0.05} />
        <ListCard icon={Target} title="Recommended focus" items={dna.recommendedFocus} accent="primary" delay={0.1} />
      </div>
    </div>
  );
}

function StyleCard({ icon: Icon, label, text, delay }: { icon: LucideIcon; label: string; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      className="rounded-2xl border border-border bg-card/60 p-5"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.9} />
        {label}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{text}</p>
    </motion.div>
  );
}

function ListCard({
  icon: Icon,
  title,
  items,
  accent,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  accent: "primary" | "amber" | "muted";
  delay: number;
}) {
  const dot = accent === "primary" ? "bg-primary" : accent === "amber" ? "bg-amber-400" : "bg-muted-foreground/50";
  const iconColor = accent === "primary" ? "text-primary" : accent === "amber" ? "text-amber-400" : "text-muted-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      className="rounded-2xl border border-border bg-card/60 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.9} />
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
