"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const habits = [
  { id: "1", name: "Morning Meditation", icon: "🧘", color: "#8b5cf6", streak: 15, completionRate: 92, category: "Mindfulness", isCompleted: true },
  { id: "2", name: "Read 30 Minutes", icon: "📚", color: "#3b82f6", streak: 8, completionRate: 78, category: "Learning", isCompleted: true },
  { id: "3", name: "Drink 2L Water", icon: "💧", color: "#06b6d4", streak: 22, completionRate: 95, category: "Health", isCompleted: true },
  { id: "4", name: "Exercise", icon: "💪", color: "#10b981", streak: 5, completionRate: 85, category: "Fitness", isCompleted: true },
  { id: "5", name: "Journal", icon: "📝", color: "#f59e0b", streak: 12, completionRate: 88, category: "Mindfulness", isCompleted: true },
  { id: "6", name: "No Social Media Before 12", icon: "📵", color: "#ef4444", streak: 3, completionRate: 65, category: "Productivity", isCompleted: false },
  { id: "7", name: "Stretch Before Bed", icon: "🌙", color: "#6366f1", streak: 0, completionRate: 72, category: "Health", isCompleted: false },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapData = Array.from({ length: 52 * 7 }, () => Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0);

export default function HabitsPage() {
  const [filter, setFilter] = useState("all");
  const completedToday = habits.filter((h) => h.isCompleted).length;
  const totalHabits = habits.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Habits</h2>
          <p className="text-sm text-muted-foreground">Build powerful routines that stick</p>
        </div>
        <Button size="sm">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Habit
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Today&apos;s Progress</h3>
              <p className="text-sm text-muted-foreground">{completedToday} of {totalHabits} habits completed</p>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {Math.round((completedToday / totalHabits) * 100)}%
            </div>
          </div>
          <Progress value={(completedToday / totalHabits) * 100} indicatorClassName="bg-green-500" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">🔥 22</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-muted-foreground">Weekly Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-muted-foreground">Total Completions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">7</div>
            <div className="text-xs text-muted-foreground">Active Habits</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "Mindfulness", "Health", "Fitness", "Learning", "Productivity"].map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
            className="whitespace-nowrap"
          >
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits
          .filter((h) => filter === "all" || h.category === filter)
          .map((habit) => (
            <Card key={habit.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      habit.isCompleted
                        ? "bg-green-500/20 ring-2 ring-green-500"
                        : "bg-muted hover:ring-2 hover:ring-primary"
                    }`}
                  >
                    {habit.isCompleted ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg">{habit.icon}</span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{habit.name}</span>
                      {habit.streak >= 7 && <Badge variant="warning" className="text-[10px]">🔥 {habit.streak}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{habit.category}</span>
                      <span className="text-xs text-muted-foreground">{habit.completionRate}% rate</span>
                    </div>
                  </div>
                  {/* Week progress */}
                  <div className="hidden sm:flex gap-0.5">
                    {weekDays.map((day, i) => (
                      <div
                        key={day}
                        className={`w-3 h-3 rounded-sm ${
                          i < 5 ? "bg-green-500" : i === 5 ? "bg-muted" : "bg-muted"
                        }`}
                        title={day}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-[2px] min-w-[700px]">
              {Array.from({ length: 52 }, (_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const idx = weekIdx * 7 + dayIdx;
                    const val = heatmapData[idx] || 0;
                    return (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 rounded-sm ${
                          val === 0 ? "bg-muted" :
                          val === 1 ? "bg-green-500/30" :
                          val === 2 ? "bg-green-500/50" :
                          val === 3 ? "bg-green-500/70" :
                          "bg-green-500"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {["bg-muted", "bg-green-500/30", "bg-green-500/50", "bg-green-500/70", "bg-green-500"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
