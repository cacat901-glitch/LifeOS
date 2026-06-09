// LifeOS Type Definitions

import { type DefaultSession } from "next-auth";

// Extend NextAuth session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Dashboard
export interface DashboardData {
  greeting: string;
  briefing: AIBriefing;
  habits: HabitSummary;
  tasks: TaskSummary;
  goals: GoalSummary;
  mood: MoodSummary;
  lifeScore: LifeScoreData;
  streaks: StreakData;
  recentActivity: ActivityItem[];
}

export interface AIBriefing {
  message: string;
  highlights: string[];
  mainGoal: string;
  suggestions: string[];
}

export interface HabitSummary {
  todayTotal: number;
  todayCompleted: number;
  weeklyRate: number;
  currentStreak: number;
  habits: HabitItem[];
}

export interface HabitItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCompleted: boolean;
  streak: number;
}

export interface TaskSummary {
  todayTotal: number;
  todayCompleted: number;
  overdue: number;
  tasks: TaskItem[];
}

export interface TaskItem {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  dueDate?: string;
}

export interface GoalSummary {
  activeGoals: number;
  progress: number;
  goals: GoalItem[];
}

export interface GoalItem {
  id: string;
  title: string;
  progress: number;
  targetDate?: string;
  color: string;
}

export interface MoodSummary {
  todayMood?: number;
  todayEmoji?: string;
  weekAverage: number;
  trend: "up" | "down" | "stable";
}

export interface LifeScoreData {
  today: number;
  weekAverage: number;
  grade: string;
  breakdown: {
    habits: number;
    tasks: number;
    goals: number;
    mood: number;
    workout: number;
  };
}

export interface StreakData {
  habits: number;
  journal: number;
  workout: number;
  mood: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  icon: string;
}

// Workout Types
export interface WorkoutSessionData {
  id: string;
  name: string;
  duration: number;
  totalVolume: number;
  exercises: WorkoutExerciseData[];
}

export interface WorkoutExerciseData {
  id: string;
  name: string;
  sets: WorkoutSetData[];
}

export interface WorkoutSetData {
  setNumber: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  isPersonalRecord: boolean;
}

// Statistics Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface StatisticsOverview {
  habits: { rate: number; trend: number };
  tasks: { completed: number; trend: number };
  goals: { progress: number; trend: number };
  mood: { average: number; trend: number };
  workout: { sessions: number; trend: number };
  lifeScore: { average: number; trend: number };
}
