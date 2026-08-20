"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, ArrowUp, X } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { NovusCore } from "@/components/novus/novus-core";
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
  const [pending, setPending] = useState<{ actions: unknown[]; summary: string[] } | null>(null);
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        toggleNovus();
      }
      if (event.key === "Escape") setNovusOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setNovusOpen, toggleNovus]);

  useEffect(() => {
    if (novusOpen) window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [novusOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, thinking]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setQuery("");
    setThinking(true);
    setPending(null);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "I couldn't respond just now." }]);
      if (data.requiresConfirmation && Array.isArray(data.pendingActions)) {
        setPending({ actions: data.pendingActions, summary: data.confirmationSummary || [] });
      } else if (data.executed) router.refresh();
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Something went wrong reaching Novus." }]);
    } finally {
      setThinking(false);
    }
  }, [messages, router, thinking]);

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    setExecuting(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmActions: pending.actions }) });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "Done." }]);
      setPending(null);
      if (data.accountDeleted) window.setTimeout(() => { window.location.href = "/auth/login"; }, 1000);
      else router.refresh();
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Something went wrong performing that action." }]);
    } finally {
      setExecuting(false);
    }
  }, [pending, router]);

  const cancelPending = useCallback(() => {
    setPending(null);
    setMessages((current) => [...current, { role: "assistant", content: "Okay — cancelled. Nothing was changed." }]);
  }, []);

  return (
    <AnimatePresence>
      {novusOpen && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button aria-label="Close Novus" className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-[4px]" onClick={() => setNovusOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Ask Novus"
            className="novus-canonical-panel absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden sm:w-[min(620px,calc(100vw-58px))]"
            initial={reduceMotion ? false : { x: 42, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: 30, opacity: 0 }}
            transition={reduceMotion ? { duration: .01 } : { type: "spring", stiffness: 350, damping: 36 }}
          >
            <NovusCore state={thinking ? "thinking" : "invoked"} variant="panel" className="novus-panel-liquid" />
            <header className="novus-panel-header">
              <NovusMark size="sm" />
              <strong>Novus</strong>
              <span>AI partner</span>
              <button onClick={() => setNovusOpen(false)} aria-label="Close Novus"><X /></button>
            </header>

            <div ref={scrollRef} className="novus-panel-body">
              {!messages.length && !thinking ? (
                <div className="novus-panel-empty">
                  <p className="novus-panel-kicker">Intelligence, in context</p>
                  <h2>How can I help<br />you make progress?</h2>
                  <p className="novus-panel-intro">Ask about your day, create a habit, set a goal, or log your mood. Novus can act on what you decide.</p>
                  <div className="novus-panel-orbit" aria-hidden="true"><NovusMark size="md" /></div>
                  <div className="novus-suggestions">
                    {suggestions.map((suggestion, index) => (
                      <button key={suggestion} onClick={() => send(suggestion)}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{suggestion}</strong>
                        <ArrowRight />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="novus-conversation">
                  {messages.map((message, index) => <div key={`${message.role}-${index}`} className={cn("novus-message", `novus-message--${message.role}`)}><span>{message.content}</span></div>)}
                  {thinking && <div className="novus-thinking" aria-label="Novus is thinking">{[0, 1, 2].map((index) => <motion.i key={index} animate={{ opacity: [.24, 1, .24], scale: [.85, 1, .85] }} transition={{ duration: 1.1, repeat: Infinity, delay: index * .14 }} />)}</div>}
                  {pending && (
                    <motion.div className="novus-confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <h3><AlertTriangle /> Confirm before I continue</h3>
                      <ul>{pending.summary.map((summary, index) => <li key={index}>{summary}</li>)}</ul>
                      <p>This permanently changes your data and can&apos;t be undone.</p>
                      <div><button onClick={confirmPending} disabled={executing}>{executing ? "Working…" : "Yes, do it"}</button><button onClick={cancelPending} disabled={executing}>Cancel</button></div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <footer className="novus-panel-input">
              <form onSubmit={(event) => { event.preventDefault(); if (!pending && !executing) send(query); }}>
                <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask Novus anything…" />
                <button type="submit" disabled={!query.trim() || thinking || !!pending} aria-label="Send"><ArrowUp /></button>
              </form>
              <p>Novus can take real actions</p>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
