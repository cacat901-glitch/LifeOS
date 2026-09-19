"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, X } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { AIActionConfirmation, AIActionResults, IntelligenceLiquid, IntelligenceResponse, NovusPromptRow, type IntelligenceResult, type IntelligenceState } from "./intelligence-primitives";

type ChatMsg = { role: "user" | "assistant"; content: string; results?: IntelligenceResult[]; degraded?: boolean };
type ChatResponse = { reply?: string; error?: string; degraded?: boolean; requiresConfirmation?: boolean; pendingActions?: unknown[]; confirmationSummary?: string[]; executed?: boolean; results?: IntelligenceResult[]; accountDeleted?: boolean };
const contexts: Record<string, { name: string; prompts: string[] }> = {
  dashboard: { name: "Now", prompts: ["What should I focus on today?", "Explain my current Life Score", "What pattern should I pay attention to?", "Create a task for my top priority"] },
  habits: { name: "Habits", prompts: ["Which habit needs attention?", "Help me create a habit that will stick", "What is affecting my consistency?", "Help me rebuild a streak"] },
  tasks: { name: "Tasks", prompts: ["Help me prioritize my tasks", "What should I focus on next?", "Create a task for my top priority", "Help me break down a difficult task"] },
  goals: { name: "Goals", prompts: ["Which goal needs attention?", "Break a goal into milestones", "How are my goals progressing?", "Help me choose my next priority"] },
};
const spaceNames: Record<string, string> = { journal: "Journal", finance: "Finance", workout: "Workout", mood: "Mood", projects: "Projects", statistics: "Statistics", timeline: "Timeline", settings: "Settings", analyst: "Analyst", dna: "Life DNA", review: "Weekly Review", "weekly-review": "Weekly Review", spaces: "Spaces" };
const generalPrompts = ["What should I focus on today?", "What pattern do you notice this week?", "Help me choose my next priority", "Help me reflect on my day"];

export function NovusPanel() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const { novusOpen, setNovusOpen, toggleNovus, novusDraft, clearNovusDraft } = useAppStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<{ actions: unknown[]; summary: string[] } | null>(null);
  const [executing, setExecuting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [failure, setFailure] = useState<{ text: string; request?: string } | null>(null);
  const busyRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const openerRef = useRef<HTMLElement | null>(null);
  const key = pathname.split("/")[1];
  const context = contexts[key];
  const contextName = context?.name || spaceNames[key] || "Your life";
  const suggestions = context?.prompts || generalPrompts;
  const state: IntelligenceState = executing ? "executing" : thinking ? "thinking" : failure ? "error" : complete ? "complete" : focused ? "focused" : "idle";

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") { event.preventDefault(); toggleNovus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleNovus]);
  useEffect(() => { if (novusDraft !== null) { setQuery(novusDraft); clearNovusDraft(); } }, [novusDraft, clearNovusDraft]);
  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(() => setComplete(false), 1500);
    return () => clearTimeout(timer);
  }, [complete]);
  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 132)}px`; }
  }, [query, novusOpen]);
  useEffect(() => {
    if (!novusOpen) return;
    const viewport = window.visualViewport;
    const fit = () => {
      if (!panelRef.current || !viewport || viewport.scale !== 1) return;
      panelRef.current.style.setProperty("--intelligence-height", `${viewport.height}px`);
      panelRef.current.style.setProperty("--intelligence-top", `${viewport.offsetTop}px`);
    };
    fit(); viewport?.addEventListener("resize", fit); viewport?.addEventListener("scroll", fit);
    return () => { viewport?.removeEventListener("resize", fit); viewport?.removeEventListener("scroll", fit); };
  }, [novusOpen]);
  useEffect(() => {
    if (!followRef.current) return;
    const scroll = scrollRef.current;
    scroll?.scrollTo({ top: scroll.scrollHeight, behavior: reduceMotion ? "instant" : "smooth" });
  }, [messages, pending, thinking, failure, reduceMotion]);

  const acceptResponse = useCallback((data: ChatResponse) => {
    setMessages(current => [...current, { role: "assistant", content: data.reply || "No response was returned. Please try again.", results: data.results, degraded: data.degraded }]);
    if (data.requiresConfirmation && Array.isArray(data.pendingActions)) {
      setPending({ actions: data.pendingActions, summary: data.confirmationSummary || [] });
    } else { setPending(null); if (data.executed) router.refresh(); }
    setComplete(!data.degraded && !data.results?.some(result => !result.ok));
    if (data.accountDeleted) window.setTimeout(() => { window.location.href = "/auth/login"; }, 1000);
  }, [router]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current || pending) return;
    busyRef.current = true;
    const next: ChatMsg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next); setQuery(""); setThinking(true); setFailure(null); setComplete(false); followRef.current = true;
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }) });
      const data: ChatResponse = await response.json();
      if (!response.ok || data.error) throw new Error(response.status === 401 ? "Your session has expired. Sign in again to continue." : "Novus couldn't complete this request.");
      acceptResponse(data);
    } catch (error) {
      setFailure({ text: `${error instanceof Error ? error.message : "Couldn't reach Novus."} If you requested a change, check its current state before trying again.`, request: trimmed });
    } finally { setThinking(false); busyRef.current = false; }
  }, [messages, pending, acceptResponse]);

  const confirmPending = useCallback(async () => {
    if (!pending || busyRef.current) return;
    busyRef.current = true; setExecuting(true); setFailure(null); setComplete(false); followRef.current = true;
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmActions: pending.actions }) });
      const data: ChatResponse = await response.json();
      if (!response.ok || data.error) throw new Error("The action could not be confirmed.");
      acceptResponse(data);
    } catch {
      // A lost response can follow a completed mutation. Never blindly replay.
      setPending(null); setFailure({ text: "The action result couldn't be verified. Check your data before asking Novus to try again." });
    } finally { setExecuting(false); busyRef.current = false; }
  }, [pending, acceptResponse]);

  return <Dialog.Root open={novusOpen} onOpenChange={setNovusOpen}><AnimatePresence>{novusOpen &&
    <Dialog.Portal forceMount><div className="intelligence-layer">
      <Dialog.Overlay asChild forceMount><motion.div className="intelligence-underlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .28 }} /></Dialog.Overlay>
      <Dialog.Content forceMount asChild onOpenAutoFocus={event => {
        event.preventDefault(); openerRef.current = document.activeElement as HTMLElement;
        if (matchMedia("(pointer: fine) and (min-width: 768px)").matches) inputRef.current?.focus(); else panelRef.current?.focus();
      }} onCloseAutoFocus={event => { event.preventDefault(); openerRef.current?.focus(); }} aria-describedby="intelligence-description">
        <motion.aside ref={panelRef} className="novus-canonical-panel intelligence-surface" data-state={state} data-conversation={messages.length > 0} initial={reduceMotion ? false : { x: 32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduceMotion ? 0 : 24, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .32, ease: [.22, .8, .2, 1] }}>
          <IntelligenceLiquid state={state} />
          <header className="intelligence-header"><NovusMark size="sm" /><Dialog.Title>Novus</Dialog.Title><span className="intelligence-context">From {contextName}</span><Dialog.Close asChild><button ref={closeRef} aria-label="Close Novus"><X /></button></Dialog.Close></header>
          <Dialog.Description id="intelligence-description" className="sr-only">Ask about your life or request an action. Destructive changes require confirmation.</Dialog.Description>
          <div ref={scrollRef} className="intelligence-body" onScroll={event => { const el = event.currentTarget; followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
            {!messages.length ? <div className="intelligence-welcome">
              <p className="intelligence-eyebrow">Intelligence, in context</p><h2>Make sense<br />of now.</h2>
              <p className="intelligence-intro">Ask about your day. Shape a habit, set a goal, or find your next step.</p>
              <div className="intelligence-prompts" aria-label="Suggested prompts">{suggestions.map((suggestion, index) => <NovusPromptRow key={suggestion} index={index} onSelect={() => send(suggestion)}>{suggestion}</NovusPromptRow>)}</div>
            </div> : <div className="intelligence-conversation" role="log" aria-label="Novus conversation" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => <article key={index} className={`intelligence-message intelligence-message--${message.role}`}><p className="intelligence-eyebrow">{message.role === "user" ? "Your request" : "Novus"}</p>{message.role === "user" ? <p className="intelligence-request">{message.content}</p> : <><IntelligenceResponse content={message.content} />{message.degraded && <p className="intelligence-degraded">Limited intelligence is available right now. No actions were performed.</p>}{message.results?.length ? <AIActionResults results={message.results} /> : null}</>}</article>)}
            </div>}
            {(thinking || executing) && <div className="intelligence-status" role="status"><span aria-hidden="true" />{executing ? "Executing your confirmed action" : "Considering your request"}</div>}
            {pending && <AIActionConfirmation summary={pending.summary} executing={executing} onConfirm={confirmPending} onCancel={() => { setPending(null); setMessages(current => [...current, { role: "assistant", content: "Cancelled. Nothing was changed." }]); }} />}
            {failure && <div className="intelligence-error" role="alert"><h3>Let&apos;s pause here.</h3><p>{failure.text}</p>{failure.request && <button onClick={() => { setQuery(failure.request!); setFailure(null); inputRef.current?.focus(); }}>Review request and retry</button>}</div>}
          </div>
          <footer className="intelligence-composer novus-panel-input">
            <form onSubmit={event => { event.preventDefault(); send(query); }}>
              <textarea ref={inputRef} aria-label="Ask Novus" rows={1} value={query} onChange={event => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={pending ? "Review the action above…" : "Ask Novus anything…"} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && matchMedia("(pointer: fine)").matches) { event.preventDefault(); send(query); } }} />
              <button type="submit" disabled={!query.trim() || thinking || executing || !!pending} aria-label="Send"><ArrowUp /></button>
            </form><div className="intelligence-composer-note"><span>{pending ? "Awaiting your confirmation" : "Novus can take real actions"}</span><span className="intelligence-keyhint">Shift + Enter for a new line</span></div>
          </footer>
        </motion.aside>
      </Dialog.Content>
    </div></Dialog.Portal>
  }</AnimatePresence></Dialog.Root>;
}
