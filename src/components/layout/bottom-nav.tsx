"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";

// The 5 most important destinations on mobile
const TABS = [
  {
    name: "Home",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Habits",
    href: "/habits",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    // Centre button — opens command palette
    name: "Novus",
    href: null,
    icon: null, // rendered specially
  },
  {
    name: "Goals",
    href: "/goals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "More",
    href: "/menu",    // handled below — opens the mobile nav drawer
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { setCommandOpen } = useAppStore();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bottom-nav">
      <div className="mx-3 mb-3 glass-strong rounded-[20px] px-2 py-1 flex items-center justify-around ring-1 ring-white/10 shadow-2xl">
        {TABS.map((tab) => {
          // ── Centre / AI button ──────────────────────────────
          if (tab.name === "Novus") {
            return (
              <button
                key="novus"
                onClick={() => setCommandOpen(true)}
                className="relative -mt-5 flex flex-col items-center"
                aria-label="Open Novus AI"
              >
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_8px_32px_-4px_rgba(99,102,241,0.8)] ring-4 ring-background">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
              </button>
            );
          }

          // ── "More" opens the sidebar on mobile ──────────────
          if (tab.name === "More") {
            return (
              <MobileMoreButton key="more" />
            );
          }

          // ── Regular nav tab ─────────────────────────────────
          const isActive = tab.href
            ? (pathname === tab.href || pathname.startsWith(tab.href + "/"))
            : false;

          return (
            <Link
              key={tab.href!}
              href={tab.href!}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[48px] tap-small"
              aria-label={tab.name}
            >
              <span className={cn(
                "transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.icon}
              </span>
              <span className={cn(
                "text-[10px] font-medium transition-colors leading-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Mobile "More" → slides up a full-screen drawer ────────
function MobileMoreButton() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close on route change
  React.useEffect(() => { setOpen(false); }, [pathname]);

  const moreItems = [
    { name: "Journal", href: "/journal", icon: "📓" },
    { name: "Tasks", href: "/tasks", icon: "📋" },
    { name: "Projects", href: "/projects", icon: "📁" },
    { name: "Finance", href: "/finance", icon: "💳" },
    { name: "Workout", href: "/workout", icon: "💪" },
    { name: "Mood", href: "/mood", icon: "💜" },
    { name: "Timeline", href: "/timeline", icon: "⏳" },
    { name: "Statistics", href: "/statistics", icon: "📊" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 px-3 py-2 min-w-[48px] tap-small"
        aria-label="More"
      >
        <span className="text-muted-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </span>
        <span className="text-[10px] font-medium text-muted-foreground leading-none">More</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 inset-x-0 z-50 glass-strong rounded-t-[28px] pb-8 pt-5 px-4"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />

              <div className="grid grid-cols-3 gap-3">
                {moreItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted/40 hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <span className="text-2xl leading-none">{item.icon}</span>
                      <span className="text-xs font-medium leading-none">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-border/40 pt-4">
                <p className="text-[11px] text-center text-muted-foreground">Novus · Your personal operating system.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
