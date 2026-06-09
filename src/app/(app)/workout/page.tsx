"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatRelative } from "@/lib/utils";

interface Exercise { id: string; name: string; category: string; muscleGroups: string[]; equipment: string[] }
interface WorkoutSession {
  id: string; name: string; startTime: string; duration?: number;
  totalVolume: number; totalSets: number; isCompleted: boolean; sets: any[];
}

const CATEGORIES = ["ALL","CHEST","BACK","LEGS","SHOULDERS","ARMS","CORE","CARDIO","OTHER"];

export default function WorkoutPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "active" | "exercises">("log");

  // Session state
  const [showStart, setShowStart] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [saving, setSaving] = useState(false);

  // Exercise selection in active session
  const [exSearch, setExSearch] = useState("");
  const [exCategory, setExCategory] = useState("ALL");
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<{ reps: number; weight: number; rpe: number }[]>([{ reps: 10, weight: 0, rpe: 7 }]);
  const [loggingEx, setLoggingEx] = useState(false);

  // Custom exercise
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", category: "OTHER", muscleGroups: "", equipment: "" });

  const load = useCallback(async () => {
    const [sessRes, exRes] = await Promise.all([
      fetch("/api/workout"),
      fetch("/api/exercises"),
    ]);
    if (sessRes.ok) setSessions(await sessRes.json());
    if (exRes.ok)  setExercises(await exRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Session management ───────────────────────────────────────────────────
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
      setActiveTab("active");
    }
    setSaving(false);
  };

  const finishWorkout = async () => {
    if (!activeSession) return;
    const duration = Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 60000);
    await fetch("/api/workout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSession.id, action: "complete", duration }),
    });
    setActiveSession(null);
    setActiveTab("log");
    setSelectedEx(null);
    setSets([{ reps: 10, weight: 0, rpe: 7 }]);
    load();
  };

  // ── Log exercise sets ────────────────────────────────────────────────────
  const logExercise = async () => {
    if (!selectedEx || !activeSession) return;
    setLoggingEx(true);
    for (let i = 0; i < sets.length; i++) {
      await fetch("/api/workout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: "addSet",
          setData: {
            exerciseId: selectedEx.id,
            setNumber: i + 1,
            reps: sets[i].reps,
            weight: sets[i].weight,
            rpe: sets[i].rpe || undefined,
          },
        }),
      });
    }
    setSelectedEx(null);
    setSets([{ reps: 10, weight: 0, rpe: 7 }]);
    setLoggingEx(false);
  };

  // ── Create custom exercise ────────────────────────────────────────────────
  const createCustomExercise = async () => {
    if (!customForm.name.trim()) return;
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: customForm.name,
        category: customForm.category,
        muscleGroups: customForm.muscleGroups.split(",").map((s) => s.trim()).filter(Boolean),
        equipment: customForm.equipment.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) { setShowCustom(false); setCustomForm({ name: "", category: "OTHER", muscleGroups: "", equipment: "" }); load(); }
  };

  // ── Filtered exercises ───────────────────────────────────────────────────
  const filteredEx = exercises.filter((e) => {
    const matchCat = exCategory === "ALL" || e.category === exCategory;
    const matchSearch = !exSearch || e.name.toLowerCase().includes(exSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalSessions = sessions.length;
  const thisWeekCount = sessions.filter((s) => {
    const d = new Date(s.startTime);
    const ago = new Date(); ago.setDate(ago.getDate() - 7);
    return d >= ago;
  }).length;
  const totalVolume = sessions.reduce((s, w) => s + w.totalVolume, 0);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted/50" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workout</h2>
          <p className="text-sm text-muted-foreground">Track your training and hit new PRs</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => setShowStart(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Workout
        </Button>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{activeSession.name} — In Progress</p>
              <p className="text-xs text-muted-foreground">Started {formatRelative(activeSession.startTime)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab("active")}>Continue</Button>
              <Button size="sm" variant="destructive" onClick={finishWorkout}>Finish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{totalSessions}</div><div className="text-xs text-muted-foreground">Sessions</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-500">{thisWeekCount}</div><div className="text-xs text-muted-foreground">This Week</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-500">{totalVolume > 999 ? `${(totalVolume/1000).toFixed(1)}k` : Math.round(totalVolume)}</div><div className="text-xs text-muted-foreground">kg Lifted</div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeTab === "log" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("log")}>Log</Button>
        {activeSession && (
          <Button variant={activeTab === "active" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("active")}>
            🔴 {activeSession.name}
          </Button>
        )}
        <Button variant={activeTab === "exercises" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("exercises")}>
          Exercises ({exercises.length})
        </Button>
      </div>

      {/* ── Log ── */}
      {activeTab === "log" && (
        sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <span className="text-4xl block mb-3">🏋️</span>
              <h3 className="font-semibold mb-1">No workouts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your first workout to begin tracking.</p>
              <Button onClick={() => setShowStart(true)}>Start Workout</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Card key={s.id} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatRelative(s.startTime)}</p>
                    </div>
                    <Badge variant={s.isCompleted ? "success" : "secondary"}>
                      {s.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
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

      {/* ── Active workout ── */}
      {activeTab === "active" && activeSession && (
        <div className="space-y-4">
          {/* Exercise picker */}
          {!selectedEx ? (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Pick an Exercise</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowCustom(true)}>+ Custom</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Search exercises…" value={exSearch} onChange={(e) => setExSearch(e.target.value)} />
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setExCategory(c)}
                      className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-all ${exCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {filteredEx.map((ex) => (
                    <button key={ex.id} onClick={() => setSelectedEx(ex)}
                      className="text-left p-3 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all">
                      <div className="font-medium text-sm">{ex.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ex.muscleGroups.slice(0,2).join(" · ")}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{selectedEx.name}</CardTitle>
                <button onClick={() => setSelectedEx(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Set rows */}
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
                  <span>Set</span><span>Reps</span><span>Weight (kg)</span><span>RPE</span>
                </div>
                {sets.map((set, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-center">
                    <span className="text-sm text-muted-foreground font-medium">{i + 1}</span>
                    <Input type="number" min={1} value={set.reps} className="h-9"
                      onChange={(e) => setSets(sets.map((s, j) => j === i ? { ...s, reps: Number(e.target.value) } : s))} />
                    <Input type="number" min={0} step={0.5} value={set.weight} className="h-9"
                      onChange={(e) => setSets(sets.map((s, j) => j === i ? { ...s, weight: Number(e.target.value) } : s))} />
                    <div className="flex items-center gap-1">
                      <Input type="number" min={1} max={10} value={set.rpe} className="h-9"
                        onChange={(e) => setSets(sets.map((s, j) => j === i ? { ...s, rpe: Number(e.target.value) } : s))} />
                      {sets.length > 1 && (
                        <button onClick={() => setSets(sets.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSets([...sets, { reps: sets[sets.length-1]?.reps || 10, weight: sets[sets.length-1]?.weight || 0, rpe: 7 }])}>
                    + Add Set
                  </Button>
                  <Button className="flex-1" onClick={logExercise} disabled={loggingEx}>
                    {loggingEx ? "Logging…" : `Log ${sets.length} Set${sets.length > 1 ? "s" : ""}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="destructive" className="w-full" onClick={finishWorkout}>
            Finish Workout
          </Button>
        </div>
      )}

      {/* ── Exercise Library ── */}
      {activeTab === "exercises" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search exercises…" value={exSearch} onChange={(e) => setExSearch(e.target.value)} className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => setShowCustom(true)}>+ Custom</Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setExCategory(c)}
                className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-all ${exCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEx.map((ex) => (
              <Card key={ex.id}>
                <CardContent className="p-4">
                  <div className="font-medium text-sm">{ex.name}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{ex.category}</Badge>
                    {ex.muscleGroups.slice(0,2).map((m) => (
                      <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Start Workout Dialog */}
      <Dialog open={showStart} onOpenChange={setShowStart}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start Workout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Workout name (e.g. Push Day)" value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
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

      {/* Custom Exercise Dialog */}
      <Dialog open={showCustom} onOpenChange={setShowCustom}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Custom Exercise</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Exercise name *" value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} />
            <div>
              <label className="text-xs font-medium block mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {["CHEST","BACK","LEGS","SHOULDERS","ARMS","CORE","CARDIO","OTHER"].map((c) => (
                  <button key={c} onClick={() => setCustomForm({ ...customForm, category: c })}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${customForm.category === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder="Muscle groups (comma-separated)" value={customForm.muscleGroups} onChange={(e) => setCustomForm({ ...customForm, muscleGroups: e.target.value })} />
            <Input placeholder="Equipment (comma-separated)" value={customForm.equipment} onChange={(e) => setCustomForm({ ...customForm, equipment: e.target.value })} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCustom(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createCustomExercise} disabled={!customForm.name.trim()}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
