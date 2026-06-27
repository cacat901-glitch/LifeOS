"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  NotebookPen,
  Flame,
  ListTodo,
  Target,
  KanbanSquare,
  Wallet,
  Dumbbell,
  Smile,
  CalendarCheck,
  Brain,
  Clock,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  Fingerprint,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateLevel } from "@/lib/gamification";
import { useAppStore } from "@/hooks/use-store";

type NavItem = { name: string; href: string; icon: LucideIcon };

const PRIMARY: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: NotebookPen },
  { name: "Habits", href: "/habits", icon: Flame },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Projects", href: "/projects", icon: KanbanSquare },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Workout", href: "/workout", icon: Dumbbell },
  { name: "Mood", href: "/mood", icon: Smile },
];

const INTELLIGENCE: NavItem[] = [
  { name: "Life DNA", href: "/dna", icon: Fingerprint },
  { name: "Weekly Review", href: "/review", icon: CalendarCheck },
  { name: "Life Analyst", href: "/analyst", icon: Brain },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setCommandOpen, setNovusOpen } = useAppStore();
  const [userData, setUserData] = useState<{
    xp: number;
    level: number;
    name: string;
    subscription?: { plan: string };
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user").then((r) => r.json()).then(setUserData).catch(() => {});
    }
  }, [session?.user?.id]);

  const levelInfo = userData ? calculateLevel(userData.xp ?? 0) : null;
  const displayName = userData?.name || session?.user?.name || "User";
  const isPro = userData?.subscription?.plan === "PRO";

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-0 rounded-lg bg-secondary"
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          />
        )}
        {isActive && (
          <motion.span
            layoutId="nav-bar"
            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          />
        )}
        <Icon className={cn("relative z-10 h-[18px] w-[18px]", isActive && "text-primary")} strokeWidth={1.75} />
        <span className="relative z-10 font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[248px] flex-col border-r border-border bg-background/60 backdrop-blur-xl lg:flex">
      {/* Wordmark */}
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="group inline-flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-primary transition-transform duration-500 group-hover:rotate-[225deg]" />
          <span className="font-display text-lg font-semibold leading-none tracking-tight text-foreground">
            Novus
          </span>
          <span className="ml-1 rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
            {isPro ? "Pro" : "Free"}
          </span>
        </Link>
      </div>

      {/* Novus AI — its own prominent space */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setNovusOpen(true)}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2.5 text-left transition-colors hover:bg-primary/[0.12]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold leading-tight text-foreground">Ask Novus</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Your AI companion</span>
          </span>
          <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘J</kbd>
        </button>
      </div>

      {/* Command trigger */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {PRIMARY.map(renderItem)}

        <div className="px-3 pb-1.5 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Intelligence
          </span>
        </div>
        {INTELLIGENCE.map(renderItem)}
      </nav>

      {/* Bottom: settings + user */}
      <div className="space-y-1 border-t border-border px-3 py-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Settings
        </Link>

        <Link href="/settings" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-sm font-semibold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{displayName}</div>
            {levelInfo ? (
              <div className="truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                Lvl {levelInfo.level} · {levelInfo.title}
              </div>
            ) : (
              <div className="font-mono text-[10px] text-muted-foreground">Loading…</div>
            )}
            {levelInfo && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${levelInfo.progress}%` }} />
              </div>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
