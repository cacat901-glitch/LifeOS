"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const timelineEvents = [
  {
    date: "June 9, 2026",
    events: [
      { type: "HABIT_STREAK", title: "22 Day Mood Logging Streak", icon: "🔥", color: "bg-orange-500" },
      { type: "JOURNAL_ENTRY", title: "Wrote 'Productive Monday'", icon: "📝", color: "bg-blue-500" },
    ],
  },
  {
    date: "June 7, 2026",
    events: [
      { type: "WORKOUT_PR", title: "New PR: Bench Press 100kg", icon: "🏆", color: "bg-yellow-500" },
      { type: "ACHIEVEMENT_UNLOCKED", title: "Achievement: Iron Will", icon: "⭐", color: "bg-purple-500" },
    ],
  },
  {
    date: "June 5, 2026",
    events: [
      { type: "GOAL_ACHIEVED", title: "Milestone: Save $8,000", icon: "🎯", color: "bg-green-500" },
    ],
  },
  {
    date: "June 3, 2026",
    events: [
      { type: "HABIT_STREAK", title: "15 Day Meditation Streak", icon: "🧘", color: "bg-indigo-500" },
      { type: "MOOD_HIGH", title: "Best mood week of the month", icon: "😁", color: "bg-pink-500" },
    ],
  },
  {
    date: "May 28, 2026",
    events: [
      { type: "WORKOUT_PR", title: "New PR: Overhead Press 65kg", icon: "🏋️", color: "bg-yellow-500" },
      { type: "TASK_COMPLETED", title: "Completed Q2 Project Review", icon: "✅", color: "bg-green-500" },
    ],
  },
  {
    date: "May 20, 2026",
    events: [
      { type: "GOAL_ACHIEVED", title: "Completed: A2 Spanish Course", icon: "🇪🇸", color: "bg-red-500" },
      { type: "ACHIEVEMENT_UNLOCKED", title: "Achievement: Polyglot Path", icon: "🌍", color: "bg-purple-500" },
    ],
  },
  {
    date: "May 15, 2026",
    events: [
      { type: "MILESTONE_REACHED", title: "100th Journal Entry", icon: "📖", color: "bg-blue-500" },
    ],
  },
  {
    date: "May 10, 2026",
    events: [
      { type: "HABIT_STREAK", title: "30 Day Exercise Streak", icon: "💪", color: "bg-green-500" },
      { type: "ACHIEVEMENT_UNLOCKED", title: "Achievement: Iron Discipline", icon: "🏅", color: "bg-yellow-500" },
    ],
  },
];

export default function TimelinePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Life</h2>
          <p className="text-sm text-muted-foreground">A chronological story of your achievements and growth</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">32 events this month</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">12</div>
            <div className="text-xs text-muted-foreground">PRs This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">8</div>
            <div className="text-xs text-muted-foreground">Goals Achieved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">23</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-8">
          {timelineEvents.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date header */}
              <div className="relative flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <h3 className="font-semibold text-sm">{group.date}</h3>
              </div>

              {/* Events */}
              <div className="ml-16 space-y-3">
                {group.events.map((event, eventIdx) => (
                  <Card key={eventIdx} className="card-hover">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${event.color}/20 flex items-center justify-center`}>
                        <span className="text-lg">{event.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {event.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
