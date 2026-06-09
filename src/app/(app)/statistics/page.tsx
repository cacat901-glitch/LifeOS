"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-sm text-muted-foreground">Your comprehensive analytics hub</p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "year"].map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p as any)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Life Score Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Life Score Trend</h3>
            <Badge variant="success">↑ 12% this month</Badge>
          </div>
          <div className="flex items-end gap-1 h-40">
            {[72, 75, 78, 74, 80, 82, 79, 85, 83, 87, 84, 88, 86, 89, 85, 87, 90, 88, 91, 87, 89, 92, 88, 90, 87, 91, 89, 90, 87, 88].map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                  style={{ height: `${(score - 60) * 3}%` }}
                  title={`Day ${i + 1}: ${score}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Jun 1</span>
            <span>Jun 15</span>
            <span>Jun 30</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Habit Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>✅</span> Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-green-500">85%</div>
                <div className="text-[10px] text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">22</div>
                <div className="text-[10px] text-muted-foreground">Best Streak</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium text-green-500">92%</span>
              </div>
              <Progress value={92} indicatorClassName="bg-green-500" />
            </div>
            <div className="flex items-end gap-0.5 h-16">
              {[88, 91, 85, 90, 92, 87, 95].map((v, i) => (
                <div key={i} className="flex-1 bg-green-500/60 rounded-t-sm" style={{ height: `${v}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>📋</span> Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-blue-500">156</div>
                <div className="text-[10px] text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">78%</div>
                <div className="text-[10px] text-muted-foreground">On Time</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Productivity</span>
                <span className="font-medium text-blue-500">High</span>
              </div>
              <Progress value={78} indicatorClassName="bg-blue-500" />
            </div>
            <div className="flex items-end gap-0.5 h-16">
              {[5, 8, 6, 7, 4, 9, 6].map((v, i) => (
                <div key={i} className="flex-1 bg-blue-500/60 rounded-t-sm" style={{ height: `${v * 11}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workout Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>💪</span> Workouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-orange-500">18</div>
                <div className="text-[10px] text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">4.2</div>
                <div className="text-[10px] text-muted-foreground">Per Week</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volume Trend</span>
                <span className="font-medium text-orange-500">↑ 8%</span>
              </div>
              <Progress value={85} indicatorClassName="bg-orange-500" />
            </div>
            <div className="flex items-end gap-0.5 h-16">
              {[70, 75, 80, 78, 85, 82, 88].map((v, i) => (
                <div key={i} className="flex-1 bg-orange-500/60 rounded-t-sm" style={{ height: `${v}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goal Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>🎯</span> Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-purple-500">57%</div>
                <div className="text-[10px] text-muted-foreground">Avg Progress</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">2</div>
                <div className="text-[10px] text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Spanish", progress: 45 },
                { label: "Marathon", progress: 68 },
                { label: "Savings", progress: 82 },
                { label: "Reading", progress: 33 },
              ].map((g) => (
                <div key={g.label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 truncate">{g.label}</span>
                  <Progress value={g.progress} className="flex-1 h-1.5" indicatorClassName="bg-purple-500" />
                  <span className="text-xs font-medium w-8">{g.progress}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>💜</span> Mood
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-pink-500">7.6</div>
                <div className="text-[10px] text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">😊</div>
                <div className="text-[10px] text-muted-foreground">Most Common</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Mood Trend</span>
                <span className="font-medium text-pink-500">↑ Improving</span>
              </div>
              <Progress value={76} indicatorClassName="bg-pink-500" />
            </div>
            <div className="flex items-end gap-0.5 h-16">
              {[7, 8, 6, 8, 9, 7, 8].map((v, i) => (
                <div key={i} className="flex-1 bg-pink-500/60 rounded-t-sm" style={{ height: `${v * 10}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journal Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>📝</span> Journal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-cyan-500">156</div>
                <div className="text-[10px] text-muted-foreground">Entries</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-xl font-bold">42.5k</div>
                <div className="text-[10px] text-muted-foreground">Total Words</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Consistency</span>
                <span className="font-medium text-cyan-500">88%</span>
              </div>
              <Progress value={88} indicatorClassName="bg-cyan-500" />
            </div>
            <div className="flex items-end gap-0.5 h-16">
              {[1, 1, 0, 1, 1, 1, 0].map((v, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${v ? "bg-cyan-500/60" : "bg-muted"}`} style={{ height: v ? "80%" : "10%" }} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consistency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consistency Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Habits", value: 92, color: "text-green-500" },
              { label: "Journal", value: 88, color: "text-cyan-500" },
              { label: "Workout", value: 75, color: "text-orange-500" },
              { label: "Mood Log", value: 96, color: "text-pink-500" },
              { label: "Tasks", value: 78, color: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-muted/30">
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}%</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
