"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CircleAlert, Plus, Repeat2, RotateCcw, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OpticalSurface } from "@/components/visual-system/optical-surface";
import { useAppStore } from "@/hooks/use-store";
import styles from "./habits.module.css";

type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
interface Habit { id: string; name: string; description?: string; icon: string; color: string; currentStreak: number; longestStreak?: number; totalCompletions: number; frequency: HabitFrequency; targetDays?: number[]; logs: { completed: boolean }[]; category?: { name: string }; }

const ICONS = ["✅", "💧", "📚", "🧘", "💪", "📝", "🌙", "🥗", "🏃", "💊", "🎯", "🌅", "🛏", "🧹", "🎵", "💻", "🚶", "🧠", "🌿", "⭐"];
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];
const FREQUENCIES: HabitFrequency[] = ["DAILY", "WEEKLY", "MONTHLY"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function isComplete(habit: Habit) { return habit.logs?.some((log) => log.completed) ?? false; }
function frequencyLabel(frequency: HabitFrequency) { return frequency.toLowerCase().replace(/^./, (letter) => letter.toUpperCase()); }

function ScheduleBand({ habit }: { habit: Habit }) {
  const selectedDays = habit.frequency === "DAILY" ? DAY_LABELS.map((_, index) => index) : habit.targetDays || [];
  if (habit.frequency !== "DAILY" && selectedDays.length === 0) return <span className={styles.frequencyBand} aria-hidden="true" data-frequency={habit.frequency.toLowerCase()}>{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</span>;
  return <span className={styles.dayBand} aria-label={`${frequencyLabel(habit.frequency)} schedule`}>{DAY_LABELS.map((label, index) => <i key={`${label}-${index}`} data-active={selectedDays.includes(index)}><span>{label}</span></i>)}</span>;
}

function CompletionArc({ value, completed, total }: { value: number; completed: number; total: number }) {
  const radius = 48; const circumference = 2 * Math.PI * radius;
  return <div className={styles.completionArc} role="meter" aria-label="Habits completed today" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <svg viewBox="0 0 120 120" aria-hidden="true"><circle className={styles.arcTrack} cx="60" cy="60" r={radius} /><circle className={styles.arcValue} cx="60" cy="60" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - value / 100) }} />{Array.from({ length: 12 }, (_, index) => <line key={index} x1="60" y1="5" x2="60" y2="9" transform={`rotate(${index * 30} 60 60)`} />)}</svg>
    <div><strong>{completed}<span>/{total}</span></strong><small>today</small></div>
  </div>;
}

function HabitsSkeleton() {
  return <div className={styles.page} aria-label="Loading habits" aria-busy="true"><div className={`${styles.skeleton} ${styles.skeletonHeader}`} /><div className={`${styles.skeleton} ${styles.skeletonRhythm}`} /><div className={styles.skeletonList}>{Array.from({ length: 5 }, (_, index) => <div key={index} className={`${styles.skeleton} ${styles.skeletonRow}`} />)}</div></div>;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "✅", color: "#6366f1", frequency: "DAILY" as HabitFrequency });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const openNovusWithPrompt = useAppStore((state) => state.openNovusWithPrompt);

  const load = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [habitsResponse, userResponse] = await Promise.all([fetch("/api/habits"), fetch("/api/user")]);
      if (!habitsResponse.ok) throw new Error();
      setHabits(await habitsResponse.json());
      if (userResponse.ok) { const user = await userResponse.json(); setPlan(user?.subscription?.plan === "PRO" ? "PRO" : "FREE"); }
      setError(null);
    } catch { setError("Habits could not be loaded. Check your connection and try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const completed = useMemo(() => habits.filter(isComplete), [habits]);
  const total = habits.length;
  const completionRate = total ? Math.round((completed.length / total) * 100) : 0;
  const bestStreak = total ? Math.max(...habits.map((habit) => habit.longestStreak ?? habit.currentStreak ?? 0)) : 0;
  const totalCompletions = habits.reduce((sum, habit) => sum + (habit.totalCompletions || 0), 0);
  const atFreeLimit = plan === "FREE" && total >= 3;

  const markPending = (habitId: string, pending: boolean) => setPendingIds((current) => { const next = new Set(current); if (pending) next.add(habitId); else next.delete(habitId); return next; });

  const toggle = async (habit: Habit) => {
    if (pendingIds.has(habit.id)) return;
    const currentlyDone = isComplete(habit); markPending(habit.id, true);
    setHabits((current) => current.map((item) => item.id === habit.id ? { ...item, logs: [{ completed: !currentlyDone }] } : item));
    try { const response = await fetch("/api/habits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId: habit.id, completed: !currentlyDone }) }); if (!response.ok) throw new Error(); await load(); }
    catch { setHabits((current) => current.map((item) => item.id === habit.id ? habit : item)); setError("That habit could not be updated. Its previous state has been restored."); }
    finally { markPending(habit.id, false); }
  };

  const createHabit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!form.name.trim() || saving) return; setSaving(true); setFormError("");
    try {
      const response = await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, name: form.name.trim() }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || "The habit could not be created."); }
      setShowCreate(false); setForm({ name: "", icon: "✅", color: "#6366f1", frequency: "DAILY" }); await load();
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "The habit could not be created."); }
    finally { setSaving(false); }
  };

  const deleteHabit = async (habit: Habit) => {
    if (pendingIds.has(habit.id) || !confirm(`Delete “${habit.name}”?`)) return;
    markPending(habit.id, true); setHabits((current) => current.filter((item) => item.id !== habit.id));
    try { const response = await fetch("/api/habits", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId: habit.id }) }); if (!response.ok) throw new Error(); setError(null); }
    catch { setHabits((current) => current.some((item) => item.id === habit.id) ? current : [...current, habit]); setError("That habit could not be deleted. It has been restored."); }
    finally { markPending(habit.id, false); }
  };

  const handleNewHabit = async () => {
    if (!atFreeLimit) { setFormError(""); setShowCreate(true); return; }
    setSaving(true);
    try { const response = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "checkout" }) }); if (!response.ok) throw new Error(); const data = await response.json(); if (data.url) window.location.href = data.url; }
    catch { setError("Checkout could not be opened. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <HabitsSkeleton />;
  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.headingCopy}><h2>Habits</h2><p>Build consistency through small actions repeated over time.</p><div className={styles.headerState} aria-label={`${completed.length} of ${total} habits completed today`}><span>Today</span><i aria-hidden="true" /><span>{completed.length} of {total} complete</span></div></div>
      <button className={styles.primaryAction} onClick={handleNewHabit} disabled={saving}><Plus aria-hidden="true" />{atFreeLimit ? "Upgrade for more" : "New habit"}</button>
      <span className={styles.headerCadence} aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</span>
    </header>

    {atFreeLimit && <div className={styles.limitNotice}><div><strong>Free plan limit reached</strong><span>Three active habits are included. Upgrade for unlimited habits.</span></div><button onClick={handleNewHabit} disabled={saving}>Upgrade to Pro<ArrowRight aria-hidden="true" /></button></div>}
    {error && <div className={styles.error} role="alert"><CircleAlert aria-hidden="true" /><span>{error}</span><button onClick={() => load(true)}><RotateCcw aria-hidden="true" />Retry</button></div>}

    <OpticalSurface className={styles.rhythmOverview} light="cadence" aria-label="Today’s habit rhythm">
      <div className={styles.overviewLead}><CompletionArc value={completionRate} completed={completed.length} total={total} /><div><span className={styles.metaLabel}>Daily rhythm</span><h3>{total === 0 ? "Ready to begin" : completed.length === total ? "Today is complete" : "Today in progress"}</h3><p>{total === 0 ? "Create a habit to establish your first recurring action." : `${completionRate}% of today’s active habits are complete.`}</p></div></div>
      <div className={styles.cadenceLine} aria-hidden="true"><span>{Array.from({ length: 14 }, (_, index) => <i key={index} data-active={total > 0 && index < Math.round((completionRate / 100) * 14)} />)}</span><b /></div>
      <dl className={styles.overviewMetrics}><div><dt>Active</dt><dd>{total}</dd><small>habits</small></div><div><dt>Best streak</dt><dd>{bestStreak}<span>d</span></dd><small>recorded</small></div><div><dt>Completions</dt><dd>{totalCompletions}</dd><small>all time</small></div></dl>
    </OpticalSurface>

    <OpticalSurface className={styles.todaySurface} light="quiet" aria-label="Today’s habits">
      <div className={styles.todayHeader}><div><span className={styles.metaLabel}>Today</span><h3>Your rhythm</h3><p>{total ? `${total - completed.length} remaining today` : "No active habits yet"}</p></div><Repeat2 aria-hidden="true" /></div>
      {habits.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyCadence} aria-hidden="true"><Repeat2 />{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div><h3>No habits yet</h3><p>Create your first recurring action. Novus will show real completion and streak data as you build it.</p><button onClick={handleNewHabit}><Plus aria-hidden="true" />Create first habit</button></div> :
        <ul className={styles.habitList} aria-live="polite">{habits.map((habit) => { const done = isComplete(habit); const pending = pendingIds.has(habit.id); return <li key={habit.id} className={styles.habitRow} data-complete={done} aria-busy={pending}>
          <button className={styles.ritualControl} role="checkbox" aria-checked={done} aria-label={`${done ? "Mark incomplete" : "Complete"}: ${habit.name}`} onClick={() => toggle(habit)} disabled={pending}><span className={styles.ritualRing} aria-hidden="true" />{done ? <Check aria-hidden="true" /> : <span className={styles.habitIcon} aria-hidden="true">{habit.icon || "•"}</span>}</button>
          <div className={styles.habitCopy}><div><strong>{habit.name}</strong>{habit.currentStreak > 0 && <span className={styles.streak}>{habit.currentStreak} day streak</span>}</div>{habit.description && <p>{habit.description}</p>}<div className={styles.rowMeta}><span>{frequencyLabel(habit.frequency)}</span>{habit.category?.name && <span>{habit.category.name}</span>}<span>{habit.totalCompletions || 0} total completions</span></div></div>
          <ScheduleBand habit={habit} /><button className={styles.deleteButton} onClick={() => deleteHabit(habit)} disabled={pending} aria-label={`Delete ${habit.name}`}><Trash2 aria-hidden="true" /></button><span className={styles.completionSignal} aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</span>
        </li>; })}</ul>}
      <footer className={styles.todayFooter}><span>{completed.length} completed today</span><button onClick={() => openNovusWithPrompt("Help me build consistency with my habits")}>Ask Novus about consistency<ArrowRight aria-hidden="true" /></button></footer>
    </OpticalSurface>

    <Dialog open={showCreate} onOpenChange={setShowCreate} layerClassName={styles.dialogLayer}><DialogContent className={styles.habitDialog} role="dialog" aria-modal="true" aria-labelledby="new-habit-title" onKeyDown={(event) => { if (event.key === "Escape") setShowCreate(false); }}>
      <DialogHeader className={styles.dialogHeader}><div><span className={styles.metaLabel}>Add to rhythm</span><DialogTitle id="new-habit-title">New habit</DialogTitle></div><button className={styles.dialogClose} onClick={() => setShowCreate(false)} aria-label="Close new habit form"><X aria-hidden="true" /></button></DialogHeader>
      <form className={styles.habitForm} onSubmit={createHabit}>{formError && <div className={styles.formError} role="alert">{formError}</div>}
        <div><label htmlFor="habit-name">Habit name</label><Input id="habit-name" autoFocus placeholder="Morning meditation" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
        <fieldset><legend>Icon</legend><div className={styles.iconChoices}>{ICONS.map((icon) => <button type="button" key={icon} aria-pressed={form.icon === icon} aria-label={`Use ${icon} icon`} onClick={() => setForm({ ...form, icon })}>{icon}</button>)}</div></fieldset>
        <fieldset><legend>Color</legend><div className={styles.colorChoices}>{COLORS.map((color) => <button type="button" key={color} aria-pressed={form.color === color} aria-label={`Use color ${color}`} style={{ "--habit-color": color } as React.CSSProperties} onClick={() => setForm({ ...form, color })} />)}</div></fieldset>
        <fieldset><legend>Frequency</legend><div className={styles.frequencyChoices}>{FREQUENCIES.map((frequency) => <button type="button" key={frequency} aria-pressed={form.frequency === frequency} onClick={() => setForm({ ...form, frequency })}>{frequencyLabel(frequency)}</button>)}</div></fieldset>
        <div className={styles.formActions}><button type="button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" disabled={saving || !form.name.trim()}>{saving ? "Creating…" : "Create habit"}</button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}
