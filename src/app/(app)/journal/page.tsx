"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenText, CalendarDays, CircleAlert, Feather, RotateCcw, Search, Sparkles, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MOOD_EMOJIS } from "@/lib/constants";
import { NovusMark } from "@/components/shared/novus-logo";
import { OpticalSurface } from "@/components/visual-system/optical-surface";
import styles from "./journal.module.css";

interface JournalEntry { id: string; title?: string; content: string; mood?: number; moodEmoji?: string; tags: string[]; wordCount: number; type: string; date: string; }
interface JournalPattern { title: string; description: string; actionable: string; type: "positive" | "warning" | "neutral"; }
const ENTRY_TYPES = ["DAILY", "GRATITUDE", "REFLECTION", "FREE_WRITE"] as const;

function entryDate(value: string) { return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(value)); }
function entryTime(value: string) { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
function monthLabel(value: string) { return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(value)); }
function typeLabel(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }

function JournalSkeleton() {
  return <div className={styles.page} aria-label="Loading journal" aria-busy="true">
    <div className={`${styles.skeleton} ${styles.skeletonHeader}`} />
    <div className={`${styles.skeleton} ${styles.skeletonCompose}`} />
    <div className={styles.skeletonArchive}>{Array.from({ length: 4 }, (_, index) => <div key={index} className={`${styles.skeleton} ${styles.skeletonRow}`} />)}</div>
  </div>;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [reading, setReading] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ title: "", content: "", mood: 0, moodEmoji: "", type: "DAILY" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const load = useCallback(async (query = "", showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (query.trim()) params.set("search", query.trim());
      const response = await fetch(`/api/journal?${params}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setEntries(data.entries); setTotal(data.total); setLoadError(null);
    } catch { setLoadError("Your journal could not be loaded. Check your connection and try again."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => load(search), search ? 350 : 0); return () => window.clearTimeout(timer); }, [load, search]);
  useEffect(() => { if (new URLSearchParams(window.location.search).get("new") === "1") setShowCreate(true); }, []);

  const groupedEntries = useMemo(() => {
    const groups: Array<{ label: string; entries: JournalEntry[] }> = [];
    for (const entry of entries) { const label = monthLabel(entry.date); const current = groups.at(-1); if (current?.label === label) current.entries.push(entry); else groups.push({ label, entries: [entry] }); }
    return groups;
  }, [entries]);
  const wordsInView = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
  const moodEntries = entries.filter((entry) => entry.mood);
  const averageMood = moodEntries.length ? (moodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodEntries.length).toFixed(1) : "—";
  const gratitudeInView = entries.filter((entry) => entry.type === "GRATITUDE").length;

  const resetForm = () => { setForm({ title: "", content: "", mood: 0, moodEmoji: "", type: "DAILY" }); setTagInput(""); setActionError(null); };
  const createEntry = async (event: React.FormEvent) => {
    event.preventDefault(); if (!form.content.trim() || saving) return; setSaving(true); setActionError(null);
    const tags = tagInput.split(",").map((tag) => tag.trim()).filter(Boolean);
    try {
      const response = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, title: form.title.trim() || undefined, content: form.content.trim(), tags, mood: form.mood || undefined, moodEmoji: form.moodEmoji || undefined }) });
      if (!response.ok) throw new Error(); setShowCreate(false); resetForm(); await load(search);
    } catch { setActionError("This entry could not be saved. Your writing is still here so you can try again."); }
    finally { setSaving(false); }
  };
  const deleteEntry = async (entry: JournalEntry) => {
    if (deletingId || !window.confirm("Delete this entry?")) return; setDeletingId(entry.id); setActionError(null);
    try { const response = await fetch(`/api/journal/${entry.id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setReading(null); await load(search); }
    catch { setActionError("That entry could not be deleted. Nothing was removed."); }
    finally { setDeletingId(null); }
  };
  const analyzeJournal = async () => {
    setAnalysisLoading(true); setShowAnalysis(true); setActionError(null);
    try { const response = await fetch("/api/ai/patterns"); if (!response.ok) throw new Error(); const data = await response.json(); setPatterns(Array.isArray(data.patterns?.patterns) ? data.patterns.patterns : []); }
    catch { setPatterns([]); setActionError("Novus could not review your current patterns. Try again when you are ready."); }
    finally { setAnalysisLoading(false); }
  };

  if (loading) return <JournalSkeleton />;
  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.headingCopy}><span>Private reflection</span><h2>Journal</h2><p>A quiet place to record what happened, what mattered, and what you want to remember.</p><div className={styles.headerState} aria-label={`${total} journal entries`}><span>{total} {total === 1 ? "entry" : "entries"}</span><i aria-hidden="true" /><span>{entries.length ? `Latest ${entryDate(entries[0].date)}` : "Archive waiting"}</span></div></div>
      <button className={styles.primaryAction} onClick={() => { resetForm(); setShowCreate(true); }}><Feather aria-hidden="true" />Write</button><span className={styles.headerReflection} aria-hidden="true"><i /><i /><i /></span>
    </header>

    {actionError && <div className={styles.actionError} role="alert"><CircleAlert aria-hidden="true" /><span>{actionError}</span><button onClick={() => setActionError(null)} aria-label="Dismiss error"><X aria-hidden="true" /></button></div>}

    <OpticalSurface className={styles.writingThreshold} light="quiet">
      <div className={styles.thresholdCopy}><span className={styles.metaLabel}>New reflection</span><h3>Begin with what is true right now.</h3><p>Your entry stays private to your account. Add a title, mood, type, or tags only when they help.</p></div>
      <button className={styles.thresholdAction} onClick={() => { resetForm(); setShowCreate(true); }}><span><Feather aria-hidden="true" /></span><strong>Start writing</strong><small>Open a blank entry</small><ArrowRight aria-hidden="true" /></button>
      <dl className={styles.folio} aria-label="Journal summary"><div><dt>Entries</dt><dd>{total}</dd><small>All recorded</small></div><div><dt>Words</dt><dd>{wordsInView > 999 ? `${(wordsInView / 1000).toFixed(1)}k` : wordsInView}</dd><small>Current view</small></div><div><dt>Average mood</dt><dd>{averageMood}</dd><small>{moodEntries.length ? `${moodEntries.length} rated` : "Not recorded"}</small></div><div><dt>Gratitude</dt><dd>{gratitudeInView}</dd><small>Current view</small></div></dl>
    </OpticalSurface>

    {showAnalysis && <OpticalSurface className={styles.analysis} light="upper" aria-label="Novus whole-life patterns">
      <div className={styles.analysisHeader}><NovusMark size="sm" /><div><span className={styles.metaLabel}>Novus review</span><h3>Whole-life patterns</h3></div><button onClick={() => setShowAnalysis(false)} aria-label="Close Novus review"><X aria-hidden="true" /></button></div>
      <p className={styles.analysisScope}>This existing analysis considers your recorded activity across Novus, including journal frequency. It is not a journal-only interpretation.</p>
      {analysisLoading ? <div className={styles.analysisLoading} role="status"><span /><span /><span /><p>Reviewing current records…</p></div> : patterns.length ? <div className={styles.patternList}>{patterns.slice(0, 4).map((pattern, index) => <article key={`${pattern.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{pattern.title}</h4>{pattern.description && <p>{pattern.description}</p>}{pattern.actionable && <small>{pattern.actionable}</small>}</div></article>)}</div> : <p className={styles.noPatterns}>No patterns were returned from the current records.</p>}
    </OpticalSurface>}

    <section className={styles.archive} aria-labelledby="journal-archive-title">
      <div className={styles.archiveHeader}><div><span className={styles.metaLabel}>Chronology</span><h3 id="journal-archive-title">Your archive</h3></div><div className={styles.archiveActions}><label className={styles.searchBox}><Search aria-hidden="true" /><span className="sr-only">Search journal entries</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search entries" /></label><button onClick={analyzeJournal} disabled={analysisLoading}><Sparkles aria-hidden="true" />AI insights</button></div></div>
      {loadError ? <OpticalSurface className={styles.loadError} light="quiet"><CircleAlert aria-hidden="true" /><h3>Journal unavailable</h3><p>{loadError}</p><button onClick={() => load(search, true)}><RotateCcw aria-hidden="true" />Retry</button></OpticalSurface> : entries.length === 0 ? <OpticalSurface className={styles.emptyState} light="quiet"><div className={styles.emptyMark} aria-hidden="true"><BookOpenText /><span /></div><h3>{search ? "No entries match this search" : "Your first page is waiting"}</h3><p>{search ? "Try another word or clear the search to return to your archive." : "Start with one honest paragraph. You can add structure later if it becomes useful."}</p>{search ? <button onClick={() => setSearch("")}>Clear search</button> : <button onClick={() => { resetForm(); setShowCreate(true); }}><Feather aria-hidden="true" />Write first entry</button>}</OpticalSurface> : <div className={styles.chronology}>
        {groupedEntries.map((group) => <div className={styles.monthGroup} key={group.label}><div className={styles.monthLabel}><span>{group.label}</span><i aria-hidden="true" /></div><ol>{group.entries.map((entry, index) => <li key={entry.id} className={styles.entryRow}>
          <button className={styles.entryOpen} onClick={() => setReading(entry)} aria-label={`Read ${entry.title || "untitled entry"}`}><time dateTime={entry.date}><strong>{new Date(entry.date).getDate()}</strong><span>{entryTime(entry.date)}</span></time><span className={styles.railNode} aria-hidden="true" data-first={index === 0} /><span className={styles.entryCopy}><span className={styles.entryTopline}>{entry.moodEmoji && <i>{entry.moodEmoji}</i>}<b>{typeLabel(entry.type)}</b><em>{entry.wordCount} {entry.wordCount === 1 ? "word" : "words"}</em></span><strong>{entry.title || "Untitled entry"}</strong><p>{entry.content}</p>{entry.tags.length > 0 && <span className={styles.tags}>{entry.tags.map((tag) => <small key={tag}>{tag}</small>)}</span>}</span><ArrowRight className={styles.entryArrow} aria-hidden="true" /></button>
          <button className={styles.deleteButton} onClick={() => deleteEntry(entry)} disabled={deletingId === entry.id} aria-label={`Delete ${entry.title || "untitled entry"}`}><Trash2 aria-hidden="true" /></button>
        </li>)}</ol></div>)}<footer className={styles.archiveFooter}><span>{entries.length} of {total} {total === 1 ? "entry" : "entries"} shown</span></footer>
      </div>}
    </section>

    <Dialog open={!!reading} onOpenChange={(open) => { if (!open) setReading(null); }} layerClassName={styles.dialogLayer}>
      {reading && <DialogContent className={styles.readerDialog} role="dialog" aria-modal="true" aria-labelledby="journal-reader-title"><div className={styles.readerHeader}><div><span className={styles.metaLabel}>{typeLabel(reading.type)}</span><DialogTitle id="journal-reader-title">{reading.title || "Journal entry"}</DialogTitle></div><button onClick={() => setReading(null)} aria-label="Close journal entry"><X aria-hidden="true" /></button></div><div className={styles.readerMeta}><span><CalendarDays aria-hidden="true" />{entryDate(reading.date)} at {entryTime(reading.date)}</span><span>{reading.wordCount} {reading.wordCount === 1 ? "word" : "words"}</span>{reading.moodEmoji && <span>{reading.moodEmoji}{reading.mood ? ` ${reading.mood}/10` : ""}</span>}</div><article className={styles.readerBody}><p>{reading.content}</p></article><footer className={styles.readerFooter}><div>{reading.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button onClick={() => deleteEntry(reading)} disabled={deletingId === reading.id}><Trash2 aria-hidden="true" />{deletingId === reading.id ? "Deleting…" : "Delete entry"}</button></footer></DialogContent>}
    </Dialog>

    <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open && !saving) setActionError(null); }} layerClassName={styles.dialogLayer}>
      <DialogContent className={styles.editorDialog} role="dialog" aria-modal="true" aria-labelledby="journal-editor-title"><form onSubmit={createEntry} className={styles.editorForm}><DialogHeader className={styles.editorHeader}><div><span className={styles.metaLabel}>Private entry</span><DialogTitle id="journal-editor-title">Write what is here.</DialogTitle><p>{entryDate(new Date().toISOString())}</p></div><button type="button" onClick={() => setShowCreate(false)} aria-label="Close journal editor"><X aria-hidden="true" /></button></DialogHeader>{actionError && <div className={styles.formError} role="alert">{actionError}</div>}<div className={styles.editorCanvas}><label className="sr-only" htmlFor="journal-title">Title optional</label><input id="journal-title" className={styles.titleInput} autoFocus placeholder="Untitled reflection" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><label className="sr-only" htmlFor="journal-content">Journal entry</label><textarea id="journal-content" className={styles.bodyInput} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Begin with what is true right now…" /></div>
        <div className={styles.editorMetadata}><fieldset><legend>Mood <span>optional</span></legend><div className={styles.moodChoices}>{MOOD_EMOJIS.filter((_, index) => index % 2 === 0).map((mood) => <button type="button" key={mood.score} aria-pressed={form.mood === mood.score} aria-label={`${mood.label}, ${mood.score} out of 10`} onClick={() => setForm({ ...form, mood: mood.score, moodEmoji: mood.emoji })}><span>{mood.emoji}</span><small>{mood.score}</small></button>)}</div></fieldset><fieldset><legend>Type</legend><div className={styles.typeChoices}>{ENTRY_TYPES.map((type) => <button type="button" key={type} aria-pressed={form.type === type} onClick={() => setForm({ ...form, type })}>{typeLabel(type)}</button>)}</div></fieldset><div><label htmlFor="journal-tags">Tags <span>comma-separated</span></label><Input id="journal-tags" placeholder="work, health, gratitude" value={tagInput} onChange={(event) => setTagInput(event.target.value)} /></div></div>
        <footer className={styles.editorFooter}><span>{form.content.trim() ? `${form.content.trim().split(/\s+/).length} words` : "Blank entry"}</span><div><button type="button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" disabled={saving || !form.content.trim()}>{saving ? "Saving…" : "Save entry"}</button></div></footer>
      </form></DialogContent>
    </Dialog>
  </div>;
}
