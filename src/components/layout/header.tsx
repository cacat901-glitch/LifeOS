"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";

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
  "/dashboard":  "Dashboard",
  "/journal":    "Journal",
  "/habits":     "Habits",
  "/tasks":      "Tasks",
  "/goals":      "Goals",
  "/projects":   "Projects",
  "/finance":    "Finance",
  "/workout":    "Workout",
  "/mood":       "Mood",
  "/timeline":   "Your Life",
  "/statistics": "Statistics",
  "/settings":   "Settings",
};

const TYPE_ICON: Record<string, string> = {
  HABIT_REMINDER:       "✅",
  GOAL_REMINDER:        "🎯",
  TASK_REMINDER:        "📋",
  WORKOUT_REMINDER:     "💪",
  ACHIEVEMENT_UNLOCKED: "🏆",
  STREAK_AT_RISK:       "🔥",
  WEEKLY_SUMMARY:       "📊",
  SYSTEM:               "🔔",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "LifeOS";

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
    // Poll every 60 s
    const t = setInterval(loadNotifications, 60_000);
    return () => clearInterval(t);
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications bell */}
          <div className="relative" ref={panelRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => { setOpen((o) => !o); if (!open) loadNotifications(); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border bg-card shadow-xl z-50 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      <div className="text-3xl mb-2">🔔</div>
                      You&apos;re all caught up!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markOne(n.id);
                          if (n.actionUrl) window.location.href = n.actionUrl;
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] || "🔔"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium leading-snug ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                              {n.title}
                            </p>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add → links to dashboard */}
          <Button size="sm" className="hidden sm:flex gap-1.5"
            onClick={() => window.location.href = "/dashboard"}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </Button>
        </div>
      </div>
    </header>
  );
}
