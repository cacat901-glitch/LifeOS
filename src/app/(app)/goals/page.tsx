"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const goals = [
  {
    id: "1",
    title: "Learn Spanish to B2 Level",
    description: "Achieve conversational fluency in Spanish by end of year",
    type: "LONG_TERM",
    progress: 45,
    targetDate: "Dec 2026",
    color: "#3b82f6",
    milestones: [
      { title: "Complete A1 course", completed: true },
      { title: "Complete A2 course", completed: true },
      { title: "Complete B1 course", completed: false },
      { title: "Have 10 conversations", completed: false },
      { title: "Pass B2 exam", completed: false },
    ],
  },
  {
    id: "2",
    title: "Run a Marathon",
    description: "Complete a full marathon under 4 hours",
    type: "LONG_TERM",
    progress: 68,
    targetDate: "Mar 2027",
    color: "#10b981",
    milestones: [
      { title: "Run 5K consistently", completed: true },
      { title: "Run 10K under 50min", completed: true },
      { title: "Run half-marathon", completed: true },
      { title: "Run 30K", completed: false },
      { title: "Complete marathon", completed: false },
    ],
  },
  {
    id: "3",
    title: "Save $10,000 Emergency Fund",
    description: "Build a solid emergency fund for financial security",
    type: "QUARTERLY",
    progress: 82,
    targetDate: "Sep 2026",
    color: "#f59e0b",
    milestones: [
      { title: "Save first $2,000", completed: true },
      { title: "Reach $5,000", completed: true },
      { title: "Reach $7,500", completed: true },
      { title: "Reach $10,000", completed: false },
    ],
  },
  {
    id: "4",
    title: "Read 24 Books This Year",
    description: "Read 2 books per month across different genres",
    type: "LONG_TERM",
    progress: 33,
    targetDate: "Dec 2026",
    color: "#8b5cf6",
    milestones: [
      { title: "Read 6 books (Q1)", completed: true },
      { title: "Read 12 books (Q2)", completed: false },
      { title: "Read 18 books (Q3)", completed: false },
      { title: "Read 24 books (Q4)", completed: false },
    ],
  },
];

export default function GoalsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-sm text-muted-foreground">Track your long-term ambitions and milestones</p>
        </div>
        <Button size="sm">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-xs text-muted-foreground">Active Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">57%</div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">9</div>
            <div className="text-xs text-muted-foreground">Milestones Done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">2</div>
            <div className="text-xs text-muted-foreground">Completed Goals</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="card-hover overflow-hidden">
            <div className="h-1" style={{ backgroundColor: goal.color }} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                </div>
                <Badge variant="secondary">{goal.type.replace("_", " ")}</Badge>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} indicatorClassName={`bg-[${goal.color}]`} />
                <p className="text-xs text-muted-foreground">Target: {goal.targetDate}</p>
              </div>

              {/* Milestones */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Milestones</h4>
                {goal.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      m.completed ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
                    }`}>
                      {m.completed && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={m.completed ? "text-muted-foreground line-through" : ""}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
