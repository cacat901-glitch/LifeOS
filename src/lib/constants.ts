// Novus Constants

export const APP_NAME = "Novus";
export const APP_DESCRIPTION = "Your personal operating system";
export const APP_TAGLINE = "Your personal operating system.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Navigation
export const NAV_ITEMS = [
  { name: "Home", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Journal", href: "/journal", icon: "BookOpen" },
  { name: "Habits", href: "/habits", icon: "CheckCircle2" },
  { name: "Tasks", href: "/tasks", icon: "ListTodo" },
  { name: "Goals", href: "/goals", icon: "Target" },
  { name: "Projects", href: "/projects", icon: "FolderKanban" },
  { name: "Finance", href: "/finance", icon: "Wallet" },
  { name: "Workout", href: "/workout", icon: "Dumbbell" },
  { name: "Mood", href: "/mood", icon: "Heart" },
  { name: "Timeline", href: "/timeline", icon: "Clock" },
  { name: "Statistics", href: "/statistics", icon: "BarChart3" },
  { name: "Settings", href: "/settings", icon: "Settings" },
] as const;

// Moods
export const MOOD_EMOJIS = [
  { score: 1, emoji: "😢", label: "Terrible" },
  { score: 2, emoji: "😞", label: "Very Bad" },
  { score: 3, emoji: "😔", label: "Bad" },
  { score: 4, emoji: "😕", label: "Not Great" },
  { score: 5, emoji: "😐", label: "Okay" },
  { score: 6, emoji: "🙂", label: "Fine" },
  { score: 7, emoji: "😊", label: "Good" },
  { score: 8, emoji: "😄", label: "Great" },
  { score: 9, emoji: "😁", label: "Amazing" },
  { score: 10, emoji: "🤩", label: "Incredible" },
] as const;

export const EMOTIONS = [
  "Happy", "Calm", "Focused", "Energetic", "Grateful",
  "Excited", "Content", "Motivated", "Proud", "Hopeful",
  "Anxious", "Stressed", "Sad", "Frustrated", "Angry",
  "Tired", "Bored", "Lonely", "Overwhelmed", "Confused",
] as const;

export const MOOD_FACTORS = [
  "Sleep", "Exercise", "Work", "Relationships", "Weather",
  "Food", "Social", "Meditation", "Nature", "Creativity",
  "Health", "Finance", "Learning", "Achievement", "Rest",
] as const;

// Habit Categories
export const DEFAULT_HABIT_CATEGORIES = [
  { name: "Health", color: "#10b981", icon: "Heart" },
  { name: "Fitness", color: "#f59e0b", icon: "Dumbbell" },
  { name: "Mindfulness", color: "#8b5cf6", icon: "Brain" },
  { name: "Learning", color: "#3b82f6", icon: "BookOpen" },
  { name: "Productivity", color: "#ec4899", icon: "Zap" },
  { name: "Social", color: "#06b6d4", icon: "Users" },
] as const;

// Exercise Categories  
export const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Forearms", "Core", "Quads", "Hamstrings", "Glutes", "Calves",
] as const;

export const EQUIPMENT = [
  "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight",
  "Kettlebell", "Resistance Band", "Smith Machine", "EZ Bar", "Trap Bar",
] as const;

// XP System
export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  TASK_COMPLETE: 15,
  GOAL_MILESTONE: 50,
  GOAL_COMPLETE: 200,
  WORKOUT_COMPLETE: 25,
  JOURNAL_ENTRY: 15,
  MOOD_LOG: 5,
  STREAK_7: 100,
  STREAK_30: 500,
  STREAK_100: 2000,
  PERSONAL_RECORD: 75,
} as const;

export const LEVEL_TITLES = [
  "Beginner",          // 1
  "Starter",           // 2
  "Learner",           // 3
  "Builder",           // 4
  "Explorer",          // 5
  "Achiever",          // 6
  "Champion",          // 7
  "Master",            // 8
  "Expert",            // 9
  "Legend",            // 10
  "Transcendent",      // 11+
] as const;
