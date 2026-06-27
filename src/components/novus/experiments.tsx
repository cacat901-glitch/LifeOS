"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlaskConical, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  durationDays: number;
  actions: string[];
  predictedOutcome: string;
  actualOutcome?: string | null;
  aiSummary?: string | null;
  status: string;
  startDate: string;
  endDate: string;
}
interface Proposal {
  title: string;
  hypothesis: string;
  durationDays: number;
  actions: string[];
  predictedOutcome: string;
}

export function ExperimentCard() {
  const router = useRouter();
  const [active, setActive] = useState<Experiment | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [justCompleted, setJustCompleted] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/experiments");
      if (res.ok) {
        const d = await res.json();
        setActive(d.active);
        setProposal(d.proposal);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const start = async () => {
    if (!proposal) return;
    setBusy(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      });
      if (res.ok) { const d = await res.json(); setActive(d.experiment); setProposal(null); router.refresh(); }
    } finally { setBusy(false); }
  };

  const finish = async (action: "complete" | "abandon") => {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, action }),
      });
      if (res.ok) {
        const d = await res.json();
        if (action === "complete") setJustCompleted(d.experiment);
        setActive(null);
        router.refresh();
        load();
      }
    } finally { setBusy(false); }
  };

  if (loading) return <div className="h-44 rounded-2xl shimmer" />;

  // Just-completed summary
  if (justCompleted) {
    return (
      <Shell>
        <Head label="Experiment complete" />
        <h3 className="font-display text-lg font-semibold">{justCompleted.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{justCompleted.aiSummary}</p>
        <button onClick={() => setJustCompleted(null)} className="mt-4 text-sm font-medium text-primary hover:underline">
          Dismiss
        </button>
      </Shell>
    );
  }

  if (active) {
    const endMs = new Date(active.endDate).getTime();
    const startMs = new Date(active.startDate).getTime();
    const now = Date.now();
    const pct = Math.min(100, Math.max(0, Math.round(((now - startMs) / (endMs - startMs)) * 100)));
    const daysLeft = Math.max(0, Math.ceil((endMs - now) / 86400000));
    return (
      <Shell>
        <Head label={daysLeft > 0 ? `Active · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Active · ready to review"} />
        <h3 className="font-display text-lg font-semibold">{active.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{active.hypothesis}</p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
        </div>

        {active.actions.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {active.actions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                {a}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Prediction: <span className="text-foreground/80 normal-case tracking-normal">{active.predictedOutcome}</span>
        </p>

        <div className="mt-5 flex gap-2">
          <button onClick={() => finish("complete")} disabled={busy}
            className="flex-1 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            {busy ? "Measuring…" : "Complete & see results"}
          </button>
          <button onClick={() => finish("abandon")} disabled={busy}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
            Abandon
          </button>
        </div>
      </Shell>
    );
  }

  if (proposal) {
    return (
      <Shell>
        <Head label="Novus proposes an experiment" />
        <h3 className="font-display text-lg font-semibold">{proposal.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{proposal.hypothesis}</p>
        {proposal.actions.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {proposal.actions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {a}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]">Predicted:</span> {proposal.predictedOutcome}
        </p>
        <button onClick={start} disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">
          {busy ? "Starting…" : `Start ${proposal.durationDays}-day experiment`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </Shell>
    );
  }

  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card/60 p-5">{children}</div>;
}
function Head({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <FlaskConical className="h-3.5 w-3.5 text-primary" strokeWidth={1.9} />
      {label}
    </div>
  );
}
