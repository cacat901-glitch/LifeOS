/**
 * Novus AI Generators
 * Every higher-order AI feature lives here as a prompt-builder + fallback pair.
 * Nothing in this file imports a vendor SDK — all completions go through AIProvider.
 */
import type { DeepContext } from "./deep-context";

// Persona is inlined here (not imported) to keep this module free of circular deps.
const PERSONA = `You are Novus — an intelligent personal operating system and life companion.
You are perceptive, warm, honest, and deeply helpful. You write in flowing prose, not bullet lists.
You speak like a trusted life coach who has access to the person's real data.
Never invent data. Never be generic. Be specific to the numbers given.`;

// ════════════════════════════════════════════════════════════════
// WEEKLY REVIEW
// ════════════════════════════════════════════════════════════════

export interface WeeklyReviewResult {
  narrative: string;
  biggestWin: string;
  biggestWeakness: string;
  keyLesson: string;
  focusNextWeek: string;
  stats: { habitRate: number; workouts: number; avgMood: number; tasksCompleted: number; goalsProgress: number };
}

export function buildWeeklyReviewPrompt(ctx: DeepContext): string {
  return `Generate a personal weekly review for this person.

DATA FOR THIS WEEK:
- Name: ${ctx.user.name}
- Habits: completed ${ctx.habits.last7Rate}% of days (best streak: ${ctx.habits.bestStreak} days)
- Top habits: ${ctx.habits.list.slice(0,3).map(h => `${h.name} (${h.completionRate}%)`).join(", ") || "none"}
- Workouts this week: ${ctx.workout.last7Sessions}
- Average mood: ${ctx.mood.last7Avg}/10 (trend vs last 30 days: ${ctx.mood.trend})
- Tasks completed: ${ctx.tasks.completed} / ${ctx.tasks.total}
- Goals average progress: ${ctx.goals.avgProgress}%
- Journal entries this week: ${ctx.journal.last30Entries}
- Top mood factors: ${ctx.mood.topFactors.slice(0,3).join(", ") || "not tracked"}
${ctx.patterns.workoutMoodCorrelation ? "- Pattern: workout days show meaningfully higher mood" : ""}
${ctx.patterns.moodHabitCorrelation ? "- Pattern: habit completion correlates with better mood" : ""}

INSTRUCTIONS:
Write a weekly review with exactly these 5 sections (label each clearly):

NARRATIVE: 3-4 sentences of honest, warm reflection on the week. What stood out? What does the data say about how they're doing?

BIGGEST WIN: One specific sentence identifying the strongest thing from this week.

BIGGEST WEAKNESS: One honest sentence about the area that needs the most attention.

KEY LESSON: One insight about what this week taught them about themselves.

FOCUS FOR NEXT WEEK: One clear, specific priority to focus on next week and why.

Be specific to their data. Do not be generic. Do not use bullet points in the narrative.`;
}

export function parseWeeklyReview(raw: string, ctx: DeepContext): WeeklyReviewResult {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  return {
    narrative: extract("NARRATIVE") || raw.slice(0, 400),
    biggestWin: extract("BIGGEST WIN") || `Maintained a ${ctx.habits.bestStreak}-day streak.`,
    biggestWeakness: extract("BIGGEST WEAKNESS") || "Consistency could be improved.",
    keyLesson: extract("KEY LESSON") || "Small steps compound over time.",
    focusNextWeek: extract("FOCUS FOR NEXT WEEK") || (ctx.goals.topGoal ? `Move forward on "${ctx.goals.topGoal}".` : "Rebuild daily habits."),
    stats: {
      habitRate: ctx.habits.last7Rate,
      workouts: ctx.workout.last7Sessions,
      avgMood: ctx.mood.last7Avg,
      tasksCompleted: ctx.tasks.completed,
      goalsProgress: ctx.goals.avgProgress,
    },
  };
}

// ════════════════════════════════════════════════════════════════
// MONTHLY INSIGHTS
// ════════════════════════════════════════════════════════════════

export interface MonthlyInsightsResult {
  headline: string;
  narrative: string;
  milestones: string[];
  moodSummary: string;
  habitsSummary: string;
  workoutSummary: string;
  financeSummary: string;
  growthIndicator: string;
  nextMonthFocus: string;
}

export function buildMonthlyInsightsPrompt(ctx: DeepContext): string {
  return `Generate a comprehensive monthly life report for this person.

DATA FOR THIS MONTH:
- Name: ${ctx.user.name} (using Novus for ${ctx.user.joinedDaysAgo} days)
- Habit completion: ${ctx.habits.last30Rate}% consistency, ${ctx.habits.totalCompletions} total completions
- Best habit streak: ${ctx.habits.bestStreak} days
- Workouts: ${ctx.workout.last30Sessions} sessions, avg ${ctx.workout.avgDuration} min, total volume ${Math.round(ctx.workout.totalVolume)}kg
- Mood: avg ${ctx.mood.last30Avg}/10 (${ctx.mood.trend}), ${ctx.mood.entries} logs
- Top emotions: ${ctx.mood.topEmotions.slice(0,3).join(", ") || "not tracked"}
- Journal: ${ctx.journal.last30Entries} entries, avg ${ctx.journal.avgWordsPerEntry} words each
- Tasks completed: ${ctx.tasks.completed} / ${ctx.tasks.total} (${ctx.tasks.completionRate}%)
- Goals: ${ctx.goals.active} active at ${ctx.goals.avgProgress}% avg, ${ctx.goals.completed} completed
${ctx.finance.income30 || ctx.finance.expense30 ? `- Finance: +${Math.round(ctx.finance.income30)} income, -${Math.round(ctx.finance.expense30)} expenses, net: ${Math.round(ctx.finance.net30)}` : ""}
${ctx.patterns.workoutMoodCorrelation != null ? `- Workout↔Mood pattern: ${ctx.patterns.workoutMoodCorrelation ? "workouts boost mood" : "no clear correlation"}` : ""}

INSTRUCTIONS:
Write a monthly life report with these clearly labeled sections:

HEADLINE: One powerful sentence that captures the essence of this month (like a newspaper headline about their life).

NARRATIVE: 4-5 sentences of honest, reflective summary. What kind of month was this?

MILESTONES: List 2-3 specific achievements (format each on its own line starting with "•").

MOOD SUMMARY: 2 sentences on emotional patterns this month.

HABITS SUMMARY: 2 sentences on habit consistency and what it means.

WORKOUT SUMMARY: 2 sentences on physical consistency.

GROWTH INDICATOR: One sentence on whether they are growing, plateauing, or declining — and why.

NEXT MONTH FOCUS: One specific priority and one habit or action to support it.

Be deeply personal, specific, and honest. Speak like a coach reviewing the data together.`;
}

export function parseMonthlyInsights(raw: string, ctx: DeepContext): MonthlyInsightsResult {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z &]+:|$)`, "i");
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  const milestonesRaw = extract("MILESTONES");
  const milestones = milestonesRaw.split("\n").filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);
  return {
    headline: extract("HEADLINE") || `${ctx.user.name}'s Month in Review`,
    narrative: extract("NARRATIVE") || raw.slice(0, 500),
    milestones: milestones.length ? milestones : [`Completed ${ctx.habits.totalCompletions} habits`, `${ctx.workout.last30Sessions} workouts logged`],
    moodSummary: extract("MOOD SUMMARY") || `Average mood: ${ctx.mood.last30Avg}/10.`,
    habitsSummary: extract("HABITS SUMMARY") || `${ctx.habits.last30Rate}% consistency across all habits.`,
    workoutSummary: extract("WORKOUT SUMMARY") || `${ctx.workout.last30Sessions} sessions completed.`,
    financeSummary: extract("FINANCE") || "",
    growthIndicator: extract("GROWTH INDICATOR") || "Progress is steady.",
    nextMonthFocus: extract("NEXT MONTH FOCUS") || (ctx.goals.topGoal ? `Accelerate "${ctx.goals.topGoal}".` : "Build a stronger daily routine."),
  };
}

// ════════════════════════════════════════════════════════════════
// LIFE ANALYST — "Analyze My Life"
// ════════════════════════════════════════════════════════════════

export interface LifeAnalysisResult {
  overallAssessment: string;
  whatsWorking: string[];
  whatsNotWorking: string[];
  hiddenPatterns: string[];
  opportunities: string[];
  suggestedPriorities: string[];
  score: number; // 0-100 overall life health estimate
}

export function buildLifeAnalysisPrompt(ctx: DeepContext): string {
  return `You are performing a comprehensive life analysis for ${ctx.user.name}.
They have been using Novus for ${ctx.user.joinedDaysAgo} days.

COMPLETE LIFE DATA:
HABITS: ${ctx.habits.list.length} active habits, ${ctx.habits.avgCompletionRate}% avg completion, best streak ${ctx.habits.bestStreak} days
  Details: ${ctx.habits.list.map(h => `${h.name}: ${h.completionRate}% rate, ${h.streak}d streak`).join("; ") || "none"}

TASKS: ${ctx.tasks.completionRate}% completion rate, ${ctx.tasks.overdue} overdue

GOALS: ${ctx.goals.active} active goals at ${ctx.goals.avgProgress}% avg progress
  List: ${ctx.goals.list.map(g => `"${g.title}" (${g.progress}%)`).join("; ") || "none"}

MOOD: ${ctx.mood.avgScore}/10 average, trend ${ctx.mood.trend}
  Top emotions: ${ctx.mood.topEmotions.join(", ") || "insufficient data"}
  Top factors: ${ctx.mood.topFactors.join(", ") || "insufficient data"}

PHYSICAL: ${ctx.workout.totalSessions} total workouts, ${ctx.workout.last30Sessions} this month, ${ctx.workout.isConsistent ? "consistent" : "inconsistent"}

JOURNAL: ${ctx.journal.totalEntries} entries, ${ctx.journal.totalWords} words total
  Recent reflections: ${ctx.journal.recentContent.slice(0, 400) || "no recent entries"}

PATTERNS DETECTED:
${ctx.patterns.workoutMoodCorrelation != null ? `- Workout→Mood: ${ctx.patterns.workoutMoodCorrelation ? "POSITIVE (workouts improve mood)" : "weak correlation"}` : "- Workout→Mood: insufficient data"}
${ctx.patterns.moodHabitCorrelation != null ? `- Habits→Mood: ${ctx.patterns.moodHabitCorrelation ? "POSITIVE (habits improve mood)" : "weak correlation"}` : "- Habits→Mood: insufficient data"}

FINANCE: net this month ${Math.round(ctx.finance.net30)}, top expense: ${ctx.finance.topExpenseCategory || "unknown"}

INSTRUCTIONS:
Analyze this person's life across all dimensions and provide a structured report.

OVERALL ASSESSMENT: 3-4 sentences that honestly capture where this person is in their life right now. Be direct but compassionate.

WHAT'S WORKING: List 3-4 specific things going well (start each with "•").

WHAT'S NOT WORKING: List 3-4 honest challenges or gaps (start each with "•").

HIDDEN PATTERNS: List 2-3 non-obvious insights from the data — correlations, cycles, or behaviors they may not have noticed (start each with "•").

OPPORTUNITIES: List 3 concrete opportunities for meaningful improvement (start each with "•").

SUGGESTED PRIORITIES: List the 3 highest-leverage priorities, ranked by impact (start each with "1.", "2.", "3.").

LIFE HEALTH SCORE: Give a score from 0-100 and one sentence explaining it.

Be deeply insightful, specific, and genuinely useful. This should feel like getting a session with a world-class life coach.`;
}

export function parseLifeAnalysis(raw: string, ctx: DeepContext): LifeAnalysisResult {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z ']+:|$)`, "i");
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  const parseList = (text: string): string[] =>
    text.split("\n").filter(l => l.trim()).map(l => l.replace(/^[•\-*\d.]\s*/, "").trim()).filter(Boolean);

  const scoreMatch = raw.match(/life health score[:\s]+(\d+)/i) || raw.match(/score[:\s]+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.round((ctx.habits.avgCompletionRate + ctx.goals.avgProgress + (ctx.mood.avgScore * 10)) / 3);

  return {
    overallAssessment: extract("OVERALL ASSESSMENT") || raw.slice(0, 400),
    whatsWorking: parseList(extract("WHAT'S WORKING") || extract("WHATS WORKING")).slice(0, 4),
    whatsNotWorking: parseList(extract("WHAT'S NOT WORKING") || extract("WHATS NOT WORKING")).slice(0, 4),
    hiddenPatterns: parseList(extract("HIDDEN PATTERNS")).slice(0, 3),
    opportunities: parseList(extract("OPPORTUNITIES")).slice(0, 3),
    suggestedPriorities: parseList(extract("SUGGESTED PRIORITIES")).slice(0, 3),
    score: Math.min(100, Math.max(0, score)),
  };
}

// ════════════════════════════════════════════════════════════════
// PATTERN DETECTION
// ════════════════════════════════════════════════════════════════

export interface PatternReport {
  patterns: Array<{ title: string; description: string; actionable: string; type: "positive" | "warning" | "neutral" }>;
}

export function buildPatternPrompt(ctx: DeepContext): string {
  return `Analyze this person's behavioral data and identify meaningful patterns.

DATA:
- Habits (${ctx.habits.last30Rate}% consistency): ${ctx.habits.list.map(h => h.name).join(", ") || "none"}
- Mood average: ${ctx.mood.avgScore}/10, trend: ${ctx.mood.trend}
- Workout frequency: ${ctx.workout.last7Sessions}/week
- Journal frequency: ${ctx.journal.last30Entries} entries/30 days
- Task completion: ${ctx.tasks.completionRate}%
- Top mood factors: ${ctx.mood.topFactors.join(", ") || "unknown"}
- Top emotions: ${ctx.mood.topEmotions.join(", ") || "unknown"}
${ctx.patterns.workoutMoodCorrelation != null ? `- Workout days have ${ctx.patterns.workoutMoodCorrelation ? "measurably higher" : "similar"} mood scores` : ""}
${ctx.patterns.moodHabitCorrelation != null ? `- Habit completion days have ${ctx.patterns.moodHabitCorrelation ? "measurably higher" : "similar"} mood scores` : ""}

Identify 4-6 meaningful behavioral patterns. For each write:
PATTERN: [short title]
DESCRIPTION: [one sentence explaining what the data shows]
ACTIONABLE: [one sentence on what to do with this insight]
TYPE: [positive / warning / neutral]

Focus on patterns that are actionable and genuinely insightful. Avoid generic observations.`;
}

export function parsePatterns(raw: string): PatternReport {
  const blocks = raw.split(/(?=PATTERN:)/i).filter(b => b.includes("PATTERN:"));
  const patterns = blocks.map(b => {
    const title = b.match(/PATTERN:\s*(.+)/i)?.[1]?.trim() || "Pattern detected";
    const description = b.match(/DESCRIPTION:\s*(.+)/i)?.[1]?.trim() || "";
    const actionable = b.match(/ACTIONABLE:\s*(.+)/i)?.[1]?.trim() || "";
    const typeRaw = b.match(/TYPE:\s*(.+)/i)?.[1]?.trim().toLowerCase() || "neutral";
    const type: "positive" | "warning" | "neutral" = typeRaw.includes("pos") ? "positive" : typeRaw.includes("warn") ? "warning" : "neutral";
    return { title, description, actionable, type };
  });
  return { patterns: patterns.length ? patterns : [{ title: "Not enough data yet", description: "Keep tracking to surface meaningful patterns.", actionable: "Continue logging habits, mood, and workouts.", type: "neutral" }] };
}

// ════════════════════════════════════════════════════════════════
// GOAL COACH
// ════════════════════════════════════════════════════════════════

export interface GoalCoachResult {
  assessment: string;
  suggestedMilestones: Array<{ title: string; timeframe: string; description: string }>;
  recommendedHabits: string[];
  recommendedActions: string[];
  estimatedTimeline: string;
  motivationalNote: string;
}

export function buildGoalCoachPrompt(goalTitle: string, goalDescription: string, currentProgress: number, ctx: DeepContext): string {
  return `You are a goal coach helping someone achieve a specific goal.

GOAL: "${goalTitle}"
DESCRIPTION: ${goalDescription || "no description provided"}
CURRENT PROGRESS: ${currentProgress}%

PERSON CONTEXT:
- Already tracking ${ctx.habits.list.length} habits (${ctx.habits.avgCompletionRate}% completion rate)
- ${ctx.workout.last7Sessions} workouts this week
- Mood: ${ctx.mood.avgScore}/10 average
- Active goals: ${ctx.goals.active} (avg ${ctx.goals.avgProgress}% progress)

Create a concrete coaching plan for this goal.

ASSESSMENT: 2 sentences on what this goal means and what it will take.

MILESTONES: List 4-5 milestone steps. For each write:
MILESTONE: [title]
TIMEFRAME: [e.g. "Week 2", "Month 1", "Month 3"]
DESCRIPTION: [one sentence on what this milestone looks like]

RECOMMENDED HABITS: List 3 specific daily/weekly habits that directly support this goal (start each with "•").

RECOMMENDED ACTIONS: List 3 concrete first steps to take this week (start each with "•").

ESTIMATED TIMELINE: One sentence with a realistic timeframe based on the goal.

MOTIVATIONAL NOTE: One sentence of genuine encouragement grounded in their current momentum.`;
}

export function parseGoalCoach(raw: string): GoalCoachResult {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
    return raw.match(re)?.[1]?.trim() || "";
  };

  const milestoneBlocks = raw.split(/(?=MILESTONE:)/i).filter(b => b.includes("MILESTONE:"));
  const milestones = milestoneBlocks.map(b => ({
    title: b.match(/MILESTONE:\s*(.+)/i)?.[1]?.trim() || "",
    timeframe: b.match(/TIMEFRAME:\s*(.+)/i)?.[1]?.trim() || "",
    description: b.match(/DESCRIPTION:\s*(.+)/i)?.[1]?.trim() || "",
  })).filter(m => m.title);

  const parseList = (text: string): string[] =>
    text.split("\n").filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);

  return {
    assessment: extract("ASSESSMENT") || "This is a meaningful goal worth pursuing with intention.",
    suggestedMilestones: milestones.length ? milestones : [{ title: "Get started", timeframe: "This week", description: "Take the first concrete step." }],
    recommendedHabits: parseList(extract("RECOMMENDED HABITS")).slice(0, 3),
    recommendedActions: parseList(extract("RECOMMENDED ACTIONS")).slice(0, 3),
    estimatedTimeline: extract("ESTIMATED TIMELINE") || "Timeline depends on consistency.",
    motivationalNote: extract("MOTIVATIONAL NOTE") || "Every action you take compounds over time.",
  };
}

// ════════════════════════════════════════════════════════════════
// JOURNAL ANALYSIS
// ════════════════════════════════════════════════════════════════

export interface JournalAnalysisResult {
  themes: string[];
  emotionalTrends: string;
  commonConcerns: string[];
  growthIndicators: string[];
  reflection: string;
}

export function buildJournalAnalysisPrompt(ctx: DeepContext): string {
  if (!ctx.journal.recentContent) return "";
  return `Analyze this person's recent journal entries to surface themes, patterns, and growth indicators.

JOURNAL ENTRIES (most recent):
${ctx.journal.recentContent}

STATS: ${ctx.journal.totalEntries} total entries, avg ${ctx.journal.avgWordsPerEntry} words each, avg mood ${ctx.journal.avgMood}/10

Analyze and provide:

RECURRING THEMES: List 4-5 main topics or themes appearing across entries (start each with "•").

EMOTIONAL TRENDS: 2 sentences on the emotional character of their recent writing.

COMMON CONCERNS: List 3 things they seem most preoccupied with (start each with "•").

GROWTH INDICATORS: List 2-3 signs of personal development visible in their writing (start each with "•").

REFLECTION: 2-3 sentences of synthesis — what does this person's journal reveal about where they are right now?

Be insightful, specific, and respectful. This is deeply personal data.`;
}

export function parseJournalAnalysis(raw: string): JournalAnalysisResult {
  const extract = (label: string): string => {
    const re = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
    return raw.match(re)?.[1]?.trim() || "";
  };
  const parseList = (text: string): string[] =>
    text.split("\n").filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);

  return {
    themes: parseList(extract("RECURRING THEMES")).slice(0, 5),
    emotionalTrends: extract("EMOTIONAL TRENDS") || "Emotional patterns detected.",
    commonConcerns: parseList(extract("COMMON CONCERNS")).slice(0, 3),
    growthIndicators: parseList(extract("GROWTH INDICATORS")).slice(0, 3),
    reflection: extract("REFLECTION") || "Your journal reflects a person actively working on themselves.",
  };
}

// ════════════════════════════════════════════════════════════════
// PREDICTIVE INSIGHTS
// ════════════════════════════════════════════════════════════════

export interface PredictiveInsight {
  type: "warning" | "opportunity" | "celebration";
  title: string;
  message: string;
  action: string;
}

export function generatePredictiveInsights(ctx: DeepContext): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  // Streak at risk
  if (ctx.habits.bestStreak >= 5 && ctx.habits.last7Rate < 50) {
    insights.push({
      type: "warning",
      title: "Streak at risk",
      message: `Your ${ctx.habits.bestStreak}-day streak could be in danger — consistency has dropped to ${ctx.habits.last7Rate}% this week.`,
      action: "Complete at least one habit today to protect your momentum.",
    });
  }

  // Declining mood
  if (ctx.mood.trend === "declining" && ctx.mood.last7Avg < 6) {
    insights.push({
      type: "warning",
      title: "Mood declining",
      message: `Your average mood has dropped to ${ctx.mood.last7Avg}/10 this week. ${ctx.patterns.workoutMoodCorrelation ? "Historically, working out tends to lift your mood." : ""}`,
      action: ctx.patterns.workoutMoodCorrelation ? "Schedule a workout today." : "Log your mood and journal to surface what's driving this.",
    });
  }

  // Workout gap
  if (ctx.workout.last7Sessions === 0 && ctx.workout.totalSessions > 3) {
    insights.push({
      type: "warning",
      title: "Workout gap detected",
      message: `You haven't logged a workout this week. ${ctx.patterns.workoutMoodCorrelation ? "Your data shows workouts improve your mood by a noticeable margin." : "Regular training supports every other area of your life."}`,
      action: "Even a 20-minute session breaks the pattern.",
    });
  }

  // Goal stalling
  const stallingGoals = ctx.goals.list.filter(g => g.progress < 20 && g.targetDate);
  if (stallingGoals.length > 0) {
    insights.push({
      type: "warning",
      title: "Goal falling behind",
      message: `"${stallingGoals[0].title}" is at ${stallingGoals[0].progress}% with a deadline of ${stallingGoals[0].targetDate}.`,
      action: "Add one concrete task or habit that moves this goal forward today.",
    });
  }

  // Positive momentum
  if (ctx.habits.last7Rate >= 85) {
    insights.push({
      type: "celebration",
      title: "Exceptional consistency",
      message: `You've completed ${ctx.habits.last7Rate}% of your habits this week. That's genuinely elite-level consistency.`,
      action: "Keep the rhythm — this is when habits start becoming effortless.",
    });
  }

  // Mood improving
  if (ctx.mood.trend === "improving" && ctx.mood.last7Avg >= 7.5) {
    insights.push({
      type: "celebration",
      title: "Mood on the rise",
      message: `Your mood average is ${ctx.mood.last7Avg}/10 this week — up from ${ctx.mood.last30Avg} over the past month.`,
      action: "Note what you did differently this week. Repeat it.",
    });
  }

  // Goal progress opportunity
  if (ctx.goals.avgProgress >= 70 && ctx.goals.active > 0) {
    insights.push({
      type: "opportunity",
      title: "Goals within reach",
      message: `Your active goals are averaging ${ctx.goals.avgProgress}% completion. You're closer to finishing than starting.`,
      action: `Push on "${ctx.goals.topGoal}" — one focused session could move the needle significantly.`,
    });
  }

  // Journal prompt
  if (ctx.journal.last30Entries < 3 && ctx.journal.totalEntries > 5) {
    insights.push({
      type: "opportunity",
      title: "Journal momentum fading",
      message: "You've written only 3 entries this month. Your journal is one of your best tools for self-understanding.",
      action: "5 minutes of writing tonight will help you process what's happening.",
    });
  }

  return insights.slice(0, 4); // max 4 at a time
}

// ════════════════════════════════════════════════════════════════
// LIFE MEMORY — "How have I changed?"
// ════════════════════════════════════════════════════════════════

export function buildLifeMemoryPrompt(question: string, ctx: DeepContext): string {
  return `Someone is asking their personal life companion a question about their journey over time.

QUESTION: "${question}"

THEIR COMPLETE HISTORY:
- Using Novus for: ${ctx.user.joinedDaysAgo} days
- Habits: ${ctx.habits.list.length} tracked, best streak ever ${ctx.habits.bestStreak} days, total completions ${ctx.habits.totalCompletions}
- Goals: ${ctx.goals.completed} completed, ${ctx.goals.active} still active
  Active: ${ctx.goals.list.map(g => `"${g.title}" at ${g.progress}%`).join("; ") || "none"}
- Workouts: ${ctx.workout.totalSessions} total sessions
- Mood: avg ${ctx.mood.avgScore}/10 over 30 days, currently ${ctx.mood.trend}
- Journal: ${ctx.journal.totalEntries} entries, ${ctx.journal.totalWords} words written
  Recent themes: ${ctx.journal.recentContent.slice(0, 200) || "no recent entries"}
- Tasks: ${ctx.tasks.completionRate}% completion rate
${ctx.goals.completed > 0 ? `- Has completed ${ctx.goals.completed} goals` : ""}

Answer their question directly, warmly, and with real insight drawn from their data.
Speak like a companion who has watched them grow. Be honest. Be specific. 2-4 sentences.
If the data is insufficient to answer fully, say so and suggest what would help.`;
}

// ════════════════════════════════════════════════════════════════
// NATURAL LANGUAGE ACTION PARSER
// ════════════════════════════════════════════════════════════════

export interface NLAction {
  type: "CREATE_GOAL" | "CREATE_HABIT" | "CREATE_TASK" | "CREATE_PLAN" | "UNKNOWN";
  extracted: {
    title?: string;
    description?: string;
    targetDate?: string;
    habits?: string[];
    tasks?: string[];
    milestones?: string[];
  };
  confirmation: string;
}

export function buildNLActionPrompt(input: string): string {
  return `Extract actionable items from this natural language request.

USER INPUT: "${input}"

Determine what the user wants to create and extract the details.

Respond in this exact JSON format:
{
  "type": "CREATE_GOAL" | "CREATE_HABIT" | "CREATE_TASK" | "CREATE_PLAN",
  "extracted": {
    "title": "clear title",
    "description": "brief description",
    "targetDate": "YYYY-MM-DD or null",
    "habits": ["habit 1", "habit 2"] (if applicable),
    "tasks": ["task 1", "task 2"] (if applicable, max 5),
    "milestones": ["milestone 1", "milestone 2"] (if applicable, max 5)
  },
  "confirmation": "I'll create [X]. Here's what I've set up..."
}

For goals: extract what they want to achieve, when by, and what habits/milestones would support it.
For habits: extract the specific habit, frequency if mentioned.
For tasks: extract the action item.
For plans: create a goal with supporting habits and milestones.

Be practical. Create what they asked for, not more.`;
}

export function parseNLAction(raw: string): NLAction {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as NLAction;
    }
  } catch { /* fall through */ }
  return {
    type: "UNKNOWN",
    extracted: { title: "New item", description: "" },
    confirmation: "I understood your request. Let me help you set this up.",
  };
}
