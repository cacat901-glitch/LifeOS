"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Daily Briefing */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-semibold">{greeting}, User</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-1 max-w-xl">
                <p>You completed <span className="text-foreground font-medium">85%</span> of your habits this week.</p>
                <p>You logged <span className="text-foreground font-medium">3 workouts</span> and your mood is trending up.</p>
                <p className="text-primary font-medium">Today&apos;s focus: Complete your project milestone.</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">AI Insight</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Life Score" value="87" suffix="/100" trend="+5%" color="text-primary" />
        <StatCard title="Habits" value="5/7" suffix="today" trend="🔥 12" color="text-green-500" />
        <StatCard title="Tasks" value="3" suffix="remaining" trend="2 done" color="text-blue-500" />
        <StatCard title="Mood" value="😊" suffix="Good" trend="↑ trending" color="text-yellow-500" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today&apos;s Habits</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Morning Meditation", icon: "🧘", done: true, streak: 15 },
              { name: "Read 30 Minutes", icon: "📚", done: true, streak: 8 },
              { name: "Drink 2L Water", icon: "💧", done: true, streak: 22 },
              { name: "Exercise", icon: "💪", done: true, streak: 5 },
              { name: "Journal", icon: "📝", done: true, streak: 12 },
              { name: "No Social Media Before 12", icon: "📵", done: false, streak: 3 },
              { name: "Stretch Before Bed", icon: "🌙", done: false, streak: 0 },
            ].map((habit, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <button
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    habit.done
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {habit.done && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-lg">{habit.icon}</span>
                <span className={`flex-1 text-sm ${habit.done ? "line-through text-muted-foreground" : ""}`}>
                  {habit.name}
                </span>
                {habit.streak > 0 && (
                  <Badge variant="secondary" className="text-xs">🔥 {habit.streak}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Life Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Life Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-5xl font-bold gradient-text">87</div>
                <div className="text-sm text-muted-foreground mt-1">Grade: A-</div>
              </div>
              <div className="space-y-3 mt-4">
                {[
                  { label: "Habits", value: 85, color: "bg-green-500" },
                  { label: "Tasks", value: 70, color: "bg-blue-500" },
                  { label: "Goals", value: 90, color: "bg-purple-500" },
                  { label: "Mood", value: 80, color: "bg-yellow-500" },
                  { label: "Workout", value: 95, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <Progress value={item.value} indicatorClassName={item.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Workout */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Today&apos;s Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
                <div className="text-center space-y-2">
                  <span className="text-2xl">🏋️</span>
                  <p className="text-sm font-medium">Push Day - Chest & Shoulders</p>
                  <p className="text-xs text-muted-foreground">6 exercises • ~60 min</p>
                  <Button size="sm" className="mt-2">Start Workout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today&apos;s Tasks</CardTitle>
            <Badge variant="secondary">5</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: "Review pull request", priority: "HIGH", done: true },
              { title: "Meeting with team", priority: "MEDIUM", done: true },
              { title: "Finish project report", priority: "URGENT", done: false },
              { title: "Update documentation", priority: "LOW", done: false },
              { title: "Plan next sprint", priority: "MEDIUM", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <button
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                    task.done
                      ? "bg-primary border-primary text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {task.done && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </span>
                <Badge
                  variant={
                    task.priority === "URGENT" ? "destructive" :
                    task.priority === "HIGH" ? "warning" : "secondary"
                  }
                  className="text-[10px]"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Goals</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Learn Spanish", progress: 45, color: "bg-blue-500", target: "Dec 2025" },
              { title: "Run a Marathon", progress: 68, color: "bg-green-500", target: "Mar 2025" },
              { title: "Save $10,000", progress: 82, color: "bg-yellow-500", target: "Jun 2025" },
              { title: "Read 24 Books", progress: 33, color: "bg-purple-500", target: "Dec 2025" },
            ].map((goal, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} indicatorClassName={goal.color} />
                <p className="text-xs text-muted-foreground">Target: {goal.target}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Streaks & Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Habits", streak: 12, icon: "🔥" },
                { label: "Journal", streak: 8, icon: "✍️" },
                { label: "Workout", streak: 5, icon: "💪" },
                { label: "Mood Log", streak: 22, icon: "💜" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-xl font-bold mt-1">{s.streak}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { icon: "✅", text: "Completed 'Morning Meditation'", time: "2m ago" },
                  { icon: "📝", text: "Wrote journal entry", time: "1h ago" },
                  { icon: "🏆", text: "New personal record: Bench Press", time: "3h ago" },
                  { icon: "🎯", text: "Reached milestone: Save $8,000", time: "1d ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span>{item.icon}</span>
                    <span className="flex-1 text-muted-foreground">{item.text}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { icon: "📝", label: "New Journal" },
              { icon: "✅", label: "Add Habit" },
              { icon: "📋", label: "Add Task" },
              { icon: "🎯", label: "New Goal" },
              { icon: "🏋️", label: "Log Workout" },
              { icon: "💜", label: "Log Mood" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  suffix,
  trend,
  color,
}: {
  title: string;
  value: string;
  suffix: string;
  trend: string;
  color: string;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          <span className="text-xs text-muted-foreground">{suffix}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
