"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, Brain, CalendarCheck, Clock3, Command, Dumbbell, Fingerprint,
  Flame, KanbanSquare, LayoutGrid, ListTodo, Menu, NotebookPen, Settings,
  Smile, Sparkles, Target, Wallet, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-store";

type Destination = { name: string; href: string; icon: LucideIcon; detail: string };

const PRIMARY: Destination[] = [
  { name: "Now", href: "/dashboard", icon: LayoutGrid, detail: "Your current life state" },
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

const spring = { type: "spring" as const, stiffness: 430, damping: 34 };
const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function OperatingDock() {
  const pathname = usePathname();
  const { setCommandOpen, setNovusOpen } = useAppStore();
  const [spacesOpen, setSpacesOpen] = React.useState(false);
  React.useEffect(() => setSpacesOpen(false), [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[76px] flex-col items-center border-r border-white/[0.06] bg-background/75 py-4 backdrop-blur-2xl lg:flex">
        <Link href="/dashboard" aria-label="Novus Now" className="focus-ring mb-5 flex h-11 w-11 items-center justify-center rounded-[15px]">
          <span className="h-3 w-3 rounded-[4px] bg-primary shadow-[0_0_24px_hsl(var(--primary)/0.35)]" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Primary navigation">
          {PRIMARY.map((item) => <DockLink key={item.href} item={item} active={isCurrent(pathname, item.href)} />)}
          <span className="my-2 h-px w-7 bg-white/[0.08]" />
          <DockButton label="All spaces" icon={Menu} active={spacesOpen} onClick={() => setSpacesOpen(true)} />
        </nav>
        <div className="flex flex-col gap-1.5">
          <DockButton label="Command" icon={Command} onClick={() => setCommandOpen(true)} shortcut="K" />
          <DockButton label="Ask Novus" icon={Sparkles} signal onClick={() => setNovusOpen(true)} shortcut="J" />
          <DockLink item={{ name: "Settings", href: "/settings", icon: Settings, detail: "Account and preferences" }} active={isCurrent(pathname, "/settings")} />
        </div>
      </aside>

      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-50 px-3 lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-[22px] border border-white/[0.09] bg-[#101112]/95 px-2 py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <MobileLink item={PRIMARY[0]} active={isCurrent(pathname, PRIMARY[0].href)} />
          <MobileLink item={PRIMARY[3]} active={isCurrent(pathname, PRIMARY[3].href)} />
          <button onClick={() => setNovusOpen(true)} className="focus-ring relative -mt-7 flex h-14 w-14 items-center justify-center rounded-[19px] bg-primary text-primary-foreground shadow-[0_12px_34px_hsl(var(--primary)/0.22)] active:scale-95" aria-label="Ask Novus">
            <Sparkles className="h-5 w-5" strokeWidth={2.1} />
          </button>
          <MobileLink item={PRIMARY[2]} active={isCurrent(pathname, PRIMARY[2].href)} />
          <button onClick={() => setSpacesOpen(true)} className="focus-ring flex min-w-[54px] flex-col items-center gap-1 px-2 py-1.5 text-muted-foreground" aria-label="All spaces">
            <Menu className="h-5 w-5" strokeWidth={1.8} /><span className="text-[10px] font-medium">Spaces</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {spacesOpen && (
          <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-sm" onClick={() => setSpacesOpen(false)} aria-label="Close spaces" />
            <motion.section role="dialog" aria-modal="true" aria-label="All Novus spaces" className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-[30px] border-t border-white/[0.09] bg-[#0d0e0f] p-5 shadow-2xl lg:bottom-auto lg:left-[88px] lg:right-auto lg:top-5 lg:max-h-[calc(100vh-40px)] lg:w-[410px] lg:rounded-[26px] lg:border" initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0, scale: 0.98 }} transition={spring}>
              <div className="mb-5 flex items-start justify-between">
                <div><h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Your spaces</h2><p className="mt-1 text-sm text-muted-foreground">Everything remains one command away.</p></div>
                <button onClick={() => setSpacesOpen(false)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[calc(88dvh-105px)] overflow-y-auto pr-1 lg:max-h-[calc(100vh-145px)]">
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_SPACES.map((item) => {
                    const Icon = item.icon; const active = isCurrent(pathname, item.href);
                    return <Link key={item.href} href={item.href} className={cn("group rounded-[18px] p-3.5 transition-colors", active ? "bg-primary text-primary-foreground" : "bg-white/[0.035] hover:bg-white/[0.07]")}><Icon className="h-5 w-5" strokeWidth={1.7} /><div className="mt-3 text-sm font-semibold">{item.name}</div><div className={cn("mt-0.5 text-xs leading-snug", active ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.detail}</div></Link>;
                  })}
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DockLink({ item, active }: { item: Destination; active: boolean }) {
  const Icon = item.icon;
  return <Link href={item.href} className={cn("focus-ring group relative flex h-11 w-11 items-center justify-center rounded-[14px] transition-colors", active ? "text-primary" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground")} aria-label={item.name} title={item.name}>{active && <motion.span layoutId="desktop-dock-active" className="absolute inset-0 rounded-[14px] bg-primary/[0.09]" transition={spring} />}<Icon className="relative h-[19px] w-[19px]" strokeWidth={active ? 2 : 1.7} />{active && <motion.span layoutId="desktop-dock-dot" className="absolute -left-[18px] h-5 w-[3px] rounded-full bg-primary" transition={spring} />}<Tooltip label={item.name} /></Link>;
}

function DockButton({ label, icon: Icon, onClick, signal, active, shortcut }: { label: string; icon: LucideIcon; onClick: () => void; signal?: boolean; active?: boolean; shortcut?: string }) {
  return <button onClick={onClick} className={cn("focus-ring group relative flex h-11 w-11 items-center justify-center rounded-[14px] transition-all", signal ? "bg-primary text-primary-foreground hover:scale-[1.04]" : active ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground")} aria-label={label}><Icon className="h-[19px] w-[19px]" strokeWidth={signal ? 2.1 : 1.7} /><Tooltip label={label} shortcut={shortcut} /></button>;
}

function Tooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return <span className="pointer-events-none absolute left-[54px] z-50 hidden whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#171819] px-2.5 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:block">{label}{shortcut && <kbd className="ml-2 font-mono text-[9px] text-muted-foreground">⌘{shortcut}</kbd>}</span>;
}

function MobileLink({ item, active }: { item: Destination; active: boolean }) {
  const Icon = item.icon;
  return <Link href={item.href} className={cn("focus-ring relative flex min-w-[54px] flex-col items-center gap-1 px-2 py-1.5", active ? "text-primary" : "text-muted-foreground")} aria-label={item.name}><Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.7} /><span className="text-[10px] font-medium">{item.name}</span>{active && <motion.span layoutId="mobile-dock-active" className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" transition={spring} />}</Link>;
}
