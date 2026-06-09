"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const exerciseLibrary = [
  { name: "Bench Press", category: "Chest", equipment: "Barbell" },
  { name: "Squat", category: "Legs", equipment: "Barbell" },
  { name: "Deadlift", category: "Back", equipment: "Barbell" },
  { name: "Overhead Press", category: "Shoulders", equipment: "Barbell" },
  { name: "Barbell Row", category: "Back", equipment: "Barbell" },
  { name: "Pull-ups", category: "Back", equipment: "Bodyweight" },
  { name: "Dips", category: "Chest", equipment: "Bodyweight" },
  { name: "Lateral Raises", category: "Shoulders", equipment: "Dumbbell" },
];

const recentWorkouts = [
  {
    id: "1",
    name: "Push Day - Chest & Shoulders",
    date: "Today",
    duration: 62,
    volume: 8450,
    exercises: 6,
    prs: 1,
  },
  {
    id: "2",
    name: "Pull Day - Back & Biceps",
    date: "Yesterday",
    duration: 55,
    volume: 7230,
    exercises: 5,
    prs: 0,
  },
  {
    id: "3",
    name: "Leg Day",
    date: "2 days ago",
    duration: 70,
    volume: 12500,
    exercises: 6,
    prs: 2,
  },
];

const personalRecords = [
  { exercise: "Bench Press", weight: 100, date: "Jun 7" },
  { exercise: "Squat", weight: 140, date: "Jun 5" },
  { exercise: "Deadlift", weight: 180, date: "Jun 2" },
  { exercise: "Overhead Press", weight: 65, date: "May 28" },
];

export default function WorkoutPage() {
  const [activeTab, setActiveTab] = useState<"log" | "exercises" | "programs">("log");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Workout</h2>
          <p className="text-sm text-muted-foreground">Track your training and hit new PRs</p>
        </div>
        <Button size="sm" variant="glow">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Workout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">47</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">4</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">12</div>
            <div className="text-xs text-muted-foreground">Personal Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">180kg</div>
            <div className="text-xs text-muted-foreground">Max Deadlift</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { id: "log", label: "Workout Log" },
          { id: "exercises", label: "Exercises" },
          { id: "programs", label: "Programs" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "log" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Workouts */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold">Recent Workouts</h3>
            {recentWorkouts.map((workout) => (
              <Card key={workout.id} className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{workout.date}</p>
                    </div>
                    {workout.prs > 0 && (
                      <Badge variant="warning">🏆 {workout.prs} PR{workout.prs > 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm font-semibold">{workout.duration}min</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{(workout.volume / 1000).toFixed(1)}k kg</div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{workout.exercises}</div>
                      <div className="text-xs text-muted-foreground">Exercises</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Personal Records */}
          <div className="space-y-4">
            <h3 className="font-semibold">Personal Records 🏆</h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                {personalRecords.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <div className="text-sm font-medium">{pr.exercise}</div>
                      <div className="text-xs text-muted-foreground">{pr.date}</div>
                    </div>
                    <div className="text-lg font-bold text-primary">{pr.weight}kg</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Volume Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {[65, 78, 45, 92, 83, 70, 88].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/80 rounded-t-sm transition-all"
                        style={{ height: `${v}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "exercises" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exerciseLibrary.map((exercise, i) => (
            <Card key={i} className="card-hover cursor-pointer">
              <CardContent className="p-4">
                <h4 className="font-medium">{exercise.name}</h4>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{exercise.category}</Badge>
                  <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-dashed card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center justify-center h-full min-h-[80px]">
              <span className="text-sm text-muted-foreground">+ Add Custom Exercise</span>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Active</Badge>
              </div>
              <h3 className="text-lg font-semibold">Push Pull Legs</h3>
              <p className="text-sm text-muted-foreground mt-1">6-day split focusing on hypertrophy</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-sm font-semibold">6 days</div>
                  <div className="text-xs text-muted-foreground">Per week</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">12 weeks</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">Week 8</div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[150px]">
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm text-muted-foreground">Create New Program</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
