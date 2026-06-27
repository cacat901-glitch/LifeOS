"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

// ── Command definitions ────────────────────────────────────
interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  group: "Create" | "Navigate" | "Intelligence";
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
  { id: "new-task",   group: "Create", label: "Create Task",          hint: "Tasks",   keywords: "todo add",
    icon: I("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"), run: (r) => r.push("/tasks?new=1") },
  { id: "new-habit",  group: "Create", label: "Create Habit",         hint: "Habits",  keywords: "routine streak",
    icon: I("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"), run: (r) => r.push("/habits?new=1") },
  { id: "new-goal",   group: "Create", label: "Create Goal",          hint: "Goals",   keywords: "objective target",
    icon: I("M13 10V3L4 14h7v7l9-11h-7z"), run: (r) => r.push("/goals?new=1") },
  { id: "new-journal",group: "Create", label: "Create Journal Entry", hint: "Journal", keywords: "write note diary",
    icon: I("M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"), run: (r) => r.push("/journal?new=1") },
  { id: "start-workout", group: "Create", label: "Start Workout",     hint: "Workout", keywords: "gym lift train",
    icon: I("M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7M8 12a4 4 0 118 0 4 4 0 01-8 0zm-3 0h2m10 0h2"), run: (r) => r.push("/workout?new=1") },
  { id: "log-mood",   group: "Create", label: "Log Mood",             hint: "Mood",    keywords: "feeling emotion",
    icon: I("M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"), run: (r) => r.push("/mood") },
  { id: "add-tx",     group: "Create", label: "Add Transaction",      hint: "Finance", keywords: "money expense income",
    icon: I("M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"), run: (r) => r.push("/finance") },

  // Intelligence (navigation to AI surfaces)
  { id: "life-dna",        group: "Intelligence", label: "Life DNA",            hint: "AI",  keywords: "profile identity who am i deepest novus",
    icon: I("M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"), run: (r) => r.push("/dna") },
  { id: "weekly-review",   group: "Intelligence", label: "Weekly Review",       hint: "AI",  keywords: "summary week novus",
    icon: I("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"), run: (r) => r.push("/review") },
  { id: "analyze-life",    group: "Intelligence", label: "Analyze My Life",     hint: "AI",  keywords: "life coach analysis patterns novus",
    icon: I("M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"), run: (r) => r.push("/analyst") },
  { id: "life-patterns",   group: "Intelligence", label: "Show Life Patterns",  hint: "AI",  keywords: "patterns insights habits mood",
    icon: I("M13 10V3L4 14h7v7l9-11h-7z"), run: (r) => r.push("/analyst?tab=patterns") },
  { id: "life-memory",     group: "Intelligence", label: "Life Memory",         hint: "AI",  keywords: "history progress how have i changed",
    icon: I("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"), run: (r) => r.push("/analyst?tab=memory") },

  // Navigate
  { id: "nav-home",     group: "Navigate", label: "Go to Home",        keywords: "dashboard",
    icon: I("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"), run: (r) => r.push("/dashboard") },
  { id: "nav-timeline", group: "Navigate", label: "Go to Timeline",    keywords: "life map history",
    icon: I("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"), run: (r) => r.push("/timeline") },
  { id: "nav-stats",    group: "Navigate", label: "Go to Statistics",  keywords: "analytics charts",
    icon: I("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"), run: (r) => r.push("/statistics") },
  { id: "nav-projects", group: "Navigate", label: "Go to Projects",    keywords: "work kanban",
    icon: I("M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"), run: (r) => r.push("/projects") },
  { id: "nav-settings", group: "Navigate", label: "Go to Settings",   keywords: "preferences account",
    icon: I("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"), run: (r) => r.push("/settings") },
];

export function CommandCenter() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, toggleCommand, setNovusOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  const filtered = COMMANDS.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.label.toLowerCase().includes(q) || c.keywords?.includes(q) || c.group.toLowerCase().includes(q);
  });

  const groups = ["Create", "Intelligence", "Navigate"] as const;

  const runCommand = useCallback(
    (cmd: Command) => {
      setCommandOpen(false);
      setTimeout(() => cmd.run(router), 80);
    },
    [router, setCommandOpen]
  );

  const openNovus = useCallback(() => {
    setCommandOpen(false);
    setTimeout(() => setNovusOpen(true), 100);
  }, [setCommandOpen, setNovusOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active === filtered.length) openNovus();
      else if (filtered[active]) runCommand(filtered[active]);
    }
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center px-0 sm:items-start sm:px-4 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setCommandOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Palette */}
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-t-3xl shadow-2xl ring-1 ring-white/10 glass-strong sm:rounded-3xl"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            {/* Input row */}
            <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search or type a command…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-2 sm:max-h-[52vh]">
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
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
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

              {/* Ask Novus → opens the dedicated panel */}
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Novus AI</div>
                <button
                  onMouseEnter={() => setActive(filtered.length)}
                  onClick={openNovus}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active === filtered.length ? "bg-primary/15" : "hover:bg-muted/50"
                  )}
                >
                  <span className="flex h-[18px] w-[18px] items-center justify-center text-primary">
                    <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 font-medium text-foreground">
                    {query ? `Ask Novus: "${query}"` : "Ask Novus"}
                  </span>
                  <kbd className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘J</kbd>
                </button>
              </div>

              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No commands found. Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Enter</kbd> to ask Novus.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex h-11 items-center justify-between border-t border-border/60 px-5 text-[11px] text-muted-foreground">
              <span className="font-mono uppercase tracking-[0.15em]">Command Center</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5">↵</kbd> select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
