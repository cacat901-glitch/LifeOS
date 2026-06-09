"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOOD_EMOJIS, EMOTIONS, MOOD_FACTORS } from "@/lib/constants";

const moodHistory = [
  { date: "Mon", score: 7, emoji: "😊" },
  { date: "Tue", score: 8, emoji: "😄" },
  { date: "Wed", score: 6, emoji: "🙂" },
  { date: "Thu", score: 8, emoji: "😄" },
  { date: "Fri", score: 9, emoji: "😁" },
  { date: "Sat", score: 7, emoji: "😊" },
  { date: "Sun", score: 8, emoji: "😄" },
];

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mood</h2>
          <p className="text-sm text-muted-foreground">Track how you&apos;re feeling and discover patterns</p>
        </div>
        <Badge variant="secondary">🔥 22 day streak</Badge>
      </div>

      {/* Log Today's Mood */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Score */}
          <div className="flex justify-center gap-2 flex-wrap">
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  selectedMood === mood.score
                    ? "bg-primary/10 ring-2 ring-primary scale-110"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Emotions */}
          {selectedMood && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-3">What emotions are you feeling?</h4>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedEmotions.includes(emotion)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factors */}
              <div>
                <h4 className="text-sm font-medium mb-3">What&apos;s influencing your mood?</h4>
                <div className="flex flex-wrap gap-2">
                  {MOOD_FACTORS.map((factor) => (
                    <button
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedFactors.includes(factor)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <h4 className="text-sm font-medium mb-2">Any notes? (optional)</h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How was your day..."
                  className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button className="w-full">Save Mood Entry</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 justify-between">
            {moodHistory.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xl">{day.emoji}</span>
                <div className="w-full bg-primary/20 rounded-full overflow-hidden h-20 flex items-end">
                  <div
                    className="w-full bg-primary rounded-full transition-all"
                    style={{ height: `${day.score * 10}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
                <span className="text-xs font-medium">{day.score}/10</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Weekly Average</div>
            <div className="text-3xl font-bold">7.6</div>
            <div className="text-xs text-green-500 mt-1">↑ 0.4 from last week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Most Common Emotion</div>
            <div className="text-3xl font-bold">😊</div>
            <div className="text-xs text-muted-foreground mt-1">Happy (62% of days)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Top Factor</div>
            <div className="text-lg font-bold">Exercise</div>
            <div className="text-xs text-muted-foreground mt-1">+1.2 avg mood on workout days</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span>✨</span>
            <h3 className="font-semibold">AI Mood Insight</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your mood is strongly correlated with exercise — days you work out average 1.2 points higher.
            You tend to feel best on Fridays and experience slight dips on Wednesdays. Getting 7+ hours of
            sleep consistently appears to be the strongest predictor of a good mood day. Consider scheduling
            rest or light activity on Wednesdays.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
