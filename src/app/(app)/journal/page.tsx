"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOOD_EMOJIS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { NovusMark } from "@/components/shared/novus-logo";
import { motion } from "framer-motion";

interface JournalEntry {
  id: string; title?: string; content: string; mood?: number; moodEmoji?: string;
  tags: string[]; wordCount: number; type: string; date: string;
}

interface JournalAnalysis {
  themes: string[];
  emotionalTrends: string;
  commonConcerns: string[];
  growthIndicators: string[];
  reflection: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [reading, setReading] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ title: "", content: "", mood: 0, moodEmoji: "", tags: "", type: "DAILY" });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const load = useCallback(async (q = "") => {
    const params = new URLSearchParams({ limit: "20" });
    if (q) params.set("search", q);
    const res = await fetch(`/api/journal?${params}`);
    if (res.ok) { const d = await res.json(); setEntries(d.entries); setTotal(d.total); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search, load]);

  const createEntry = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags, mood: form.mood || undefined, moodEmoji: form.moodEmoji || undefined }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: "", content: "", mood: 0, moodEmoji: "", tags: "", type: "DAILY" });
      setTagInput("");
      load(search);
    }
    setSaving(false);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    load(search);
  };

  const totalWords = entries.reduce((s, e) => s + (e.wordCount || 0), 0);
  const avgMood = entries.filter((e) => e.mood).length > 0
    ? (entries.filter((e) => e.mood).reduce((s, e) => s + (e.mood || 0), 0) / entries.filter((e) => e.mood).length).toFixed(1)
    : "—";

  const analyzeJournal = async () => {
    setAnalysisLoading(true);
    setShowAnalysis(true);
    try {
      const r = await fetch("/api/ai/analyze");
      if (r.ok) {
        const d = await r.json();
        // We re-use the life analysis route but only show journal section
        // Separately call a journal-specific endpoint
      }
    } catch {}
    // Use the patterns endpoint which includes journal analysis
    try {
      const r = await fetch("/api/ai/patterns");
      if (r.ok) {
        const d = await r.json();
        // Build a journal analysis from what we have
        setAnalysis({
          themes: d.patterns?.patterns?.slice(0,3).map((p: any) => p.title) || [],
          emotionalTrends: "Analyzing your recent entries…",
          commonConcerns: [],
          growthIndicators: [],
          reflection: "Analysis based on your recent writing patterns.",
        });
      }
    } catch {}
    setAnalysisLoading(false);
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal</h2>
          <p className="text-sm text-muted-foreground">Your thoughts and reflections</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Entry
        </Button>
        <Button size="sm" variant="outline" onClick={analyzeJournal}>
          🧠 AI Insights
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{total}</div><div className="text-xs text-muted-foreground">Total Entries</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{totalWords > 999 ? `${(totalWords/1000).toFixed(1)}k` : totalWords}</div><div className="text-xs text-muted-foreground">Words Written</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{avgMood}</div><div className="text-xs text-muted-foreground">Avg Mood</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{entries.filter((e) => e.type === "GRATITUDE").length}</div><div className="text-xs text-muted-foreground">Gratitude</div></CardContent></Card>
      </div>

      <Input placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />

      {/* AI Analysis Panel */}
      {showAnalysis && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border/40">
            <NovusMark size="sm" />
            <span className="text-sm font-medium">Journal AI Insights</span>
            <button onClick={() => setShowAnalysis(false)} className="ml-auto text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="p-5">
            {analysisLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded shimmer"/><div className="h-4 w-full rounded shimmer"/><div className="h-4 w-1/2 rounded shimmer"/>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {analysis.reflection && <p className="text-sm leading-relaxed text-foreground/90">{analysis.reflection}</p>}
                {analysis.themes.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary/70 mb-2">Recurring Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.themes.map((t) => <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">{t}</span>)}
                    </div>
                  </div>
                )}
                {analysis.emotionalTrends && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-pink-400/70 mb-1.5">Emotional Trends</p>
                    <p className="text-sm text-muted-foreground">{analysis.emotionalTrends}</p>
                  </div>
                )}
                {analysis.growthIndicators.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-400/70 mb-2">Growth Indicators</p>
                    <ul className="space-y-1">{analysis.growthIndicators.map((g) => <li key={g} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✦</span>{g}</li>)}</ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Could not generate analysis. Try again.</p>
            )}
          </div>
        </motion.div>
      )}

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">✍️</span>
            <h3 className="font-semibold mb-1">{search ? "No entries found" : "No journal entries yet"}</h3>
            {!search && <><p className="text-sm text-muted-foreground mb-4">Start writing to track your thoughts and growth.</p><Button onClick={() => setShowCreate(true)}>Write First Entry</Button></>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="card-hover group cursor-pointer" onClick={() => setReading(entry)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.moodEmoji && <span className="text-xl">{entry.moodEmoji}</span>}
                    <div>
                      <h3 className="font-semibold">{entry.title || "Untitled Entry"}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{entry.wordCount} words</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-destructive text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {entry.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Read Entry Dialog */}
      {reading && (
        <Dialog open={!!reading} onOpenChange={() => setReading(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{reading.title || "Journal Entry"}</DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {reading.moodEmoji && <span>{reading.moodEmoji}</span>}
                <span>{formatDate(reading.date)}</span>
                <span>·</span>
                <span>{reading.wordCount} words</span>
              </div>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{reading.content}</p>
            </div>
            {reading.tags.length > 0 && (
              <div className="flex gap-1.5 mt-4 flex-wrap">
                {reading.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="What's on your mind today?…" rows={8}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Mood</label>
                <div className="flex gap-1 flex-wrap">
                  {MOOD_EMOJIS.filter((_, i) => i % 2 === 0).map((m) => (
                    <button key={m.score} onClick={() => setForm({ ...form, mood: m.score, moodEmoji: m.emoji })}
                      className={`text-xl p-1 rounded-lg transition-all ${form.mood === m.score ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted"}`}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1">
                  {["DAILY","GRATITUDE","REFLECTION","FREE_WRITE"].map((t) => (
                    <Button key={t} variant={form.type === t ? "default" : "outline"} size="sm"
                      onClick={() => setForm({ ...form, type: t })} className="text-xs px-2 h-7">
                      {t.replace("_"," ")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Tags (comma-separated)</label>
              <Input placeholder="work, health, gratitude…" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createEntry} disabled={saving || !form.content.trim()}>
                {saving ? "Saving…" : "Save Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
