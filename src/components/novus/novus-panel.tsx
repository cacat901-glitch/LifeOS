"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUp, AlertTriangle, Sparkles } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { cn } from "@/lib/utils";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should I focus on today?",
  "How was my week?",
  "Create a habit to read 20 min nightly",
  "Log my mood as 8",
];

export function NovusPanel() {
  const router = useRouter();
  const { novusOpen, setNovusOpen, toggleNovus } = useAppStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<{ actions: any[]; summary: string[] } | null>(null);
  const [executing, setExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ⌘J / Ctrl+J toggles Novus; Esc closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleNovus();
      }
      if (e.key === "Escape") setNovusOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleNovus, setNovusOpen]);

  useEffect(() => {
    if (novusOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [novusOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, pending]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || thinking) return;
      const next = [...messages, { role: "user" as const, content: trimmed }];
      setMessages(next);
      setQuery("");
      setThinking(true);
      setPending(null);
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", content: data.reply || "I couldn't respond just now." }]);
        if (data.requiresConfirmation && Array.isArray(data.pendingActions)) {
          setPending({ actions: data.pendingActions, summary: data.confirmationSummary || [] });
        } else if (data.executed) {
          router.refresh();
        }
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching Novus." }]);
      } finally {
        setThinking(false);
      }
    },
    [messages, router, thinking]
  );

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmActions: pending.actions }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Done." }]);
      setPending(null);
      if (data.accountDeleted) {
        setMessages((m) => [...m, { role: "assistant", content: "Signing you out…" }]);
        setTimeout(() => { window.location.href = "/auth/login"; }, 1400);
      } else {
        router.refresh();
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong performing that action." }]);
    } finally {
      setExecuting(false);
    }
  }, [pending, router]);

  const cancelPending = useCallback(() => {
    setPending(null);
    setMessages((m) => [...m, { role: "assistant", content: "Okay — cancelled. Nothing was changed." }]);
  }, []);

  return (
    <AnimatePresence>
      {novusOpen && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNovusOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-border bg-popover shadow-2xl sm:w-[440px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
              <NovusMark size="sm" />
              <div className="flex-1">
                <div className="font-display text-base font-semibold leading-none">Novus</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Your operating system
                </div>
              </div>
              <button
                onClick={() => setNovusOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close Novus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && !thinking ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <NovusMark size="lg" className="mb-4" />
                  <p className="font-display text-lg font-semibold text-foreground">How can I help?</p>
                  <p className="mt-1 max-w-[18rem] text-sm text-muted-foreground">
                    Ask about your day, or tell me to create a habit, set a goal, log your mood — I&apos;ll actually do it.
                  </p>
                  <div className="mt-6 grid w-full gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}

              {thinking && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl bg-secondary/70 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/[0.08] p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={1.8} />
                    Confirm before I continue
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {pending.summary.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-destructive">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-destructive/90">This permanently changes your data and can&apos;t be undone.</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={confirmPending}
                      disabled={executing}
                      className="flex-1 rounded-xl bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {executing ? "Working…" : "Yes, do it"}
                    </button>
                    <button
                      onClick={cancelPending}
                      disabled={executing}
                      className="flex-1 rounded-xl bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pending && !executing) send(query);
                }}
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-1.5 focus-within:border-primary/50"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Novus anything…"
                  className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || thinking || !!pending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </form>
              <p className="mt-2 px-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
                ⌘J to toggle · Novus can take real actions
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Persistent floating Novus button (desktop) ─────────────
export function NovusFab() {
  const { novusOpen, setNovusOpen } = useAppStore();
  return (
    <AnimatePresence>
      {!novusOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={() => setNovusOpen(true)}
          className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:scale-[1.04] lg:flex"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          Ask Novus
        </motion.button>
      )}
    </AnimatePresence>
  );
}
