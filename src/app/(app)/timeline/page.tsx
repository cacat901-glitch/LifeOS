"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface TimelineEvent { id: string; type: string; title: string; description?: string; date: string; icon?: string; color?: string }

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  JOURNAL_ENTRY:       { icon: "📝", color: "bg-blue-500",   label: "Journal" },
  GOAL_ACHIEVED:       { icon: "🎯", color: "bg-green-500",  label: "Goal" },
  HABIT_STREAK:        { icon: "🔥", color: "bg-orange-500", label: "Streak" },
  WORKOUT_PR:          { icon: "🏆", color: "bg-yellow-500", label: "PR" },
  ACHIEVEMENT_UNLOCKED:{ icon: "⭐", color: "bg-purple-500", label: "Achievement" },
  MOOD_HIGH:           { icon: "😁", color: "bg-pink-500",   label: "Mood" },
  TASK_COMPLETED:      { icon: "✅", color: "bg-green-500",  label: "Task" },
  MILESTONE_REACHED:   { icon: "🏁", color: "bg-indigo-500", label: "Milestone" },
  CUSTOM:              { icon: "📌", color: "bg-gray-500",   label: "Custom" },
};

function groupByDate(events: TimelineEvent[]) {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const key = new Date(e.date).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Build timeline from journal, moods, workouts, goals
  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      fetch("/api/journal?limit=50").then((r) => r.json()),
      fetch("/api/mood?days=90").then((r) => r.json()),
      fetch("/api/workout?limit=50").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
    ]);

    const all: TimelineEvent[] = [];

    if (results[0].status === "fulfilled") {
      const { entries = [] } = results[0].value;
      entries.forEach((e: any) => all.push({
        id: `j-${e.id}`, type: "JOURNAL_ENTRY",
        title: e.title || "Journal Entry",
        description: e.content?.slice(0, 80) + (e.content?.length > 80 ? "…" : ""),
        date: e.date,
      }));
    }

    if (results[1].status === "fulfilled") {
      const { entries = [] } = results[1].value;
      entries.filter((e: any) => e.score >= 8).forEach((e: any) => all.push({
        id: `m-${e.id}`, type: "MOOD_HIGH",
        title: `Great mood day — ${e.emoji} ${e.label}`,
        description: e.notes || undefined,
        date: e.date,
      }));
    }

    if (results[2].status === "fulfilled") {
      const sessions: any[] = results[2].value;
      sessions.filter((s: any) => s.isCompleted).forEach((s: any) => all.push({
        id: `w-${s.id}`, type: s.totalSets > 0 ? "WORKOUT_PR" : "TASK_COMPLETED",
        title: `Completed: ${s.name}`,
        description: s.duration ? `${s.duration}min · ${Math.round(s.totalVolume)}kg volume` : undefined,
        date: s.startTime,
      }));
    }

    if (results[3].status === "fulfilled") {
      const goals: any[] = results[3].value;
      goals.filter((g: any) => g.status === "COMPLETED").forEach((g: any) => all.push({
        id: `g-${g.id}`, type: "GOAL_ACHIEVED",
        title: `Goal achieved: ${g.title}`,
        date: g.completedAt || g.updatedAt,
      }));
      goals.forEach((g: any) => g.milestones?.filter((m: any) => m.isCompleted).forEach((m: any) => all.push({
        id: `ms-${m.id}`, type: "MILESTONE_REACHED",
        title: `Milestone: ${m.title}`,
        description: g.title,
        date: m.completedAt || m.updatedAt || g.updatedAt,
      })));
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = groupByDate(events);

  if (loading) return <div className="animate-pulse space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Life</h2>
          <p className="text-sm text-muted-foreground">A chronological story of your journey</p>
        </div>
        <Badge variant="secondary">{events.length} events</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{events.length}</div><div className="text-xs text-muted-foreground">Total Events</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{events.filter((e) => e.type === "WORKOUT_PR").length}</div><div className="text-xs text-muted-foreground">Workouts</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{events.filter((e) => e.type === "GOAL_ACHIEVED").length}</div><div className="text-xs text-muted-foreground">Goals Achieved</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-500">{events.filter((e) => e.type === "JOURNAL_ENTRY").length}</div><div className="text-xs text-muted-foreground">Journal Entries</div></CardContent></Card>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">🌱</span>
            <h3 className="font-semibold mb-1">Your timeline is empty</h3>
            <p className="text-sm text-muted-foreground">Complete habits, log moods, journal, and finish workouts to build your life timeline.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {groups.map(([dateStr, dayEvents]) => (
              <div key={dateStr}>
                <div className="relative flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{formatDate(new Date(dateStr))}</h3>
                </div>
                <div className="ml-16 space-y-2">
                  {dayEvents.map((event) => {
                    const meta = TYPE_META[event.type] || TYPE_META.CUSTOM;
                    return (
                      <Card key={event.id}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${meta.color}/20 flex items-center justify-center shrink-0`}>
                            <span className="text-base">{event.icon || meta.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.description && <p className="text-xs text-muted-foreground truncate">{event.description}</p>}
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">{meta.label}</Badge>
                        </CardContent>
                      </Card>
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
