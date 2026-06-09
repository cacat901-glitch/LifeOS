"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Task { id: string; title: string; description?: string; priority: string; status: string; dueDate?: string; category?: { name: string } }

const PRIORITY_BADGE: Record<string, any> = { URGENT: "destructive", HIGH: "warning", MEDIUM: "secondary", LOW: "outline" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [quickTask, setQuickTask] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return t.status !== "DONE" && t.status !== "CANCELLED";
    if (filter === "done") return t.status === "DONE";
    return true;
  });

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const status = currentStatus === "DONE" ? "TODO" : "DONE";
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    load();
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
  };

  const addQuickTask = async () => {
    if (!quickTask.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quickTask }),
    });
    if (res.ok) { setQuickTask(""); load(); }
    setSaving(false);
  };

  const createTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || undefined }),
    });
    if (res.ok) { setShowCreate(false); setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" }); load(); }
    setSaving(false);
  };

  const active = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter((t) => t.status === "DONE");

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Get things done</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Task
        </Button>
      </div>

      {/* Quick Add */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Quick add a task… press Enter"
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuickTask()}
            />
            <Button onClick={addQuickTask} disabled={saving || !quickTask.trim()}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-500">{active.length}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{done.length}</div><div className="text-xs text-muted-foreground">Completed</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0}%</div><div className="text-xs text-muted-foreground">Rate</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["active", "done", "all"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <span className="text-3xl block mb-3">📋</span>
            <p className="text-sm text-muted-foreground">{filter === "done" ? "No completed tasks yet." : "No tasks here. Add one above!"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card key={task.id} className="group hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id, task.status)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.status === "DONE" ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30 hover:border-primary"}`}
                  >
                    {task.status === "DONE" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge variant={PRIORITY_BADGE[task.priority]} className="text-[10px] shrink-0">{task.priority}</Badge>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Title *</label>
              <Input placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details..." className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Priority</label>
                <div className="flex flex-wrap gap-1">
                  {["LOW","MEDIUM","HIGH","URGENT"].map((p) => (
                    <Button key={p} variant={form.priority === p ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, priority: p })} className="text-xs px-2 h-7">
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Due Date</label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="h-9" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createTask} disabled={saving || !form.title.trim()}>
                {saving ? "Creating…" : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
