"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ArrowUp, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { cn } from "@/lib/utils";

type ChatMsg = { role: "user" | "assistant"; content: string };

const DEFAULT_SUGGESTIONS = [
  "What should I focus on today?",
  "How was my week?",
  "Create a habit to read 20 min nightly",
  "Log my mood as 8",
];

export function NovusPanel() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const { novusOpen, setNovusOpen, toggleNovus } = useAppStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<{ actions: any[]; summary: string[] } | null>(null);
  const [executing, setExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = pathname === "/dashboard"
    ? ["What should I focus on today?", "Explain my current Life Score", "What pattern should I pay attention to?", "Create a task for my top priority"]
    : pathname === "/habits"
      ? ["Which habit needs attention?", "Create a habit to read 20 min nightly", "What is affecting my consistency?", "Help me rebuild a streak"]
      : pathname === "/goals"
        ? ["Which goal needs attention?", "Break a goal into milestones", "How are my goals progressing?", "Help me choose my next priority"]
        : DEFAULT_SUGGESTIONS;

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
            role="dialog"
            aria-modal="true"
            aria-label="Ask Novus"
            className="novus-layer absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden border-l backdrop-blur-2xl sm:w-[min(680px,calc(100vw-72px))]"
            initial={reduceMotion ? false : { x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: 22, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 380, damping: 36 }}
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 sm:px-6">
              <NovusMark size="sm" />
              <div className="flex-1">
                <div className="font-display text-base font-semibold leading-none">Novus</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Present across Novus
                </div>
              </div>
              <button
                onClick={() => setNovusOpen(false)}
                className="focus-ring flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close Novus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
              {messages.length === 0 && !thinking ? (
                <div className="flex h-full flex-col justify-center py-4 text-left sm:py-8">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="h-px w-8 bg-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Intelligence, in context</span>
                  </div>
                  <p className="max-w-lg font-display text-4xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl">Make sense of now.</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Ask about your day, or tell me to create a habit, set a goal, log your mood — I&apos;ll actually do it.
                  </p>
                  <div className="mt-8 w-full border-t border-white/[0.08]">
                    {suggestions.map((s, index) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="focus-ring group flex w-full items-center gap-4 border-b border-white/[0.08] py-3.5 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:text-primary sm:py-4"
                      >
                        <span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span>
                        <span className="flex-1">{s}</span>
                        <span aria-hidden="true" className="text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={cn("flex border-l py-1 pl-4", m.role === "user" ? "border-primary justify-end" : "border-white/[0.14] justify-start")}>
                    <div
                      className={cn(
                        "max-w-[92%] whitespace-pre-wrap py-2 text-sm leading-relaxed",
                        m.role === "user" ? "text-foreground" : "text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}

              {thinking && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 border-l border-primary px-4 py-3">
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
                  className="space-y-3 border-l-2 border-destructive bg-destructive/[0.05] p-4"
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
                      className="flex-1 bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {executing ? "Working…" : "Yes, do it"}
                    </button>
                    <button
                      onClick={cancelPending}
                      disabled={executing}
                      className="flex-1 border border-white/[0.1] py-2 text-sm font-medium text-foreground transition-colors hover:border-white/[0.2]"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-white/[0.07] px-4 py-3 sm:px-7 sm:py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!pending && !executing) send(query);
                }}
                className="flex items-center gap-2 border-b border-white/[0.16] py-2 transition-colors focus-within:border-primary"
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
                  className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
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
