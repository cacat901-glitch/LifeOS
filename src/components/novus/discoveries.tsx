"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Bookmark, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Discovery {
  id: string;
  title: string;
  explanation: string;
  confidence: number;
  evidence: string[];
  modules: string[];
  isSaved?: boolean;
}

export function Discoveries({ limit = 3, heading = true }: { limit?: number; heading?: boolean }) {
  const [items, setItems] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/discoveries");
      if (res.ok) {
        const d = await res.json();
        setItems(d.discoveries || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: "dismiss" | "save" | "unsave") => {
    if (action === "dismiss") setItems((p) => p.filter((d) => d.id !== id));
    else setItems((p) => p.map((d) => (d.id === id ? { ...d, isSaved: action === "save" } : d)));
    fetch("/api/discoveries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).catch(() => {});
  };

  if (loading) {
    return <div className="h-28 rounded-2xl shimmer" />;
  }
  if (!items.length) return null;

  const shown = items.slice(0, limit);

  return (
    <section className="space-y-3">
      {heading && (
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          Discoveries
          <span className="text-muted-foreground/50">· Novus noticed</span>
        </div>
      )}
      <div className="grid gap-3">
        <AnimatePresence initial={false}>
          {shown.map((d) => {
            const open = expanded === d.id;
            return (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl border border-border bg-card/60 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                        {d.confidence}% sure
                      </span>
                      {d.modules.map((mod) => (
                        <span key={mod} className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                          {mod}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-base font-semibold leading-snug text-foreground">{d.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.explanation}</p>

                    {d.evidence.length > 0 && (
                      <>
                        <button
                          onClick={() => setExpanded(open ? null : d.id)}
                          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Evidence
                          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {open && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 space-y-1 overflow-hidden"
                            >
                              {d.evidence.map((e, i) => (
                                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="text-primary">•</span>
                                  <span>{e}</span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      onClick={() => act(d.id, d.isSaved ? "unsave" : "save")}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                        d.isSaved ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                      aria-label="Save"
                    >
                      <Bookmark className="h-4 w-4" fill={d.isSaved ? "currentColor" : "none"} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => act(d.id, "dismiss")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
