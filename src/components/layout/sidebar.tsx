"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateLevel } from "@/lib/gamification";
import { NovusMark } from "@/components/shared/novus-logo";
import { useAppStore } from "@/hooks/use-store";

const navItems = [
  { name: "Home", href: "/dashboard", icon: "home" },
  { name: "Journal", href: "/journal", icon: "book" },
  { name: "Habits", href: "/habits", icon: "check" },
  { name: "Tasks", href: "/tasks", icon: "list" },
  { name: "Goals", href: "/goals", icon: "target" },
  { name: "Projects", href: "/projects", icon: "briefcase" },
  { name: "Finance", href: "/finance", icon: "wallet" },
  { name: "Workout", href: "/workout", icon: "dumbbell" },
  { name: "Mood", href: "/mood", icon: "heart" },
  { name: "Timeline", href: "/timeline", icon: "clock" },
  { name: "Statistics", href: "/statistics", icon: "chart" },
];

const iconMap: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  list: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  target: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  wallet: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  dumbbell: "M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7M8 12a4 4 0 118 0 4 4 0 01-8 0zm-3 0h2m10 0h2",
  heart: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

function NavIcon({ icon }: { icon: string }) {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {iconMap[icon].split(" M").map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const { setCommandOpen } = useAppStore();
  const [userData, setUserData] = useState<{ xp: number; level: number; name: string; subscription?: { plan: string } } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user").then((r) => r.json()).then(setUserData).catch(() => {});
    }
  }, [session?.user?.id]);

  const levelInfo = userData ? calculateLevel(userData.xp ?? 0) : null;
  const displayName = userData?.name || session?.user?.name || "User";
  const isPro = userData?.subscription?.plan === "PRO";

  return (
    <>
      {/* Mobile overlay — only shown when sidebar is open (desktop only use case) */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, hidden on mobile (bottom nav used instead) */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-screen w-[260px] p-3">
        <div className="h-full w-full flex flex-col glass-panel rounded-[28px] overflow-hidden">
          {/* Logo */}
          <div className="p-5 pb-3">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
              <NovusMark size="md" />
              <div>
                <span className="font-semibold text-lg tracking-tight">Novus</span>
                <div className="text-[11px] text-muted-foreground -mt-0.5">
                  {isPro ? "Pro" : "Free"} workspace
                </div>
              </div>
            </Link>
          </div>

          {/* Command trigger */}
          <div className="px-4 pb-3">
            <button
              onClick={() => { setCommandOpen(true); setIsMobileOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/50 text-sm text-muted-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-background/60 border border-border/60">⌘K</kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl bg-primary/15 ring-1 ring-primary/20"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={cn("relative z-10", isActive && "text-primary")}><NavIcon icon={item.icon} /></span>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom: settings + user */}
          <div className="px-3 py-3 space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                pathname === "/settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <NavIcon icon="settings" /> Settings
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors mt-1"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{displayName}</div>
                {levelInfo ? (
                  <div className="text-[11px] text-muted-foreground truncate">
                    Lvl {levelInfo.level} · {levelInfo.title}
                  </div>
                ) : <div className="text-[11px] text-muted-foreground">Loading…</div>}
                {levelInfo && (
                  <div className="mt-1 h-1 w-full bg-background/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${levelInfo.progress}%` }} />
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}