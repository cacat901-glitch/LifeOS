"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const tasks = [
  { id: "1", title: "Finish project report", priority: "URGENT", status: "IN_PROGRESS", category: "Work", dueDate: "Today" },
  { id: "2", title: "Review pull request #42", priority: "HIGH", status: "TODO", category: "Work", dueDate: "Today" },
  { id: "3", title: "Update portfolio website", priority: "MEDIUM", status: "TODO", category: "Personal", dueDate: "Tomorrow" },
  { id: "4", title: "Plan next sprint backlog", priority: "MEDIUM", status: "TODO", category: "Work", dueDate: "Wed" },
  { id: "5", title: "Buy groceries", priority: "LOW", status: "TODO", category: "Personal", dueDate: "Today" },
  { id: "6", title: "Schedule dentist appointment", priority: "LOW", status: "TODO", category: "Health", dueDate: "This week" },
  { id: "7", title: "Research new framework", priority: "MEDIUM", status: "DONE", category: "Learning", dueDate: "Done" },
  { id: "8", title: "Write meeting notes", priority: "HIGH", status: "DONE", category: "Work", dueDate: "Done" },
];

const priorityColors: Record<string, string> = {
  URGENT: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "outline",
};

export default function TasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const [newTask, setNewTask] = useState("");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return t.status !== "DONE";
    if (filter === "done") return t.status === "DONE";
    return t.category === filter;
  });

  const activeTasks = tasks.filter((t) => t.status !== "DONE");
  const completedTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage your to-dos and get things done</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Focus Mode</Button>
          <Button size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>
      </div>

      {/* Quick Add */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task... (Press Enter)"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTask.trim()) {
                  setNewTask("");
                }
              }}
            />
            <Button size="default">Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{activeTasks.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{completedTasks.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">1</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">85%</div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "active", "done", "Work", "Personal", "Health", "Learning"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="whitespace-nowrap capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    task.status === "DONE"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {task.status === "DONE" && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </span>
                    {task.status === "IN_PROGRESS" && (
                      <Badge variant="default" className="text-[10px]">In Progress</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{task.category}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className={`text-xs ${task.dueDate === "Today" ? "text-red-500" : "text-muted-foreground"}`}>
                      {task.dueDate}
                    </span>
                  </div>
                </div>
                <Badge variant={priorityColors[task.priority] as any} className="text-[10px]">
                  {task.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
