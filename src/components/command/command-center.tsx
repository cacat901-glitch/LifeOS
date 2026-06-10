"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";
import { cn } from "@/lib/utils";

// ── Command definitions ────────────────────────────────────
interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  group: "Create" | "Navigate" | "Novus";
  run: (router: ReturnType<typeof useRouter>) => void;
  keywords?: string;
}

const I = (d: string) => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={d} />
  </svg>
);

const COMMANDS: Command[] = [
  // Create
  { id: "new-task", group: "Create", label: "Create Task", hint: "Tasks", keywords: "todo add",
    icon: I("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"),
    run: (r) => r.push("/tasks?new=1") },
  { id: "new-habit", group: "Create", label: "Create Habit", hint: "Habits", keywords: "routine streak",
    icon: I("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"),
    run: (r) => r.push("/habits?new=1") },
  { id: "new-goal", group: "Create", label: "Create Goal", hint: "Goals", keywords: "objective target",
    icon: I("M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"),
    run: (r) => r.push("/goals?new=1") },
  { id: "new-journal", group: "Create", label: "Create Journal Entry", hint: "Journal", keywords: "write note diary",
    icon: I("M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"),
    run: (r) => r.push("/journal?new=1") },
  { id: "start-workout", group: "Create", label: "Start Workout", hint: "Workout", keywords: "gym lift train",
    icon: I("M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7M8 12a4 4 0 118 0 4 4 0 01-8 0zm-3 0h2m10 0h2"),
    run: (r) => r.push("/workout?new=1") },
  { id: "log-mood", group: "Create", label: "Log Mood", hint: "Mood", keywords: "feeling emotion",
    icon: I("M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"),
    run: (r) => r.push("/mood") },
  { id: "add-transaction", group: "Create", label: "Add Transaction", hint: "Finance", keywords: "money expense income",
    icon: I("M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"),
    run: (r) => r.push("/finance") },

  // Navigate
  { id: "nav-home", group: "Navigate", label: "Go to Home", keywords: "dashboard",
    icon: I("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"),
    run: (r) => r.push("/dashboard") },
  { id: "nav-timeline", group: "Navigate", label: "Go to Timeline", keywords: "life map history",
    icon: I("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"),
    run: (r) => r.push("/timeline") },
  { id: "nav-stats", group: "Navigate", label: "Go to Statistics", keywords: "analytics charts",
    icon: I("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),
    run: (r) => r.push("/statistics") },
  { id: "nav-projects", group: "Navigate", label: "Go to Projects", keywords: "work kanban",
    icon: I("M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"),
    run: (r) => r.push("/projects") },
  { id: "nav-settings", group: "Navigate", label: "Go to Settings", keywords: "preferences account",
    icon: I("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"),
    run: (r) => r.push("/settings") },
];

type ChatMsg = { role: "user" | "assistant"; content: string };

export function CommandCenter() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, toggleCommand } = useAppStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [askMode, setAskMode] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommand();
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleCommand, setCommandOpen]);

  // Reset on open
  useEffect(() => {
    if (commandOpen) {
      setQuery(""); setActive(0); setAskMode(false); setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const filtered = COMMANDS.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.label.toLowerCase().includes(q) || c.keywords?.includes(q) || c.group.toLowerCase().includes(q);
  });

  const groups = ["Create", "Navigate"] as const;

  const runCommand = useCallback((cmd: Command) => {
    setCommandOpen(false);
    setTimeout(() => cmd.run(router), 80);
  }, [router, setCommandOpen]);

  const askNovus = useCallback(async (text: string) => {
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setQuery("");
    setThinking(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "I couldn't respond just now." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching Novus AI." }]);
    } finally {
      setThinking(false);
    }
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (askMode) {
      if (e.key === "Enter" && query.trim() && !thinking) { e.preventDefault(); askNovus(query.trim()); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active === filtered.length) { setAskMode(true); if (query.trim()) askNovus(query.trim()); }
      else if (filtered[active]) runCommand(filtered[active]);
    }
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center sm:pt-[12vh] px-0 sm:px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setCommandOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Palette */}
          <motion.div
            className="relative w-full max-w-2xl glass-strong sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-border/60">
              {askMode
                ? <NovusMark size="sm" />
                : <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              }
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                placeholder={askMode ? "Ask Novus anything…" : "Search or type a command…"}
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-1 rounded-md bg-muted/60 border border-border/60">
                ESC
              </kbd>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="max-h-[60vh] sm:max-h-[52vh] overflow-y-auto p-2">
              {askMode ? (
                <div className="p-3 space-y-4">
                  {messages.length === 0 && !thinking && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <NovusMark size="md" className="mx-auto mb-3" />
                      Ask me about your day, your goals, or what to focus on next.
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/70 text-foreground"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {thinking && (
                    <div className="flex justify-start">
                      <div className="bg-muted/70 rounded-2xl px-4 py-3 flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {groups.map((group) => {
                    const items = filtered.filter((c) => c.group === group);
                    if (!items.length) return null;
                    return (
                      <div key={group} className="mb-1">
                        <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{group}</div>
                        {items.map((cmd) => {
                          const idx = filtered.indexOf(cmd);
                          return (
                            <button
                              key={cmd.id}
                              onMouseEnter={() => setActive(idx)}
                              onClick={() => runCommand(cmd)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                                active === idx ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              <span className={cn("shrink-0", active === idx ? "text-primary" : "")}>{cmd.icon}</span>
                              <span className="flex-1 font-medium text-foreground">{cmd.label}</span>
                              {cmd.hint && <span className="text-xs text-muted-foreground">{cmd.hint}</span>}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Ask Novus row */}
                  <div className="mb-1">
                    <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Novus AI</div>
                    <button
                      onMouseEnter={() => setActive(filtered.length)}
                      onClick={() => setAskMode(true)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                        active === filtered.length ? "bg-primary/15" : "hover:bg-muted/50"
                      )}
                    >
                      <NovusMark size="sm" />
                      <span className="flex-1 font-medium text-foreground">
                        {query ? `Ask Novus: "${query}"` : "Ask Novus"}
                      </span>
                      <span className="text-xs text-muted-foreground">AI</span>
                    </button>
                  </div>

                  {filtered.length === 0 && (
                    <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                      No commands found. Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd> to ask Novus.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 h-11 border-t border-border/60 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <NovusMark size="sm" className="!h-4 !w-4 !text-[9px] !rounded-md" />
                Novus Command Center
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted/60 border border-border/60">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted/60 border border-border/60">↵</kbd> select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
