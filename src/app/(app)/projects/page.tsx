"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
interface ProjectTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
}
interface ProjectNote { id: string; content: string; createdAt: string }
interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  color: string;
  icon: string;
  progress: number;
  startDate?: string;
  dueDate?: string;
  tasks: ProjectTask[];
  notes: ProjectNote[];
  _count: { tasks: number };
}

// ── Constants ──────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; badge: any }> = {
  PLANNING:  { label: "Planning",   color: "bg-slate-500",  badge: "secondary" },
  ACTIVE:    { label: "Active",     color: "bg-blue-500",   badge: "default" },
  ON_HOLD:   { label: "On Hold",    color: "bg-yellow-500", badge: "warning" },
  COMPLETED: { label: "Completed",  color: "bg-green-500",  badge: "success" },
  CANCELLED: { label: "Cancelled",  color: "bg-red-500",    badge: "destructive" },
};
const TASK_STATUS_META: Record<string, { label: string; color: string }> = {
  TODO:        { label: "To Do",      color: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress",color: "bg-blue-500" },
  IN_REVIEW:   { label: "In Review",  color: "bg-purple-500" },
  DONE:        { label: "Done",       color: "bg-green-500" },
  CANCELLED:   { label: "Cancelled",  color: "bg-red-500" },
};
const PRIORITY_META: Record<string, any> = {
  LOW: "outline", MEDIUM: "secondary", HIGH: "warning", URGENT: "destructive",
};
const COLORS = ["#6366f1","#3b82f6","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#06b6d4","#f97316","#84cc16"];
const ICONS  = ["📁","🚀","💼","🎨","🔬","📱","🌐","⚙️","📊","🏗️","✍️","🎯","💡","🔧","📦"];

// ── Helpers ────────────────────────────────────────────────
function kanbanColumns(tasks: ProjectTask[]) {
  const cols: Record<string, ProjectTask[]> = {
    TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [],
  };
  tasks.forEach((t) => {
    if (cols[t.status] !== undefined) cols[t.status].push(t);
  });
  return cols;
}

// ══════════════════════════════════════════════════════════
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView]         = useState<"board" | "list">("board");

  // Create project modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", priority: "MEDIUM",
    color: "#6366f1", icon: "📁", dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  // Task quick-add
  const [taskInput, setTaskInput] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  // Note quick-add
  const [noteInput, setNoteInput] = useState("");

  // ── Data ────────────────────────────────────────────────
  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter((p) =>
    filter === "all" ? true : p.status === filter.toUpperCase()
  );

  // ── Stats ────────────────────────────────────────────────
  const active    = projects.filter((p) => p.status === "ACTIVE").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const totalTasks = projects.reduce((s, p) => s + p._count.tasks, 0);
  const doneTasks  = projects.reduce((s, p) => s + p.tasks.filter((t) => t.status === "DONE").length, 0);

  // ── Actions ──────────────────────────────────────────────
  const createProject = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || undefined }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: "", description: "", priority: "MEDIUM", color: "#6366f1", icon: "📁", dueDate: "" });
      load();
    }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id }),
    });
    if (selected?.id === id) setSelected(null);
    load();
  };

  const updateStatus = async (projectId: string, status: string) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateProject", projectId, status }),
    });
    load();
    if (selected?.id === projectId) setSelected((p) => p ? { ...p, status } : null);
  };

  const addTask = async () => {
    if (!taskInput.trim() || !selected) return;
    setAddingTask(true);
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addTask", projectId: selected.id, title: taskInput }),
    });
    if (res.ok) {
      setTaskInput("");
      const updated = await fetch("/api/projects").then((r) => r.json());
      const updatedProject = updated.find((p: Project) => p.id === selected.id);
      if (updatedProject) setSelected(updatedProject);
      setProjects(updated);
    }
    setAddingTask(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTask", taskId, status }),
    });
    load();
    if (selected) {
      setSelected((p) =>
        p ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status } : t) } : null
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTask", taskId }),
    });
    load();
    if (selected) setSelected((p) => p ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : null);
  };

  const addNote = async () => {
    if (!noteInput.trim() || !selected) return;
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addNote", projectId: selected.id, content: noteInput }),
    });
    setNoteInput("");
    load();
  };

  // ── Render ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted/50" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">Track progress across all your projects</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "board" ? "list" : "board")}
            className="p-2 rounded-lg border hover:bg-muted transition-colors"
            title={view === "board" ? "Switch to list view" : "Switch to board view"}
          >
            {view === "board"
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            }
          </button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="font-display text-2xl font-bold text-primary">{active}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="font-display text-2xl font-bold">{completed}</div><div className="text-xs text-muted-foreground">Completed</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="font-display text-2xl font-bold">{totalTasks}</div><div className="text-xs text-muted-foreground">Total Tasks</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="font-display text-2xl font-bold">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</div><div className="text-xs text-muted-foreground">Tasks Done</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all","active","planning","on_hold","completed","cancelled"].map((f) => (
          <Button key={f} size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="whitespace-nowrap capitalize"
          >
            {f.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">📁</span>
            <h3 className="font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking work.</p>
            <Button onClick={() => setShowCreate(true)}>Create First Project</Button>
          </CardContent>
        </Card>
      )}

      {/* Board view */}
      {view === "board" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => setSelected(project)}
              onDelete={() => deleteProject(project.id)}
              onStatusChange={(s) => updateStatus(project.id, s)}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Card key={project.id} className="card-hover cursor-pointer group" onClick={() => setSelected(project)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: project.color + "20" }}>
                  {project.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{project.name}</span>
                    <Badge variant={STATUS_META[project.status]?.badge as any} className="text-[10px]">
                      {STATUS_META[project.status]?.label}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <Progress value={project.progress} className="flex-1 h-1.5" />
                    <span className="text-xs text-muted-foreground shrink-0">{project.progress}%</span>
                    <span className="text-xs text-muted-foreground shrink-0">{project._count.tasks} tasks</span>
                  </div>
                </div>
                {project.dueDate && (
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(project.dueDate)}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Project Detail Dialog ──────────────────────────── */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <span>{selected.icon}</span>
                {selected.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Meta row */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant={STATUS_META[selected.status]?.badge as any}>
                  {STATUS_META[selected.status]?.label}
                </Badge>
                <Badge variant={PRIORITY_META[selected.priority] as any}>{selected.priority}</Badge>
                {selected.dueDate && (
                  <span className="text-xs text-muted-foreground">Due: {formatDate(selected.dueDate)}</span>
                )}
                {/* Status quick-change */}
                <div className="ml-auto flex gap-1">
                  {Object.keys(STATUS_META).map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`px-2 py-1 text-[10px] rounded-lg border transition-all ${selected.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"}`}>
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{selected.progress}%</span>
                </div>
                <Progress value={selected.progress} />
              </div>

              {/* Description */}
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}

              {/* ── Kanban board ────────────────────────────── */}
              <div>
                <h4 className="font-semibold mb-3">Tasks</h4>
                {/* Quick-add */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a task… press Enter"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                  <Button size="sm" onClick={addTask} disabled={addingTask || !taskInput.trim()}>
                    Add
                  </Button>
                </div>

                {selected.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one above.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(kanbanColumns(selected.tasks)).map(([colStatus, colTasks]) => (
                      <div key={colStatus} className="space-y-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className={`w-2 h-2 rounded-full ${TASK_STATUS_META[colStatus].color}`} />
                          <span className="text-xs font-medium text-muted-foreground">{TASK_STATUS_META[colStatus].label}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
                        </div>
                        {colTasks.map((task) => (
                          <div key={task.id} className="group/task p-2.5 rounded-xl bg-muted/50 border hover:border-primary/30 transition-all">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-medium leading-relaxed">{task.title}</span>
                              <button onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover/task:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {/* Status cycle */}
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {Object.keys(TASK_STATUS_META).map((s) => (
                                <button key={s} onClick={() => updateTaskStatus(task.id, s)}
                                  className={`px-1.5 py-0.5 text-[9px] rounded-md transition-all ${task.status === s ? "bg-primary text-primary-foreground" : "bg-background border hover:bg-muted"}`}>
                                  {TASK_STATUS_META[s].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="h-12 rounded-xl border border-dashed flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground">Empty</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Notes ────────────────────────────────────── */}
              <div>
                <h4 className="font-semibold mb-3">Notes</h4>
                <div className="flex gap-2 mb-3">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note…"
                    className="flex-1 h-16 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" className="self-end" onClick={addNote} disabled={!noteInput.trim()}>Save</Button>
                </div>
                {selected.notes.length > 0 && (
                  <div className="space-y-2">
                    {selected.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-xl bg-muted/50 border">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(note.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete project */}
              <div className="pt-2 border-t">
                <button onClick={() => deleteProject(selected.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Delete this project
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Create Project Dialog ─────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Project name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            {/* Icon picker */}
            <div>
              <label className="text-sm font-medium block mb-2">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === ic ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            {/* Color picker */}
            <div>
              <label className="text-sm font-medium block mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Priority</label>
                <div className="flex flex-wrap gap-1">
                  {["LOW","MEDIUM","HIGH","URGENT"].map((p) => (
                    <Button key={p} size="sm" variant={form.priority === p ? "default" : "outline"}
                      onClick={() => setForm({ ...form, priority: p })} className="text-xs px-2 h-7">{p}</Button>
                  ))}
                </div>
              </div>
              {/* Due date */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Due Date</label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createProject} disabled={saving || !form.name.trim()}>
                {saving ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────
function ProjectCard({
  project,
  onOpen,
  onDelete,
  onStatusChange,
}: {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  onStatusChange: (s: string) => void;
}) {
  const totalTasks = project.tasks.length;
  const doneTasks  = project.tasks.filter((t) => t.status === "DONE").length;

  return (
    <Card className="card-hover group overflow-hidden cursor-pointer" onClick={onOpen}>
      {/* Color strip */}
      <div className="h-1.5" style={{ backgroundColor: project.color }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <Badge variant={STATUS_META[project.status]?.badge as any} className="text-[10px] mt-0.5">
                {STATUS_META[project.status]?.label}
              </Badge>
            </div>
          </div>
          {/* Delete button */}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        )}

        {/* Progress */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{doneTasks}/{totalTasks} tasks</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {project.dueDate
            ? <span>Due {formatDate(project.dueDate)}</span>
            : <span>No due date</span>
          }
          <Badge variant={PRIORITY_META[project.priority] as any} className="text-[10px]">
            {project.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
