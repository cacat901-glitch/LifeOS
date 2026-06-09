"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface Milestone { id: string; title: string; isCompleted: boolean; order: number }
interface Goal {
  id: string; title: string; description?: string; type: string; status: string;
  currentValue: number; targetValue: number; color: string; targetDate?: string;
  milestones: Milestone[];
}

const COLORS = ["#6366f1","#3b82f6","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#06b6d4"];
const GOAL_TYPES = ["LONG_TERM","QUARTERLY","MONTHLY","WEEKLY","CUSTOM"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", description: "", type: "LONG_TERM", targetValue: 100, color: "#6366f1", targetDate: "" });
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/goals");
    if (res.ok) setGoals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createGoal = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetDate: form.targetDate || undefined,
        milestones: milestones.map((t) => ({ title: t })),
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: "", description: "", type: "LONG_TERM", targetValue: 100, color: "#6366f1", targetDate: "" });
      setMilestones([]);
      load();
    }
    setSaving(false);
  };

  const toggleMilestone = async (goalId: string, milestoneId: string, completed: boolean) => {
    await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId, milestoneCompleted: !completed }),
    });
    load();
    if (selected) {
      setSelected((prev) => prev ? {
        ...prev,
        milestones: prev.milestones.map((m) => m.id === milestoneId ? { ...m, isCompleted: !completed } : m),
      } : null);
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, currentValue: newValue }),
    });
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, currentValue: newValue } : g));
    if (selected?.id === goalId) setSelected((prev) => prev ? { ...prev, currentValue: newValue } : null);
  };

  const active = goals.filter((g) => g.status === "ACTIVE");
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((s, g) => s + (g.currentValue / (g.targetValue || 100)) * 100, 0) / active.length)
    : 0;

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-sm text-muted-foreground">Track your long-term ambitions</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{active.length}</div><div className="text-xs text-muted-foreground">Active Goals</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{avgProgress}%</div><div className="text-xs text-muted-foreground">Avg Progress</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{active.reduce((s, g) => s + g.milestones.filter((m) => m.isCompleted).length, 0)}</div><div className="text-xs text-muted-foreground">Milestones Done</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-500">{goals.filter((g) => g.status === "COMPLETED").length}</div><div className="text-xs text-muted-foreground">Completed</div></CardContent></Card>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">🎯</span>
            <h3 className="font-semibold mb-1">No goals yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Set your first goal to start tracking progress.</p>
            <Button onClick={() => setShowCreate(true)}>Create First Goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentValue / (goal.targetValue || 100)) * 100), 100);
            return (
              <Card key={goal.id} className="card-hover overflow-hidden cursor-pointer" onClick={() => setSelected(goal)}>
                <div className="h-1" style={{ backgroundColor: goal.color }} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-3">
                      <h3 className="font-semibold">{goal.title}</h3>
                      {goal.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">{goal.type.replace("_"," ")}</Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} />
                    {goal.targetDate && <p className="text-xs text-muted-foreground">Target: {formatDate(goal.targetDate)}</p>}
                  </div>
                  {goal.milestones.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">{goal.milestones.filter((m) => m.isCompleted).length}/{goal.milestones.length} milestones</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selected.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress: {selected.currentValue} / {selected.targetValue}</span>
                  <span className="font-semibold">{Math.min(Math.round((selected.currentValue / (selected.targetValue || 100)) * 100), 100)}%</span>
                </div>
                <Progress value={Math.min((selected.currentValue / (selected.targetValue || 100)) * 100, 100)} />
                <div className="flex gap-2 mt-3">
                  <Input type="number" value={selected.currentValue} min={0} max={selected.targetValue}
                    onChange={(e) => setSelected({ ...selected, currentValue: Number(e.target.value) })}
                    className="flex-1" />
                  <Button size="sm" onClick={() => updateProgress(selected.id, selected.currentValue)}>Update</Button>
                </div>
              </div>
              {selected.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {selected.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                        <button
                          onClick={() => toggleMilestone(selected.id, m.id, m.isCompleted)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${m.isCompleted ? "bg-green-500 border-green-500" : "border-muted-foreground/30 hover:border-primary"}`}
                        >
                          {m.isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className={`text-sm ${m.isCompleted ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Goal title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why does this goal matter to you?" className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1">
                  {GOAL_TYPES.map((t) => (
                    <Button key={t} variant={form.type === t ? "default" : "outline"} size="sm"
                      onClick={() => setForm({ ...form, type: t })} className="text-xs px-2 h-7">
                      {t.replace("_"," ")}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Target Value</label>
                <Input type="number" value={form.targetValue} min={1}
                  onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full ${form.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Target Date</label>
                <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Milestones (optional)</label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Add a milestone…" value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && milestoneInput.trim()) { setMilestones([...milestones, milestoneInput.trim()]); setMilestoneInput(""); }}} />
                <Button size="sm" variant="outline" onClick={() => { if (milestoneInput.trim()) { setMilestones([...milestones, milestoneInput.trim()]); setMilestoneInput(""); }}}>Add</Button>
              </div>
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm flex-1">{m}</span>
                  <button onClick={() => setMilestones(milestones.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createGoal} disabled={saving || !form.title.trim()}>
                {saving ? "Creating…" : "Create Goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
