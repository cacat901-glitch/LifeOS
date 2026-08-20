"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3, Brain, CalendarCheck, Clock3, Dumbbell, Fingerprint, Flame,
  KanbanSquare, ListTodo, Menu, NotebookPen, Settings, Smile, Target,
  Wallet, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";

type Destination = { name: string; href: string; icon: LucideIcon; detail: string };

const PRIMARY: Destination[] = [
  { name: "Now", href: "/dashboard", icon: Clock3, detail: "Your current life state" },
  { name: "Journal", href: "/journal", icon: NotebookPen, detail: "Write and reflect" },
  { name: "Habits", href: "/habits", icon: Flame, detail: "Daily rhythms" },
  { name: "Tasks", href: "/tasks", icon: ListTodo, detail: "What needs doing" },
  { name: "Goals", href: "/goals", icon: Target, detail: "Longer trajectories" },
];

const ALL_SPACES: Destination[] = [
  ...PRIMARY,
  { name: "Projects", href: "/projects", icon: KanbanSquare, detail: "Larger bodies of work" },
  { name: "Finance", href: "/finance", icon: Wallet, detail: "Accounts and spending" },
  { name: "Workout", href: "/workout", icon: Dumbbell, detail: "Training and progress" },
  { name: "Mood", href: "/mood", icon: Smile, detail: "How you have felt" },
  { name: "Life DNA", href: "/dna", icon: Fingerprint, detail: "What Novus understands" },
  { name: "Weekly Review", href: "/review", icon: CalendarCheck, detail: "The week in perspective" },
  { name: "Life Analyst", href: "/analyst", icon: Brain, detail: "Patterns across your life" },
  { name: "Timeline", href: "/timeline", icon: Clock3, detail: "Your life over time" },
  { name: "Statistics", href: "/statistics", icon: BarChart3, detail: "Detailed measurements" },
  { name: "Settings", href: "/settings", icon: Settings, detail: "Account and preferences" },
];

const spring = { type: "spring" as const, stiffness: 420, damping: 36 };
const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function OperatingDock() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { setNovusOpen } = useAppStore();
  const [spacesOpen, setSpacesOpen] = React.useState(false);

  React.useEffect(() => setSpacesOpen(false), [pathname]);

  return (
    <>
      <nav className="fixed left-1/2 top-0 z-50 hidden h-16 -translate-x-1/2 items-center gap-4 lg:flex xl:gap-7" aria-label="Primary navigation">
        {PRIMARY.map((item) => <DesktopLink key={item.href} item={item} active={isCurrent(pathname, item.href)} />)}
        <button onClick={() => setSpacesOpen(true)} className="focus-ring group relative flex h-11 items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground" aria-label="All spaces">
          <Menu className="h-4 w-4" strokeWidth={1.7} /><span>Spaces</span>
        </button>
      </nav>

      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#0b0c0c]/[0.94] px-2 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 items-stretch">
          <MobileLink item={PRIMARY[0]} active={isCurrent(pathname, PRIMARY[0].href)} />
          <MobileLink item={PRIMARY[3]} active={isCurrent(pathname, PRIMARY[3].href)} />
          <button onClick={() => setNovusOpen(true)} className="focus-ring group relative flex flex-col items-center justify-center gap-1 text-primary" aria-label="Ask Novus">
            <span className="absolute inset-x-3 top-0 h-px bg-primary" />
            <span className="font-display text-[13px] font-semibold tracking-[-0.02em]">Novus</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-primary/70">Ask</span>
          </button>
          <MobileLink item={PRIMARY[2]} active={isCurrent(pathname, PRIMARY[2].href)} />
          <button onClick={() => setSpacesOpen(true)} className="focus-ring relative flex flex-col items-center justify-center gap-1 text-muted-foreground" aria-label="All spaces">
            <Menu className="h-[18px] w-[18px]" strokeWidth={1.7} /><span className="text-[9px] font-medium">Spaces</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {spacesOpen && (
          <motion.div className="fixed inset-0 z-[80]" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[3px]" onClick={() => setSpacesOpen(false)} aria-label="Close spaces" />
            <motion.section role="dialog" aria-modal="true" aria-label="All Novus spaces" className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-hidden border-t border-white/[0.1] bg-[#0b0c0c]/[0.98] px-5 pb-[max(1.5rem,var(--safe-bottom))] pt-5 shadow-[0_-24px_80px_rgba(0,0,0,.55)] md:inset-y-0 md:left-auto md:w-[520px] md:border-l md:border-t-0 md:px-8 md:py-8" initial={reduceMotion ? false : { x: 36, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }} transition={spring}>
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
                <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Navigation</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.045em]">Your spaces</h2></div>
                <button onClick={() => setSpacesOpen(false)} className="focus-ring flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
              <div className="max-h-[calc(90dvh-105px)] overflow-y-auto md:max-h-[calc(100dvh-120px)]">
                {ALL_SPACES.map((item, index) => {
                  const Icon = item.icon; const active = isCurrent(pathname, item.href);
                  return <Link key={item.href} href={item.href} className={cn("focus-ring group grid min-h-[64px] grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-white/[0.065] py-3 transition-colors", active ? "text-primary" : "text-foreground hover:text-primary")}><Icon className="h-[17px] w-[17px]" strokeWidth={active ? 2 : 1.6} /><span><span className="block font-display text-base font-medium tracking-[-0.015em]">{item.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span></span><span className="font-mono text-[9px] tabular-nums text-muted-foreground/55">{String(index + 1).padStart(2, "0")}</span></Link>;
                })}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DesktopLink({ item, active }: { item: Destination; active: boolean }) {
  return <Link href={item.href} className={cn("focus-ring group relative flex h-11 items-center text-[13px] font-medium transition-colors", active ? "text-foreground" : "text-muted-foreground hover:text-foreground")} aria-label={item.name}>{item.name}{active && <motion.span layoutId="desktop-space-active" className="absolute inset-x-0 bottom-0 h-px bg-primary" transition={spring} />}</Link>;
}

function MobileLink({ item, active }: { item: Destination; active: boolean }) {
  const Icon = item.icon;
  return <Link href={item.href} className={cn("focus-ring relative flex flex-col items-center justify-center gap-1", active ? "text-primary" : "text-muted-foreground")} aria-label={item.name}>{active && <motion.span layoutId="mobile-space-active" className="absolute inset-x-3 top-0 h-px bg-primary" transition={spring} />}<Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.6} /><span className="text-[9px] font-medium">{item.name}</span></Link>;
}
