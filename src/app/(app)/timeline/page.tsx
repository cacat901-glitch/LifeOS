"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";

interface TimelineEvent { id: string; type: string; title: string; description?: string; date: string }

const TYPE_META: Record<string, { icon: string; gradient: string; ring: string; label: string }> = {
  JOURNAL_ENTRY:        { icon: "✎",  gradient: "from-sky-500 to-blue-500",      ring: "ring-sky-500/30",     label: "Journal" },
  GOAL_ACHIEVED:        { icon: "✧",  gradient: "from-emerald-500 to-teal-500",  ring: "ring-emerald-500/30", label: "Goal" },
  HABIT_STREAK:         { icon: "✦",  gradient: "from-orange-500 to-amber-500",  ring: "ring-orange-500/30",  label: "Streak" },
  WORKOUT_PR:           { icon: "⟁",  gradient: "from-amber-500 to-yellow-500",  ring: "ring-amber-500/30",   label: "Workout" },
  ACHIEVEMENT_UNLOCKED: { icon: "★",  gradient: "from-violet-500 to-purple-500", ring: "ring-violet-500/30",  label: "Achievement" },
  MOOD_HIGH:            { icon: "♡",  gradient: "from-pink-500 to-rose-500",     ring: "ring-pink-500/30",    label: "Mood" },
  TASK_COMPLETED:       { icon: "◎",  gradient: "from-emerald-500 to-green-500", ring: "ring-emerald-500/30", label: "Task" },
  MILESTONE_REACHED:    { icon: "◈",  gradient: "from-indigo-500 to-violet-500", ring: "ring-indigo-500/30",  label: "Milestone" },
  CUSTOM:               { icon: "•",  gradient: "from-slate-500 to-gray-500",    ring: "ring-slate-500/30",   label: "Event" },
};

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

function groupByMonth(events: TimelineEvent[]) {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      fetch("/api/journal?limit=80").then((r) => r.json()),
      fetch("/api/mood?days=180").then((r) => r.json()),
      fetch("/api/workout?limit=80").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
    ]);
    const all: TimelineEvent[] = [];

    if (results[0].status === "fulfilled") {
      (results[0].value.entries || []).forEach((e: any) => all.push({
        id: `j-${e.id}`, type: "JOURNAL_ENTRY", title: e.title || "Journal entry",
        description: e.content?.slice(0, 90) + (e.content?.length > 90 ? "…" : ""), date: e.date,
      }));
    }
    if (results[1].status === "fulfilled") {
      (results[1].value.entries || []).filter((e: any) => e.score >= 8).forEach((e: any) => all.push({
        id: `m-${e.id}`, type: "MOOD_HIGH", title: `A great day — ${e.label}`, description: e.notes || undefined, date: e.date,
      }));
    }
    if (results[2].status === "fulfilled") {
      (Array.isArray(results[2].value) ? results[2].value : []).filter((s: any) => s.isCompleted).forEach((s: any) => all.push({
        id: `w-${s.id}`, type: "WORKOUT_PR", title: s.name,
        description: s.duration ? `${s.duration} min · ${Math.round(s.totalVolume)}kg moved` : undefined, date: s.startTime,
      }));
    }
    if (results[3].status === "fulfilled") {
      const goals: any[] = Array.isArray(results[3].value) ? results[3].value : [];
      goals.filter((g: any) => g.status === "COMPLETED").forEach((g: any) => all.push({
        id: `g-${g.id}`, type: "GOAL_ACHIEVED", title: `Achieved: ${g.title}`, date: g.completedAt || g.updatedAt,
      }));
      goals.forEach((g: any) => (g.milestones || []).filter((m: any) => m.isCompleted).forEach((m: any) => all.push({
        id: `ms-${m.id}`, type: "MILESTONE_REACHED", title: m.title, description: g.title, date: m.completedAt || m.updatedAt || g.updatedAt,
      })));
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const groups = groupByMonth(filtered);

  const stats = [
    { label: "Moments", value: events.length },
    { label: "Goals", value: events.filter((e) => e.type === "GOAL_ACHIEVED").length },
    { label: "Workouts", value: events.filter((e) => e.type === "WORKOUT_PR").length },
    { label: "Entries", value: events.filter((e) => e.type === "JOURNAL_ENTRY").length },
  ];

  const filterTypes = [
    { id: "all", label: "Everything" },
    { id: "JOURNAL_ENTRY", label: "Journal" },
    { id: "GOAL_ACHIEVED", label: "Goals" },
    { id: "WORKOUT_PR", label: "Workouts" },
    { id: "MOOD_HIGH", label: "Moods" },
    { id: "MILESTONE_REACHED", label: "Milestones" },
  ];

  if (loading) {
    return <div className="space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[24px] shimmer" />)}</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
        className="relative overflow-hidden rounded-[28px] glass-panel p-8 md:p-10">
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-primary/70 mb-2">Your Life</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">A visual map of your journey</h1>
          <p className="text-muted-foreground max-w-lg">Every milestone, streak, and reflection — woven into one living history.</p>
          <div className="flex flex-wrap gap-6 mt-7">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-semibold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTypes.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border",
              filter === f.id ? "bg-primary text-primary-foreground border-primary" : "glass border-border/50 text-muted-foreground hover:text-foreground"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-16 text-center">
          <div className="text-4xl mb-3">✦</div>
          <h3 className="font-semibold mb-1">Your story starts now</h3>
          <p className="text-sm text-muted-foreground">Journal, complete goals, log moods and finish workouts to weave your life map.</p>
        </div>
      ) : (
        <div className="relative">
          {/* The vertical life-line */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:-translate-x-1/2" />

          <div className="space-y-12">
            {groups.map(([monthKey, monthEvents]) => (
              <div key={monthKey}>
                {/* Month marker */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, ease }}
                  className="relative flex md:justify-center mb-6"
                >
                  <span className="ml-14 md:ml-0 px-4 py-1.5 rounded-full glass-strong text-sm font-medium z-10">
                    {monthLabel(monthKey)}
                  </span>
                </motion.div>

                <div className="space-y-4">
                  {monthEvents.map((event, i) => {
                    const meta = TYPE_META[event.type] || TYPE_META.CUSTOM;
                    const leftSide = i % 2 === 0;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: leftSide ? -24 : 24, y: 10 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, ease, delay: (i % 4) * 0.05 }}
                        className={cn(
                          "relative flex items-stretch gap-4 md:w-1/2",
                          leftSide ? "md:pr-8 md:mr-auto" : "md:pl-8 md:ml-auto md:flex-row-reverse"
                        )}
                      >
                        {/* Node */}
                        <div className="relative shrink-0 z-10">
                          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary text-xl ring-4 ring-background">
                            {meta.icon}
                          </div>
                        </div>

                        {/* Card */}
                        <div className="flex-1 glass-panel rounded-[20px] p-4 lift">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm leading-snug">{event.title}</p>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">{meta.label}</span>
                          </div>
                          {event.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                          <p className="text-[11px] text-muted-foreground/70 mt-2">{formatDate(event.date)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
