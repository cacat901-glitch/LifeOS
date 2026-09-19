"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, CircleAlert, ListChecks, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OpticalSurface } from "@/components/visual-system/optical-surface";
import { useAppStore } from "@/hooks/use-store";
import styles from "./tasks.module.css";

type TaskFilter = "active" | "done" | "all";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Task {
  id: string; title: string; description?: string; priority: TaskPriority;
  status: string; dueDate?: string; category?: { name: string };
}

const FILTERS: Array<{ value: TaskFilter; label: string }> = [
  { value: "active", label: "Active" }, { value: "done", label: "Done" }, { value: "all", label: "All" },
];
const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function isActive(task: Task) { return task.status !== "DONE" && task.status !== "CANCELLED"; }
function formatStatus(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }

function dueState(task: Task) {
  if (!task.dueDate) return null;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (isActive(task) && due < today) return { tone: "overdue", label: `Overdue · ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` };
  if (due >= today && due < tomorrow) return { tone: "today", label: "Due today" };
  return { tone: "upcoming", label: `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: due.getFullYear() !== today.getFullYear() ? "numeric" : undefined })}` };
}

function ProgressDivision({ value, label }: { value: number; label: string }) {
  return <div className={styles.metricSignal} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    {Array.from({ length: 10 }, (_, index) => <span key={index} data-active={value > index * 10} />)}
  </div>;
}

function TasksSkeleton() {
  return <div className={styles.page} aria-label="Loading tasks" aria-busy="true">
    <div className={`${styles.skeleton} ${styles.skeletonHeader}`} />
    <div className={`${styles.skeleton} ${styles.skeletonRail}`} />
    <div className={styles.skeletonBoard}><div className={`${styles.skeleton} ${styles.skeletonControl}`} />
      {Array.from({ length: 5 }, (_, index) => <div key={index} className={`${styles.skeleton} ${styles.skeletonRow}`} />)}
    </div>
  </div>;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("active");
  const [quickTask, setQuickTask] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" as TaskPriority, dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const openNovusWithPrompt = useAppStore((state) => state.openNovusWithPrompt);

  const load = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error();
      setTasks(await response.json()); setError(null);
    } catch { setError("Tasks could not be loaded. Check your connection and try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => tasks.filter(isActive), [tasks]);
  const done = useMemo(() => tasks.filter((task) => task.status === "DONE"), [tasks]);
  const completionRate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const overdue = useMemo(() => active.filter((task) => dueState(task)?.tone === "overdue"), [active]);
  const filtered = useMemo(() => tasks.filter((task) => filter === "all" || (filter === "active" ? isActive(task) : task.status === "DONE")), [filter, tasks]);

  const markPending = (taskId: string, pending: boolean) => setPendingIds((current) => {
    const next = new Set(current); if (pending) next.add(taskId); else next.delete(taskId); return next;
  });

  const toggleTask = async (task: Task) => {
    if (pendingIds.has(task.id)) return;
    const status = task.status === "DONE" ? "TODO" : "DONE";
    markPending(task.id, true);
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
    try {
      const response = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: task.id, status }) });
      if (!response.ok) throw new Error(); await load();
    } catch {
      setTasks((current) => current.map((item) => item.id === task.id ? task : item));
      setError("That task could not be updated. Nothing else was changed.");
    } finally { markPending(task.id, false); }
  };

  const deleteTask = async (task: Task) => {
    if (pendingIds.has(task.id)) return;
    markPending(task.id, true); setTasks((current) => current.filter((item) => item.id !== task.id));
    try {
      const response = await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: task.id }) });
      if (!response.ok) throw new Error(); setError(null);
    } catch {
      setTasks((current) => current.some((item) => item.id === task.id) ? current : [...current, task]);
      setError("That task could not be deleted. It has been restored to the list.");
    } finally { markPending(task.id, false); }
  };

  const addQuickTask = async () => {
    const title = quickTask.trim(); if (!title || saving) return; setSaving(true);
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      if (!response.ok) throw new Error(); setQuickTask(""); await load();
    } catch { setError("The task could not be created. Your text is still here so you can try again."); }
    finally { setSaving(false); }
  };

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault(); if (!form.title.trim() || saving) return; setSaving(true);
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, title: form.title.trim(), dueDate: form.dueDate || undefined }) });
      if (!response.ok) throw new Error();
      setShowCreate(false); setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" }); await load();
    } catch { setError("The task could not be created. Review the details and try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <TasksSkeleton />;
  const emptyMessage = filter === "done"
    ? { title: "No completed tasks yet", body: "Completed work will collect here without leaving the active queue crowded." }
    : filter === "all"
      ? { title: "Your task system is clear", body: "Create your first task to begin building an execution queue." }
      : { title: "Nothing is asking for action", body: "Your active queue is clear. Add a task when there is something worth carrying forward." };

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.headingCopy}><h2>Tasks</h2><p>Keep priority visible, move the work, and close the loop.</p>
        <div className={styles.headerState} aria-label={`${active.length} active tasks, ${overdue.length} overdue`}><span>{active.length} active</span><i aria-hidden="true" /><span>{overdue.length} overdue</span></div>
      </div>
      <button className={styles.primaryAction} onClick={() => setShowCreate(true)}><Plus aria-hidden="true" />New task</button>
      <span className={styles.headerTrace} aria-hidden="true" />
    </header>

    <OpticalSurface className={styles.executionRail} light="stream" aria-label="Task summary">
      <div className={styles.metric}><span>Active</span><strong>{active.length}</strong><small>{tasks.length ? `of ${tasks.length} recorded` : "No tasks recorded"}</small><ProgressDivision value={tasks.length ? Math.round((active.length / tasks.length) * 100) : 0} label="Active task share" /></div>
      <div className={styles.metric}><span>Completed</span><strong>{done.length}</strong><small>{done.length === 1 ? "task closed" : "tasks closed"}</small><ProgressDivision value={completionRate} label="Task completion" /></div>
      <div className={styles.metric}><span>Completion rate</span><strong>{completionRate}<em>%</em></strong><small>Current recorded tasks</small><div className={styles.metricPath} style={{ "--task-progress": `${completionRate}%` } as React.CSSProperties} role="meter" aria-label="Completion rate" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100}><i /></div></div>
    </OpticalSurface>

    {error && <div className={styles.error} role="alert"><CircleAlert aria-hidden="true" /><span>{error}</span><button onClick={() => load(true)}><RotateCcw aria-hidden="true" />Retry</button></div>}

    <OpticalSurface className={styles.taskBoard} light="quiet" aria-label="Task queue">
      <div className={styles.boardHeader}><div><span className={styles.metaLabel}>Work queue</span><h3>{filter === "active" ? "Ready to execute" : filter === "done" ? "Completed work" : "All tasks"}</h3></div>
        <div className={styles.filters} aria-label="Filter tasks">{FILTERS.map((item) => <button key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}<span>{item.value === "active" ? active.length : item.value === "done" ? done.length : tasks.length}</span></button>)}</div>
      </div>

      <form className={styles.quickAdd} onSubmit={(event) => { event.preventDefault(); addQuickTask(); }}><Plus aria-hidden="true" /><label className="sr-only" htmlFor="quick-task">Quick add a task</label><input id="quick-task" value={quickTask} onChange={(event) => setQuickTask(event.target.value)} placeholder="Add a task to the queue" disabled={saving} /><button type="submit" disabled={saving || !quickTask.trim()}>{saving ? "Adding…" : "Add"}<ArrowRight aria-hidden="true" /></button></form>
      <div className={styles.listHeader} aria-hidden="true"><span>Task</span><span>Priority</span><span>Due</span><span>Action</span></div>

      {filtered.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyInstrument} aria-hidden="true"><ListChecks /><span><i /><i /><i /><i /></span></div><h3>{emptyMessage.title}</h3><p>{emptyMessage.body}</p><button onClick={() => setShowCreate(true)}><Plus aria-hidden="true" />Create a task</button></div> :
        <ul className={styles.taskList} aria-live="polite">{filtered.map((task) => {
          const completed = task.status === "DONE"; const due = dueState(task); const pending = pendingIds.has(task.id);
          return <li key={task.id} className={styles.taskRow} data-complete={completed} data-priority={task.priority.toLowerCase()} aria-busy={pending}>
            <button className={styles.checkButton} role="checkbox" aria-checked={completed} aria-label={`${completed ? "Mark incomplete" : "Complete"}: ${task.title}`} onClick={() => toggleTask(task)} disabled={pending}>{completed && <Check aria-hidden="true" />}</button>
            <div className={styles.taskCopy}><strong>{task.title}</strong>{task.description && <p>{task.description}</p>}<div className={styles.mobileMeta}><span className={styles.priority} data-priority={task.priority.toLowerCase()}>{task.priority.toLowerCase()}</span>{due && <span className={styles.due} data-tone={due.tone}><CalendarDays aria-hidden="true" />{due.label}</span>}{task.category?.name && <span>{task.category.name}</span>}{task.status !== "TODO" && task.status !== "DONE" && <span>{formatStatus(task.status)}</span>}</div></div>
            <span className={styles.desktopPriority} data-priority={task.priority.toLowerCase()}><i aria-hidden="true" />{task.priority.toLowerCase()}</span>
            <span className={styles.desktopDue} data-tone={due?.tone || "none"}>{due ? <><CalendarDays aria-hidden="true" />{due.label}</> : "—"}</span>
            <button className={styles.deleteButton} onClick={() => deleteTask(task)} disabled={pending} aria-label={`Delete ${task.title}`}><Trash2 aria-hidden="true" /></button><span className={styles.completionSweep} aria-hidden="true" />
          </li>;
        })}</ul>}

      <footer className={styles.boardFooter}><span>{filtered.length} {filtered.length === 1 ? "task" : "tasks"} shown</span><button onClick={() => openNovusWithPrompt("Help me prioritize my current tasks")}>Ask Novus to prioritize<ArrowRight aria-hidden="true" /></button></footer>
    </OpticalSurface>

    <Dialog open={showCreate} onOpenChange={setShowCreate}>
      <DialogContent className={styles.taskDialog} role="dialog" aria-modal="true" aria-labelledby="new-task-title" onKeyDown={(event) => { if (event.key === "Escape") setShowCreate(false); }}>
        <DialogHeader className={styles.dialogHeader}><div><span className={styles.metaLabel}>Add to queue</span><DialogTitle id="new-task-title">New task</DialogTitle></div><button className={styles.dialogClose} onClick={() => setShowCreate(false)} aria-label="Close new task form"><X aria-hidden="true" /></button></DialogHeader>
        <form className={styles.taskForm} onSubmit={createTask}>
          <div><label htmlFor="task-title">Title <span aria-hidden="true">*</span></label><Input id="task-title" autoFocus placeholder="What needs to be done?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div><label htmlFor="task-description">Description</label><textarea id="task-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional details" /></div>
          <fieldset><legend>Priority</legend><div className={styles.priorityChoices}>{PRIORITIES.map((priority) => <button type="button" key={priority} aria-pressed={form.priority === priority} onClick={() => setForm({ ...form, priority })}>{priority.toLowerCase()}</button>)}</div></fieldset>
          <div><label htmlFor="task-due">Due date</label><Input id="task-due" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></div>
          <div className={styles.formActions}><button type="button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" disabled={saving || !form.title.trim()}>{saving ? "Creating…" : "Create task"}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
