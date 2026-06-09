"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const sampleEntries = [
  {
    id: "1",
    date: "June 9, 2026",
    title: "Productive Monday",
    content: "Had an incredibly productive day. Woke up at 6am, meditated for 20 minutes, and dove straight into my project. The morning energy was different today — focused and clear. Met with the team in the afternoon and we made great progress on the roadmap...",
    mood: 8,
    moodEmoji: "😊",
    tags: ["productivity", "work", "growth"],
    wordCount: 342,
  },
  {
    id: "2",
    date: "June 8, 2026",
    title: "Sunday Reflections",
    content: "Spent the day reflecting on the past week. I've been consistent with my habits which feels really good. The gym session in the morning was challenging but I pushed through...",
    mood: 7,
    moodEmoji: "🙂",
    tags: ["reflection", "rest", "gratitude"],
    wordCount: 256,
  },
  {
    id: "3",
    date: "June 7, 2026",
    title: "New Personal Record",
    content: "Hit a new PR on bench press today — 100kg! Been working towards this for months. The progressive overload approach is clearly working...",
    mood: 9,
    moodEmoji: "😁",
    tags: ["fitness", "achievement", "milestone"],
    wordCount: 189,
  },
  {
    id: "4",
    date: "June 6, 2026",
    title: "Quiet Day",
    content: "Not much happened today. Worked from home, kept things simple. Sometimes the quiet days are exactly what you need...",
    mood: 6,
    moodEmoji: "😐",
    tags: ["rest", "routine"],
    wordCount: 124,
  },
];

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<typeof sampleEntries[0] | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Journal</h2>
          <p className="text-sm text-muted-foreground">Your thoughts, reflections, and daily entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Calendar View</Button>
          <Button size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">156</div>
            <div className="text-xs text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">🔥 8</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">42.5k</div>
            <div className="text-xs text-muted-foreground">Total Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">7.4</div>
            <div className="text-xs text-muted-foreground">Avg Mood</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search journal entries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      {/* Entries List */}
      <div className="space-y-4">
        {sampleEntries.map((entry) => (
          <Card
            key={entry.id}
            className="card-hover cursor-pointer"
            onClick={() => setSelectedEntry(entry)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{entry.moodEmoji}</span>
                    <h3 className="font-semibold">{entry.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                <div className="text-xs text-muted-foreground">{entry.wordCount} words</div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {entry.content}
              </p>
              <div className="flex gap-2 mt-3">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Write Prompt */}
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <span className="text-3xl mb-3 block">✍️</span>
          <h3 className="font-semibold mb-1">What&apos;s on your mind?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Take a moment to reflect on your day.
          </p>
          <Button>Write Today&apos;s Entry</Button>
        </CardContent>
      </Card>
    </div>
  );
}
