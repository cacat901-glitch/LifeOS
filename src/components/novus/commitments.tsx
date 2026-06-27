"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HandHeart, Check, X } from "lucide-react";

interface Commitment {
  id: string;
  text: string;
  relatedModule?: string | null;
  followUp?: string | null;
  createdAt: string;
}

export function Commitments({ heading = true }: { heading?: boolean }) {
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/commitments");
      if (res.ok) {
        const d = await res.json();
        setItems(d.commitments || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string, action: "complete" | "abandon") => {
    setItems((p) => p.filter((c) => c.id !== id));
    fetch("/api/commitments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).catch(() => {});
  };

  if (loading || !items.length) return null;

  return (
    <section className="space-y-3">
      {heading && (
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <HandHeart className="h-3.5 w-3.5 text-primary" strokeWidth={1.9} />
          Promises to yourself
        </div>
      )}
      <div className="grid gap-2.5">
        <AnimatePresence initial={false}>
          {items.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground">&ldquo;{c.text}&rdquo;</p>
                {c.followUp && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.followUp}</p>}
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">
                  Promised {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  {c.relatedModule ? ` · ${c.relatedModule}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => resolve(c.id, "complete")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                  aria-label="Kept it"
                  title="I kept this"
                >
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <button
                  onClick={() => resolve(c.id, "abandon")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Let go"
                  title="Let this go"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
