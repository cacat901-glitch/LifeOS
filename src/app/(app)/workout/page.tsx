"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatRelative } from "@/lib/utils";

interface WorkoutSession { id: string; name: string; startTime: string; duration?: number; totalVolume: number; totalSets: number; isCompleted: boolean; sets: any[] }

export default function WorkoutPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "start">("log");
  const [showStart, setShowStart] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [saving, setSaving] = useState(false);

  // For logging sets in active session
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<{reps: number; weight: number}[]>([{reps: 10, weight: 0}]);

  const load = useCallback(async () => {
    const res = await fetch("/api/workout");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startWorkout = async () => {
    if (!workoutName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: workoutName }),
    });
    if (res.ok) {
      const s = await res.json();
      setActiveSession(s);
      setShowStart(false);
      setWorkoutName("");
      setActiveTab("start");
    }
    setSaving(false);
  };

  const finishWorkout = async () => {
    if (!activeSession) return;
    const start = new Date(activeSession.startTime);
    const duration = Math.round((Date.now() - start.getTime()) / 60000);
    await fetch("/api/workout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSession.id, action: "complete", duration }),
    });
    setActiveSession(null);
    setActiveTab("log");
    load();
  };

  const totalSessions = sessions.length;
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.startTime);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const totalVolume = sessions.reduce((s, w) => s + w.totalVolume, 0);

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workout</h2>
          <p className="text-sm text-muted-foreground">Track your training</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => setShowStart(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Start Workout
        </Button>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{activeSession.name} — In Progress</p>
              <p className="text-xs text-muted-foreground">Started {formatRelative(activeSession.startTime)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab("start")}>Continue</Button>
              <Button size="sm" variant="destructive" onClick={finishWorkout}>Finish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totalSessions}</div><div className="text-xs text-muted-foreground">Total Sessions</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{thisWeek}</div><div className="text-xs text-muted-foreground">This Week</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-500">{totalVolume > 999 ? `${(totalVolume/1000).toFixed(1)}k` : Math.round(totalVolume)}</div><div className="text-xs text-muted-foreground">kg Volume</div></CardContent></Card>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeTab === "log" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("log")}>Workout Log</Button>
        {activeSession && <Button variant={activeTab === "start" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("start")}>Active: {activeSession.name}</Button>}
      </div>

      {/* Workout Log */}
      {activeTab === "log" && (
        sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <span className="text-4xl block mb-3">🏋️</span>
              <h3 className="font-semibold mb-1">No workouts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your first workout to begin tracking.</p>
              <Button onClick={() => setShowStart(true)}>Start First Workout</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <Card key={s.id} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatRelative(s.startTime)}</p>
                    </div>
                    <Badge variant={s.isCompleted ? "success" : "secondary"}>{s.isCompleted ? "Completed" : "In Progress"}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div><div className="text-sm font-semibold">{s.duration ? `${s.duration}min` : "—"}</div><div className="text-xs text-muted-foreground">Duration</div></div>
                    <div><div className="text-sm font-semibold">{s.totalSets}</div><div className="text-xs text-muted-foreground">Sets</div></div>
                    <div><div className="text-sm font-semibold">{s.totalVolume > 0 ? `${Math.round(s.totalVolume)}kg` : "—"}</div><div className="text-xs text-muted-foreground">Volume</div></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Active session view */}
      {activeTab === "start" && activeSession && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Log Sets</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Exercise name (e.g. Bench Press)" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} />
              {sets.map((set, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-8">Set {i + 1}</span>
                  <Input type="number" placeholder="Reps" value={set.reps} min={1}
                    onChange={(e) => setSets(sets.map((s, j) => j === i ? { ...s, reps: Number(e.target.value) } : s))}
                    className="flex-1" />
                  <Input type="number" placeholder="kg" value={set.weight} min={0}
                    onChange={(e) => setSets(sets.map((s, j) => j === i ? { ...s, weight: Number(e.target.value) } : s))}
                    className="flex-1" />
                  {sets.length > 1 && (
                    <button onClick={() => setSets(sets.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive text-lg">×</button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSets([...sets, { reps: 10, weight: 0 }])}>+ Add Set</Button>
              <Button className="w-full" disabled={!exerciseName.trim()} onClick={async () => {
                // In a real flow we'd look up exercise IDs; for now just log each set
                for (let i = 0; i < sets.length; i++) {
                  await fetch("/api/workout", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sessionId: activeSession.id,
                      action: "addSet",
                      setData: { exerciseId: "bench-press", setNumber: i + 1, reps: sets[i].reps, weight: sets[i].weight },
                    }),
                  });
                }
                setExerciseName("");
                setSets([{ reps: 10, weight: 0 }]);
              }}>Log Exercise</Button>
            </CardContent>
          </Card>
          <Button variant="destructive" className="w-full" onClick={finishWorkout}>Finish Workout</Button>
        </div>
      )}

      {/* Start Dialog */}
      <Dialog open={showStart} onOpenChange={setShowStart}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start Workout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Workout name (e.g. Push Day)" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startWorkout()} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowStart(false)}>Cancel</Button>
              <Button className="flex-1" onClick={startWorkout} disabled={saving || !workoutName.trim()}>
                {saving ? "Starting…" : "Start"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
