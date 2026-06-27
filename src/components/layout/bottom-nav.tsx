"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Flame,
  Target,
  Menu,
  NotebookPen,
  ListTodo,
  KanbanSquare,
  Wallet,
  Dumbbell,
  Smile,
  CalendarCheck,
  Brain,
  Clock,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";

export function BottomNav() {
  const pathname = usePathname();
  const { setNovusOpen } = useAppStore();

  const tab = (href: string, name: string, Icon: LucideIcon) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className="tap-small relative flex min-w-[48px] flex-col items-center gap-1 px-3 py-2"
        aria-label={name}
      >
        <Icon className={cn("h-[22px] w-[22px] transition-colors", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
        <span className={cn("text-[10px] font-medium leading-none transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
          {name}
        </span>
        {isActive && (
          <motion.div
            layoutId="bottom-active"
            className="absolute -top-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl border border-border bg-popover/90 px-2 py-1 shadow-2xl backdrop-blur-xl">
        {tab("/dashboard", "Home", LayoutDashboard)}
        {tab("/habits", "Habits", Flame)}

        {/* Centre — Ask Novus */}
        <button
          onClick={() => setNovusOpen(true)}
          className="relative -mt-6 flex flex-col items-center"
          aria-label="Open Novus AI"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary ring-4 ring-background transition-transform active:scale-95">
            <span className="font-display text-xl font-bold text-primary-foreground">N</span>
          </div>
        </button>

        {tab("/goals", "Goals", Target)}
        <MobileMoreButton />
      </div>
    </nav>
  );
}

// ── Mobile "More" → slide-up drawer ────────────────────────
function MobileMoreButton() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const moreItems: { name: string; href: string; icon: LucideIcon }[] = [
    { name: "Journal", href: "/journal", icon: NotebookPen },
    { name: "Tasks", href: "/tasks", icon: ListTodo },
    { name: "Projects", href: "/projects", icon: KanbanSquare },
    { name: "Finance", href: "/finance", icon: Wallet },
    { name: "Workout", href: "/workout", icon: Dumbbell },
    { name: "Mood", href: "/mood", icon: Smile },
    { name: "Weekly Review", href: "/review", icon: CalendarCheck },
    { name: "Life Analyst", href: "/analyst", icon: Brain },
    { name: "Timeline", href: "/timeline", icon: Clock },
    { name: "Statistics", href: "/statistics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap-small flex min-w-[48px] flex-col items-center gap-1 px-3 py-2"
        aria-label="More"
      >
        <Menu className="h-[22px] w-[22px] text-muted-foreground" strokeWidth={1.75} />
        <span className="text-[10px] font-medium leading-none text-muted-foreground">More</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-popover px-4 pb-8 pt-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/30" />
              <div className="grid grid-cols-3 gap-3">
                {moreItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                      <span className="text-xs font-medium leading-none">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Novus · Personal Operating System
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
