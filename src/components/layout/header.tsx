"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Sparkles,
  Flame,
  Target,
  ListTodo,
  Dumbbell,
  Trophy,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { formatRelative, cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Home", "/journal": "Journal", "/habits": "Habits", "/tasks": "Tasks",
  "/goals": "Goals", "/projects": "Projects", "/finance": "Finance", "/workout": "Workout",
  "/mood": "Mood", "/timeline": "Your Life", "/statistics": "Statistics", "/settings": "Settings",
  "/review": "Weekly Review", "/analyst": "Life Analyst",
};

const TYPE_ICON: Record<string, LucideIcon> = {
  HABIT_REMINDER: Flame,
  GOAL_REMINDER: Target,
  TASK_REMINDER: ListTodo,
  WORKOUT_REMINDER: Dumbbell,
  ACHIEVEMENT_UNLOCKED: Trophy,
  STREAK_AT_RISK: Flame,
  WEEKLY_SUMMARY: BarChart3,
  SYSTEM: Bell,
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Novus";
  const { setNovusOpen } = useAppStore();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
        setUnread(d.unreadCount || 0);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const t = setInterval(loadNotifications, 60_000);
    return () => clearInterval(t);
  }, [loadNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };
  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnread(0);
  };
  const markOne = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-10">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-base font-semibold tracking-tight md:text-lg">{title}</h1>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ask Novus */}
          <button
            onClick={() => setNovusOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] py-2 pl-2.5 pr-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/[0.12] sm:flex"
          >
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.9} />
            Ask Novus
            <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ⌘J
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => {
                setOpen((o) => !o);
                if (!open) loadNotifications();
              }}
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Notifications
                    </h3>
                    <div className="flex gap-3">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 divide-y divide-border overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        <Bell className="mx-auto mb-2 h-5 w-5 opacity-50" />
                        You&apos;re all caught up.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const Icon = TYPE_ICON[n.type] || Bell;
                        return (
                          <button
                            key={n.id}
                            onClick={() => {
                              markOne(n.id);
                              if (n.actionUrl) window.location.href = n.actionUrl;
                            }}
                            className={cn(
                              "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                              !n.isRead && "bg-primary/[0.04]"
                            )}
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn("text-sm font-medium leading-snug", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                                  {n.title}
                                </p>
                                {!n.isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">
                                {formatRelative(n.createdAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
