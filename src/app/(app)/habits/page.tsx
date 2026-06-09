"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  currentStreak: number;
  totalCompletions: number;
  completionRate: number;
  frequency: string;
  logs: { completed: boolean }[];
  category?: { name: string };
}

const ICONS = ["✅","💧","📚","🧘","💪","📝","🌙","🥗","🏃","💊","🎯","🌅","🛏","🧹","🎵","💻","🚶","🧠","🌿","⭐"];
const COLORS = ["#6366f1","#8b5cf6","#ec4899","#10b981","#f59e0b","#3b82f6","#ef4444","#06b6d4","#84cc16","#f97316"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "✅", color: "#6366f1", frequency: "DAILY" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/habits");
    if (res.ok) setHabits(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (habitId: string, currentlyDone: boolean) => {
    setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, logs: [{ completed: !currentlyDone }] } : h));
    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, completed: !currentlyDone }),
    });
    load();
  };

  const createHabit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: "", icon: "✅", color: "#6366f1", frequency: "DAILY" });
      load();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to create habit");
    }
    setSaving(false);
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm("Delete this habit?")) return;
    await fetch("/api/habits", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    });
    load();
  };

  const completed = habits.filter((h) => h.logs?.some((l) => l.completed)).length;
  const total = habits.length;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
  const totalCompletions = habits.reduce((s, h) => s + h.totalCompletions, 0);

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Habits</h2>
          <p className="text-sm text-muted-foreground">Build powerful routines that stick</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Habit
        </Button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Today&apos;s Progress</h3>
                <p className="text-sm text-muted-foreground">{completed} of {total} completed</p>
              </div>
              <div className="text-3xl font-bold text-green-500">{total > 0 ? Math.round((completed / total) * 100) : 0}%</div>
            </div>
            <Progress value={total > 0 ? (completed / total) * 100 : 0} indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">🔥 {bestStreak}</div><div className="text-xs text-muted-foreground">Best Streak</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{total > 0 ? Math.round((completed / total) * 100) : 0}%</div><div className="text-xs text-muted-foreground">Today</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{totalCompletions}</div><div className="text-xs text-muted-foreground">Total Completions</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{total}</div><div className="text-xs text-muted-foreground">Active Habits</div></CardContent></Card>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <h3 className="font-semibold mb-1">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first habit to start building routines.</p>
            <Button onClick={() => setShowCreate(true)}>Create First Habit</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const done = habit.logs?.some((l) => l.completed);
            return (
              <Card key={habit.id} className="card-hover group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggle(habit.id, done)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${done ? "bg-green-500/20 ring-2 ring-green-500" : "bg-muted hover:ring-2 hover:ring-primary"}`}
                    >
                      {done
                        ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <span className="text-lg">{habit.icon || "✅"}</span>
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{habit.name}</span>
                        {habit.currentStreak >= 3 && <Badge variant="warning" className="text-[10px]">🔥 {habit.currentStreak}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{habit.frequency?.toLowerCase()}</span>
                        {habit.category && <span className="text-xs text-muted-foreground">{habit.category.name}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Habit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
            <div>
              <label className="text-sm font-medium block mb-1.5">Habit Name</label>
              <Input placeholder="e.g. Morning Meditation" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button key={icon} onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === icon ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Frequency</label>
              <div className="flex gap-2">
                {["DAILY","WEEKLY","MONTHLY"].map((f) => (
                  <Button key={f} variant={form.frequency === f ? "default" : "outline"} size="sm"
                    onClick={() => setForm({ ...form, frequency: f })}>
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createHabit} disabled={saving || !form.name.trim()}>
                {saving ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
