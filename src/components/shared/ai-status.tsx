"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AIStatusData {
  provider: string;
  label: string;
  isLive: boolean;
  confirmed: boolean;
  errorHint: string;
  status: string;
}

interface AIStatusBadgeProps {
  /** "dot" = tiny colored dot + short text (for the briefing card)   */
  /** "pill" = full pill badge (for settings, command center)         */
  /** "full" = expanded card (for settings AI section)               */
  variant?: "dot" | "pill" | "full";
  className?: string;
  /** If true, immediately fetches (makes a live test call). Default: lazy */
  autoFetch?: boolean;
}

const PROVIDER_ICONS: Record<string, string> = {
  groq:     "⚡",
  gemini:   "✦",
  fallback: "◎",
};

const STATUS_STYLES = {
  live:    { dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", ring: "ring-emerald-400" },
  warning: { dot: "bg-amber-400",   pill: "bg-amber-500/15  text-amber-400  border-amber-500/30",  ring: "ring-amber-400"   },
  offline: { dot: "bg-muted-foreground/40", pill: "bg-muted/50 text-muted-foreground border-border/50", ring: "ring-muted-foreground/40" },
};

function getStyle(data: AIStatusData | null, loading: boolean) {
  if (loading || !data) return STATUS_STYLES.offline;
  if (data.isLive && data.confirmed) return STATUS_STYLES.live;
  if (data.isLive && !data.confirmed) return STATUS_STYLES.warning;
  return STATUS_STYLES.offline;
}

export function AIStatusBadge({ variant = "pill", className, autoFetch = false }: AIStatusBadgeProps) {
  const [data, setData] = useState<AIStatusData | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [fetched, setFetched] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ai/status");
      if (r.ok) setData(await r.json());
    } catch { /* silent */ }
    finally { setLoading(false); setFetched(true); }
  };

  useEffect(() => { if (autoFetch) fetch_(); }, []); // eslint-disable-line

  const style = getStyle(data, loading);
  const icon = data ? PROVIDER_ICONS[data.provider] || "✦" : "◎";

  /* ── dot variant ── */
  if (variant === "dot") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-[10px] text-muted-foreground", className)}>
        <span className={cn("w-1.5 h-1.5 rounded-full inline-block", style.dot, loading && "animate-pulse")} />
        {loading ? "Checking AI…" : data ? (data.isLive && data.confirmed ? `${icon} ${data.label}` : data.isLive ? "⚠ Key issue" : "Offline mode") : "AI status unknown"}
      </div>
    );
  }

  /* ── pill variant ── */
  if (variant === "pill") {
    return (
      <button
        onClick={() => !fetched && fetch_()}
        title={data?.status || "Click to check AI status"}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
          style.pill,
          !fetched && "cursor-pointer hover:opacity-80",
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", style.dot, loading && "animate-pulse")} />
        {loading ? "Checking…" : data
          ? (data.isLive && data.confirmed ? `${icon} ${data.label}` : data.isLive ? "⚠ Key error" : "Offline mode")
          : "Check AI status"}
      </button>
    );
  }

  /* ── full variant ── */
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Novus AI Status</span>
        <button onClick={fetch_} disabled={loading}
          className="text-xs text-primary hover:underline disabled:opacity-50">
          {loading ? "Testing…" : fetched ? "Re-test" : "Test connection"}
        </button>
      </div>

      {!fetched && !loading && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-sm text-muted-foreground">
          Click &quot;Test connection&quot; to check if your AI key is working.
        </div>
      )}

      {loading && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Making a test call to the AI provider…</span>
        </div>
      )}

      {fetched && !loading && data && (
        <div className={cn(
          "p-4 rounded-2xl border",
          data.isLive && data.confirmed ? "bg-emerald-500/8 border-emerald-500/25" :
          data.isLive ? "bg-amber-500/8 border-amber-500/25" :
          "bg-muted/30 border-border/40"
        )}>
          <div className="flex items-start gap-3">
            {/* Status dot */}
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0", style.pill)}>
              {data.isLive && data.confirmed ? "✓" : data.isLive ? "⚠" : "◎"}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn("font-semibold text-sm",
                data.isLive && data.confirmed ? "text-emerald-400" :
                data.isLive ? "text-amber-400" : "text-muted-foreground")}>
                {data.isLive && data.confirmed ? `AI is live` : data.isLive ? "Key found — test failed" : "Offline mode"}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{data.status}</p>

              {/* Provider info */}
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Provider</span>
                <span className="text-xs font-medium">{PROVIDER_ICONS[data.provider]} {data.label}</span>
              </div>
            </div>
          </div>

          {/* Error guidance */}
          {data.isLive && !data.confirmed && (
            <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground space-y-1">
              {data.errorHint === "quota_exceeded" && (
                <p>Your free quota is exhausted. Either wait for the daily reset or <a href="https://console.groq.com/keys" className="text-primary underline" target="_blank" rel="noopener">create a new Groq key</a>.</p>
              )}
              {data.errorHint === "invalid_key" && (
                <p>Your API key was rejected. Check it in <a href="https://console.groq.com/keys" className="text-primary underline" target="_blank" rel="noopener">Groq Console</a> and update <code className="bg-muted px-1 py-0.5 rounded">GROQ_API_KEY</code> in Vercel.</p>
              )}
              {data.errorHint === "model_not_found" && (
                <p>The AI model name may be outdated. Check Vercel logs — a code update may be needed.</p>
              )}
              {data.errorHint === "unknown" && (
                <p>An unexpected error occurred. Check Vercel → Functions → <code className="bg-muted px-1 py-0.5 rounded">/api/ai/status</code> for details.</p>
              )}
            </div>
          )}

          {/* No key — setup guide */}
          {!data.isLive && (
            <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground/80">Set up free AI in 2 minutes:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.groq.com/keys" className="text-primary underline" target="_blank" rel="noopener">console.groq.com/keys</a> → sign up free</li>
                <li>Create an API key and copy it</li>
                <li>Add <code className="bg-muted px-1 py-0.5 rounded">GROQ_API_KEY</code> to Vercel environment variables</li>
                <li>Redeploy → Novus AI activates instantly</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
