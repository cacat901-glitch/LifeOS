// LifeOS Gamification Engine

import { XP_REWARDS, LEVEL_TITLES } from "./constants";
import { calculateXPForLevel } from "./utils";

export interface XPEvent {
  type: keyof typeof XP_REWARDS;
  amount: number;
  description: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpForNextLevel: number;
  progress: number; // 0-100
  totalXP: number;
}

export function calculateLevel(totalXP: number): LevelInfo {
  let level = 1;
  let xpRemaining = totalXP;

  while (true) {
    const xpNeeded = calculateXPForLevel(level);
    if (xpRemaining < xpNeeded) {
      return {
        level,
        title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
        currentXP: xpRemaining,
        xpForNextLevel: xpNeeded,
        progress: Math.round((xpRemaining / xpNeeded) * 100),
        totalXP,
      };
    }
    xpRemaining -= xpNeeded;
    level++;
  }
}

export function getXPReward(type: keyof typeof XP_REWARDS): XPEvent {
  const amount = XP_REWARDS[type];
  const descriptions: Record<string, string> = {
    HABIT_COMPLETE: "Completed a habit",
    TASK_COMPLETE: "Completed a task",
    GOAL_MILESTONE: "Reached a goal milestone",
    GOAL_COMPLETE: "Completed a goal",
    WORKOUT_COMPLETE: "Finished a workout",
    JOURNAL_ENTRY: "Wrote a journal entry",
    MOOD_LOG: "Logged your mood",
    STREAK_7: "7-day streak achieved",
    STREAK_30: "30-day streak achieved",
    STREAK_100: "100-day streak achieved",
    PERSONAL_RECORD: "New personal record",
  };

  return {
    type,
    amount,
    description: descriptions[type] || "Unknown action",
  };
}

// Default achievements that get seeded
export const DEFAULT_ACHIEVEMENTS = [
  // Streaks
  { name: "First Week", description: "Maintain a 7-day streak", icon: "🔥", category: "STREAKS", rarity: "COMMON", xpReward: 100, condition: '{"type":"streak","value":7}' },
  { name: "Monthly Master", description: "Maintain a 30-day streak", icon: "💎", category: "STREAKS", rarity: "RARE", xpReward: 500, condition: '{"type":"streak","value":30}' },
  { name: "Century Club", description: "Maintain a 100-day streak", icon: "👑", category: "STREAKS", rarity: "LEGENDARY", xpReward: 2000, condition: '{"type":"streak","value":100}' },
  
  // Habits
  { name: "Habit Builder", description: "Complete 50 habit entries", icon: "✅", category: "HABITS", rarity: "COMMON", xpReward: 100, condition: '{"type":"habit_completions","value":50}' },
  { name: "Routine Master", description: "Complete 500 habit entries", icon: "⚡", category: "HABITS", rarity: "EPIC", xpReward: 1000, condition: '{"type":"habit_completions","value":500}' },
  
  // Journal
  { name: "First Words", description: "Write your first journal entry", icon: "📝", category: "JOURNAL", rarity: "COMMON", xpReward: 25, condition: '{"type":"journal_count","value":1}' },
  { name: "Prolific Writer", description: "Write 100 journal entries", icon: "📖", category: "JOURNAL", rarity: "RARE", xpReward: 500, condition: '{"type":"journal_count","value":100}' },
  
  // Workout
  { name: "Iron Will", description: "Complete 25 workout sessions", icon: "💪", category: "WORKOUT", rarity: "UNCOMMON", xpReward: 250, condition: '{"type":"workout_count","value":25}' },
  { name: "PR Hunter", description: "Set 10 personal records", icon: "🏆", category: "WORKOUT", rarity: "RARE", xpReward: 500, condition: '{"type":"pr_count","value":10}' },
  
  // Goals
  { name: "Goal Setter", description: "Create your first goal", icon: "🎯", category: "GOALS", rarity: "COMMON", xpReward: 50, condition: '{"type":"goal_count","value":1}' },
  { name: "Achiever", description: "Complete 5 goals", icon: "🌟", category: "GOALS", rarity: "EPIC", xpReward: 1000, condition: '{"type":"goals_completed","value":5}' },
  
  // Mood
  { name: "Self-Aware", description: "Log mood for 30 consecutive days", icon: "💜", category: "MOOD", rarity: "UNCOMMON", xpReward: 200, condition: '{"type":"mood_streak","value":30}' },
  
  // General
  { name: "Life Explorer", description: "Use all features at least once", icon: "🌍", category: "GENERAL", rarity: "UNCOMMON", xpReward: 250, condition: '{"type":"all_features","value":1}' },
  { name: "Level 10", description: "Reach Level 10", icon: "⚡", category: "GENERAL", rarity: "LEGENDARY", xpReward: 0, condition: '{"type":"level","value":10}' },
];
