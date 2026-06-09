"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOOD_EMOJIS, EMOTIONS, MOOD_FACTORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface MoodLog { id: string; score: number; emoji: string; label: string; emotions: string[]; notes?: string; factors: string[]; date: string }
interface Stats { average: number; total: number; highest: number; lowest: number }

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [stats, setStats] = useState<Stats>({ average: 0, total: 0, highest: 0, lowest: 0 });
  const [todayLog, setTodayLog] = useState<MoodLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/mood?days=30");
    if (res.ok) {
      const d = await res.json();
      setLogs(d.entries);
      setStats(d.stats);
      const today = new Date(); today.setHours(0,0,0,0);
      const tl = d.entries.find((e: MoodLog) => new Date(e.date).setHours(0,0,0,0) === today.getTime());
      if (tl) {
        setTodayLog(tl);
        setSelectedMood(tl.score);
        setSelectedEmotions(tl.emotions || []);
        setSelectedFactors(tl.factors || []);
        setNote(tl.notes || "");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const saveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    const moodInfo = MOOD_EMOJIS.find((m) => m.score === selectedMood);
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: selectedMood,
        emoji: moodInfo?.emoji,
        label: moodInfo?.label,
        emotions: selectedEmotions,
        factors: selectedFactors,
        notes: note,
      }),
    });
    if (res.ok) { setSaved(true); load(); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  // Last 7 days for bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    const log = logs.find((l) => new Date(l.date).setHours(0,0,0,0) === d.getTime());
    return { date: d, log, label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] };
  });

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mood</h2>
          <p className="text-sm text-muted-foreground">Track how you&apos;re feeling</p>
        </div>
        {todayLog && <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>{todayLog.emoji}</span><span>Logged today</span></div>}
      </div>

      {/* Log Today */}
      <Card className="border-primary/20">
        <CardHeader><CardTitle className="text-base">{todayLog ? "Update today's mood" : "How are you feeling today?"}</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Emoji Picker */}
          <div className="flex justify-center gap-1 flex-wrap">
            {MOOD_EMOJIS.map((m) => (
              <button key={m.score} onClick={() => setSelectedMood(m.score)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${selectedMood === m.score ? "bg-primary/10 ring-2 ring-primary scale-110" : "hover:bg-muted/50"}`}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
          {selectedMood > 0 && (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Emotions</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map((e) => (
                    <button key={e} onClick={() => toggle(selectedEmotions, setSelectedEmotions, e)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedEmotions.includes(e) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Influencing factors</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_FACTORS.map((f) => (
                    <button key={f} onClick={() => toggle(selectedFactors, setSelectedFactors, f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedFactors.includes(f) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes?…"
                className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
              <Button className="w-full" onClick={saveMood} disabled={saving}>
                {saved ? "✓ Saved!" : saving ? "Saving…" : todayLog ? "Update Mood" : "Save Mood"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Week chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 justify-between h-28">
            {last7.map(({ label, log }, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                {log ? <span className="text-lg">{log.emoji}</span> : <span className="text-lg opacity-20">😶</span>}
                <div className="w-full bg-primary/15 rounded-t-sm overflow-hidden" style={{ height: "60px" }}>
                  {log && <div className="w-full bg-primary rounded-t-sm transition-all" style={{ height: `${log.score * 10}%`, marginTop: "auto" }} />}
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className="text-xs font-medium">{log ? `${log.score}` : "—"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold">{stats.average || "—"}</div><div className="text-xs text-muted-foreground">30-day Avg</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Entries</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-green-500">{stats.highest || "—"}</div><div className="text-xs text-muted-foreground">Best Day</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-red-500">{stats.lowest || "—"}</div><div className="text-xs text-muted-foreground">Lowest Day</div></CardContent></Card>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Entries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {logs.slice(0, 7).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50">
                <span className="text-2xl">{log.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{log.label}</span>
                    <span className="text-xs text-muted-foreground">{log.score}/10</span>
                  </div>
                  {log.emotions.length > 0 && <div className="text-xs text-muted-foreground mt-0.5">{log.emotions.slice(0, 3).join(", ")}</div>}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(log.date)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
