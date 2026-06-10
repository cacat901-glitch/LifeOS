"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelative } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";
import { NovusMark } from "@/components/shared/novus-logo";

interface Notification {
  id: string; type: string; title: string; body: string;
  isRead: boolean; createdAt: string; actionUrl?: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Home", "/journal": "Journal", "/habits": "Habits", "/tasks": "Tasks",
  "/goals": "Goals", "/projects": "Projects", "/finance": "Finance", "/workout": "Workout",
  "/mood": "Mood", "/timeline": "Your Life", "/statistics": "Statistics", "/settings": "Settings",
};

const TYPE_ICON: Record<string, string> = {
  HABIT_REMINDER: "✅", GOAL_REMINDER: "🎯", TASK_REMINDER: "📋", WORKOUT_REMINDER: "💪",
  ACHIEVEMENT_UNLOCKED: "🏆", STREAK_AT_RISK: "🔥", WEEKLY_SUMMARY: "📊", SYSTEM: "🔔",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Novus";
  const { setCommandOpen } = useAppStore();

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
    } catch { /* silent */ }
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
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };
  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]); setUnread(0);
  };
  const markOne = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <header className="sticky top-0 z-30 px-3 md:px-6 lg:px-10 pt-3 md:pt-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between h-12 md:h-14 px-3 md:px-4 glass rounded-2xl">
        <div className="flex items-center gap-3">
          {/* On mobile, just show the page title — sidebar is replaced by bottom nav */}
          <h1 className="text-sm md:text-base font-semibold tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Ask Novus */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-primary/20 text-sm font-medium text-foreground hover:from-indigo-500/25 hover:to-violet-500/25 transition-colors"
          >
            <NovusMark size="sm" className="!h-5 !w-5 !text-[10px] !rounded-lg" />
            Ask Novus
            <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-background/50 border border-border/50 text-muted-foreground">⌘K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors"
              onClick={() => { setOpen((o) => !o); if (!open) loadNotifications(); }}
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 top-12 w-[min(320px,calc(100vw-1.5rem))] glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex gap-2">
                      {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>}
                      {notifications.length > 0 && <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        <div className="text-3xl mb-2">🔔</div>You&apos;re all caught up!
                      </div>
                    ) : notifications.map((n) => (
                      <button key={n.id}
                        onClick={() => { markOne(n.id); if (n.actionUrl) window.location.href = n.actionUrl; }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex gap-3 ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] || "🔔"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium leading-snug ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                        </div>
                      </button>
                    ))}
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
