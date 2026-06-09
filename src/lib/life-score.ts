// LifeOS Life Score Calculator

import { getLifeScoreGrade } from "./utils";

export interface LifeScoreInput {
  habitsCompleted: number;
  habitsTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
  goalsProgress: number; // 0-100 average
  moodScore: number; // 1-10
  workedOut: boolean;
  journaled: boolean;
}

export interface LifeScoreResult {
  total: number;
  grade: string;
  breakdown: {
    habits: number;
    tasks: number;
    goals: number;
    mood: number;
    workout: number;
  };
  bonuses: string[];
}

/**
 * Calculate the daily Life Score (0-100)
 * 
 * Weights:
 * - Habits: 30%
 * - Tasks: 20%
 * - Goals: 15%
 * - Mood: 15%
 * - Workout: 10%
 * - Bonuses: 10%
 */
export function calculateLifeScore(input: LifeScoreInput): LifeScoreResult {
  const bonuses: string[] = [];

  // Habit score (0-100)
  const habitScore = input.habitsTotal > 0
    ? Math.round((input.habitsCompleted / input.habitsTotal) * 100)
    : 0;

  // Task score (0-100)
  const taskScore = input.tasksTotal > 0
    ? Math.round((input.tasksCompleted / input.tasksTotal) * 100)
    : 50; // No tasks = neutral

  // Goal score (0-100)
  const goalScore = input.goalsProgress;

  // Mood score (0-100)
  const moodScore = input.moodScore * 10;

  // Workout score (0 or 100)
  const workoutScore = input.workedOut ? 100 : 0;

  // Calculate weighted score
  let total = Math.round(
    habitScore * 0.30 +
    taskScore * 0.20 +
    goalScore * 0.15 +
    moodScore * 0.15 +
    workoutScore * 0.10
  );

  // Bonuses (up to 10 extra points)
  let bonusPoints = 0;

  if (habitScore === 100) {
    bonusPoints += 3;
    bonuses.push("Perfect habit day");
  }

  if (input.workedOut) {
    bonusPoints += 2;
    bonuses.push("Workout completed");
  }

  if (input.journaled) {
    bonusPoints += 2;
    bonuses.push("Journal entry written");
  }

  if (moodScore >= 80) {
    bonusPoints += 2;
    bonuses.push("Great mood");
  }

  if (taskScore === 100 && input.tasksTotal > 0) {
    bonusPoints += 1;
    bonuses.push("All tasks completed");
  }

  total += Math.min(bonusPoints, 10);
  total = Math.min(total, 100);

  const grade = getLifeScoreGrade(total);

  return {
    total,
    grade,
    breakdown: {
      habits: habitScore,
      tasks: taskScore,
      goals: goalScore,
      mood: moodScore,
      workout: workoutScore,
    },
    bonuses,
  };
}

/**
 * Calculate weekly average Life Score
 */
export function calculateWeeklyScore(dailyScores: number[]): number {
  if (!dailyScores.length) return 0;
  return Math.round(
    dailyScores.reduce((sum, s) => sum + s, 0) / dailyScores.length
  );
}
