/**
 * Novus Intelligence Engine
 *
 * Higher-order "proactive AI" features built on top of DeepContext.
 * Every generator is DETERMINISTIC-FIRST: it produces meaningful output
 * from the user's real data with no AI provider required. Prompt builders
 * + parsers are provided so a configured provider (Groq/Gemini) can enrich
 * the same shapes, but the app never depends on one.
 */
import type { DeepContext } from "./deep-context";

// ════════════════════════════════════════════════════════════════
// 1. DISCOVERIES — unsolicited insights
// ════════════════════════════════════════════════════════════════

export interface GeneratedDiscovery {
  signature: string; // stable dedupe key
  title: string;
  explanation: string;
  confidence: number; // 0-100
  evidence: string[];
  modules: string[];
}

export function generateDiscoveries(ctx: DeepContext): GeneratedDiscovery[] {
  const d: GeneratedDiscovery[] = [];
  const m = ctx.mood;
  const h = ctx.habits;

  // Workout → mood
  if (ctx.patterns.workoutMoodCorrelation) {
    d.push({
      signature: "workout-mood",
      title: "Your mood is higher on workout days",
      explanation: "Across your recent logs, the days you trained came with noticeably better mood scores. Movement looks like one of your strongest mood levers.",
      confidence: 82,
      evidence: [
        `${ctx.workout.last30Sessions} workouts logged in the last 30 days`,
        `Average mood ${m.avgScore}/10 overall`,
        "Workout days trended meaningfully above rest days",
      ],
      modules: ["workout", "mood"],
    });
  }

  // Habits → mood
  if (ctx.patterns.moodHabitCorrelation) {
    d.push({
      signature: "habit-mood",
      title: "You feel better on days you keep your habits",
      explanation: "Days where you completed habits line up with higher mood. Consistency seems to feed how you feel, not just your stats.",
      confidence: 76,
      evidence: [
        `${h.totalCompletions} total habit completions`,
        `${h.last30Rate}% habit consistency over 30 days`,
        "Habit days averaged higher mood than non-habit days",
      ],
      modules: ["habits", "mood"],
    });
  }

  // Consistency drop
  if (h.list.length && h.last7Rate < h.last30Rate - 15) {
    d.push({
      signature: "habit-drop",
      title: "Your consistency dipped this week",
      explanation: "Your habit completion this week is running below your 30-day baseline. Worth a gentle reset before it compounds.",
      confidence: 74,
      evidence: [`This week: ${h.last7Rate}%`, `30-day average: ${h.last30Rate}%`, `Best streak on record: ${h.bestStreak} days`],
      modules: ["habits"],
    });
  }

  // Momentum building
  if (h.list.length && h.last7Rate > h.last30Rate + 15) {
    d.push({
      signature: "habit-momentum",
      title: "You're building real momentum",
      explanation: "Your habit consistency this week is well above your usual baseline — this is exactly when streaks turn into identity.",
      confidence: 78,
      evidence: [`This week: ${h.last7Rate}%`, `30-day average: ${h.last30Rate}%`],
      modules: ["habits"],
    });
  }

  // Mood trend
  if (m.entries >= 5 && m.trend === "improving") {
    d.push({
      signature: "mood-improving",
      title: "Your mood has been trending up",
      explanation: "Your recent 7-day mood average is climbing above your monthly baseline. Whatever you're doing lately, it's working.",
      confidence: 72,
      evidence: [`Last 7 days: ${m.last7Avg}/10`, `Last 30 days: ${m.last30Avg}/10`, m.topFactors.length ? `Top factors: ${m.topFactors.slice(0,3).join(", ")}` : "Consistent logging"],
      modules: ["mood"],
    });
  }
  if (m.entries >= 5 && m.trend === "declining") {
    d.push({
      signature: "mood-declining",
      title: "Your mood has dipped recently",
      explanation: "Your last week of mood scores is below your monthly average. This is a good moment to lean on what usually lifts you.",
      confidence: 70,
      evidence: [`Last 7 days: ${m.last7Avg}/10`, `Last 30 days: ${m.last30Avg}/10`, ctx.patterns.workoutMoodCorrelation ? "Workouts reliably lift your mood" : "Consider a reset ritual"],
      modules: ["mood"],
    });
  }

  // Journaling consistency
  if (ctx.journal.last30Entries >= 8) {
    d.push({
      signature: "journal-consistent",
      title: "Journaling is becoming a real practice",
      explanation: "You've journaled steadily this month. Reflection consistency is one of the strongest predictors of self-awareness and follow-through.",
      confidence: 71,
      evidence: [`${ctx.journal.last30Entries} entries in 30 days`, `~${ctx.journal.avgWordsPerEntry} words per entry`],
      modules: ["journal"],
    });
  }

  // Tasks piling up
  if (ctx.tasks.overdue >= 3) {
    d.push({
      signature: "tasks-overdue",
      title: "Tasks are quietly piling up",
      explanation: `You have ${ctx.tasks.overdue} overdue tasks. Clearing two or three of the oldest usually breaks the logjam and restores momentum.`,
      confidence: 68,
      evidence: [`${ctx.tasks.overdue} overdue`, `${ctx.tasks.completionRate}% overall completion rate`],
      modules: ["tasks"],
    });
  }

  // Goal progress strong
  if (ctx.goals.active > 0 && ctx.goals.avgProgress >= 60) {
    d.push({
      signature: "goals-strong",
      title: "You're closing in on your goals",
      explanation: `Your active goals average ${ctx.goals.avgProgress}% progress. You're in the final stretch where finishing matters most.`,
      confidence: 73,
      evidence: [`${ctx.goals.active} active goals`, ctx.goals.topGoal ? `Top: "${ctx.goals.topGoal}"` : `${ctx.goals.avgProgress}% average`],
      modules: ["goals"],
    });
  }

  // Finance overspend
  if (ctx.finance.expense30 > 0 && ctx.finance.net30 < 0) {
    d.push({
      signature: "finance-negative",
      title: "You spent more than you earned this month",
      explanation: `Over the last 30 days your net was negative${ctx.finance.topExpenseCategory ? `, led by ${ctx.finance.topExpenseCategory}` : ""}. A small adjustment now compounds.`,
      confidence: 69,
      evidence: [`Income: ${Math.round(ctx.finance.income30)}`, `Expenses: ${Math.round(ctx.finance.expense30)}`, `Net: ${Math.round(ctx.finance.net30)}`],
      modules: ["finance"],
    });
  }

  // Inactivity → productivity
  if (h.list.length && h.last7Rate < 35 && h.bestStreak >= 7) {
    d.push({
      signature: "post-streak-dip",
      title: "Your momentum dropped after a strong run",
      explanation: "You've held long streaks before, but this week is quiet. The fastest way back is one tiny win today — not a perfect day.",
      confidence: 67,
      evidence: [`Best streak: ${h.bestStreak} days`, `This week: ${h.last7Rate}%`],
      modules: ["habits"],
    });
  }

  return d.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
}

// ════════════════════════════════════════════════════════════════
// 2. LIFE DNA — deepest profile
// ════════════════════════════════════════════════════════════════

export interface LifeDNA {
  identity: string;
  strengths: string[];
  blindSpots: string[];
  behavioralPatterns: string[];
  motivationPatterns: string[];
  productivityStyle: string;
  recoveryStyle: string;
  decisionStyle: string;
  currentRisks: string[];
  recommendedFocus: string[];
}

export function buildDnaPrompt(ctx: DeepContext): string {
  return `You are Novus, building a "Life DNA" — the deepest, most honest profile of this person from their real data. Be perceptive, specific and human; avoid generic platitudes.

DATA:
${JSON.stringify(summariseForPrompt(ctx), null, 2)}

Return ONLY this JSON object:
{
  "identity": "2-3 sentence portrait of who this person is right now",
  "strengths": ["..."],
  "blindSpots": ["..."],
  "behavioralPatterns": ["..."],
  "motivationPatterns": ["..."],
  "productivityStyle": "one vivid sentence",
  "recoveryStyle": "how they bounce back, one sentence",
  "decisionStyle": "how they tend to decide, one sentence",
  "currentRisks": ["..."],
  "recommendedFocus": ["..."]
}
Each array: 2-4 concise, specific items grounded in the data. No markdown, JSON only.`;
}

export function parseDna(raw: string): LifeDNA | null {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const p = JSON.parse(raw.slice(start, end + 1));
    return {
      identity: String(p.identity || ""),
      strengths: arr(p.strengths),
      blindSpots: arr(p.blindSpots),
      behavioralPatterns: arr(p.behavioralPatterns),
      motivationPatterns: arr(p.motivationPatterns),
      productivityStyle: String(p.productivityStyle || ""),
      recoveryStyle: String(p.recoveryStyle || ""),
      decisionStyle: String(p.decisionStyle || ""),
      currentRisks: arr(p.currentRisks),
      recommendedFocus: arr(p.recommendedFocus),
    };
  } catch {
    return null;
  }
}

export function fallbackDna(ctx: DeepContext): LifeDNA {
  const consistent = ctx.habits.last30Rate >= 55;
  const reflective = ctx.journal.last30Entries >= 6;
  const active = ctx.workout.last30Sessions >= 6;
  const strengths: string[] = [];
  if (consistent) strengths.push(`Reliable habit-keeper — ${ctx.habits.last30Rate}% consistency over 30 days`);
  if (reflective) strengths.push("Reflective — you journal often enough to actually learn from yourself");
  if (active) strengths.push("Physically active and using movement as a tool");
  if (ctx.goals.avgProgress >= 50) strengths.push("Goal-driven — you make steady measurable progress");
  if (!strengths.length) strengths.push("Self-aware enough to track your life honestly");

  const blindSpots: string[] = [];
  if (ctx.tasks.overdue >= 3) blindSpots.push("You let tasks accumulate before acting");
  if (ctx.habits.last7Rate < ctx.habits.last30Rate - 15) blindSpots.push("Consistency slips when life gets busy");
  if (!reflective) blindSpots.push("You reflect less than you act — insight may lag behind effort");
  if (ctx.mood.entries < 5) blindSpots.push("Limited mood data makes emotional patterns harder to see");
  if (!blindSpots.length) blindSpots.push("Few obvious blind spots — keep stress-testing your routine");

  const behavioral: string[] = [];
  if (ctx.patterns.workoutMoodCorrelation) behavioral.push("Your mood rises on the days you move");
  if (ctx.patterns.moodHabitCorrelation) behavioral.push("Keeping habits and feeling good are tightly linked for you");
  behavioral.push(ctx.habits.bestStreak >= 14 ? "You can sustain long streaks once you start" : "You start strong but streaks are still forming");

  const motivation = consistent
    ? "You're driven by momentum and identity — once a streak forms, you protect it."
    : "You're driven by fresh starts and meaning — you need a compelling 'why' to commit.";

  const recovery = ctx.habits.bestStreak >= 7
    ? "You recover by rebuilding routine — structure is your reset button."
    : "Your recovery is still fragile; one missed day can stall you, so tiny restarts matter most.";

  const productivity = ctx.tasks.completionRate >= 60
    ? "You execute steadily and finish what you start."
    : "You generate intentions faster than you close them — prioritisation is your lever.";

  const decision = reflective
    ? "You think before you leap — you process through writing and reflection."
    : "You tend to decide in motion, learning by doing rather than deliberating.";

  const risks: string[] = [];
  if (ctx.mood.trend === "declining") risks.push("Mood is trending down — protect sleep, movement and connection");
  if (ctx.tasks.overdue >= 3) risks.push("Overdue tasks could snowball into avoidance");
  if (ctx.habits.last7Rate < 35) risks.push("This week's low consistency risks breaking your momentum");
  if (!risks.length) risks.push("No major risks right now — your main risk is complacency");

  const focus: string[] = [];
  if (ctx.patterns.workoutMoodCorrelation && ctx.workout.last7Sessions < 2) focus.push("Train at least twice this week — it's your strongest mood lever");
  if (ctx.tasks.overdue >= 3) focus.push("Clear your 3 oldest overdue tasks");
  if (!reflective) focus.push("Journal 3 nights this week to close the insight gap");
  if (ctx.goals.active > 0 && ctx.goals.avgProgress < 50) focus.push(`Push your top goal${ctx.goals.topGoal ? ` ("${ctx.goals.topGoal}")` : ""} forward`);
  if (!focus.length) focus.push("Keep your current routine and raise the bar on one habit");

  return {
    identity: `${ctx.user.name} is ${consistent ? "a consistent, routine-driven person" : "a person in the middle of building their routine"} who has been with Novus for ${ctx.user.joinedDaysAgo} days. ${reflective ? "You reflect regularly" : "You act more than you reflect"}${active ? " and use movement to regulate yourself" : ""}.`,
    strengths,
    blindSpots,
    behavioralPatterns: behavioral,
    motivationPatterns: [motivation],
    productivityStyle: productivity,
    recoveryStyle: recovery,
    decisionStyle: decision,
    currentRisks: risks,
    recommendedFocus: focus,
  };
}

// ════════════════════════════════════════════════════════════════
// 3. EXPERIMENTS
// ════════════════════════════════════════════════════════════════

export interface ExperimentProposal {
  title: string;
  hypothesis: string;
  durationDays: number;
  actions: string[];
  predictedOutcome: string;
}

export function proposeExperiment(ctx: DeepContext): ExperimentProposal {
  // Pick the highest-leverage intervention based on weakest/strongest signals
  if (ctx.patterns.workoutMoodCorrelation && ctx.workout.last7Sessions < 3) {
    return {
      title: "The Movement Lift",
      hypothesis: "Training boosts your mood — doing it consistently for a week should raise your baseline.",
      durationDays: 7,
      actions: ["Complete 3 workouts this week", "Log your mood each day"],
      predictedOutcome: "Your 7-day average mood rises by at least 0.5 points.",
    };
  }
  if (ctx.journal.last30Entries < 8) {
    return {
      title: "The Nightly Reflection",
      hypothesis: "Journaling consistently will improve both your mood clarity and your follow-through.",
      durationDays: 7,
      actions: ["Journal every night", "Log your mood each day"],
      predictedOutcome: "You feel more in control and your habit consistency improves by week's end.",
    };
  }
  if (ctx.habits.last7Rate < ctx.habits.last30Rate - 10) {
    return {
      title: "The Momentum Rebuild",
      hypothesis: "Protecting just one keystone habit daily will pull your overall consistency back up.",
      durationDays: 7,
      actions: ["Pick one keystone habit and complete it daily", "Check Novus each morning"],
      predictedOutcome: "Your weekly habit consistency returns to or above your 30-day baseline.",
    };
  }
  return {
    title: "The Consistency Streak",
    hypothesis: "Stacking journaling + one workout will lift your mood and consistency together.",
    durationDays: 7,
    actions: ["Journal every night", "Complete one workout mid-week", "Log mood daily"],
    predictedOutcome: "Your mood and habit consistency both improve over the next 7 days.",
  };
}

export interface ExperimentSnapshot {
  habitRate: number;
  moodAvg: number;
  workouts: number;
  journalEntries: number;
}

export function snapshotFromContext(ctx: DeepContext): ExperimentSnapshot {
  return {
    habitRate: ctx.habits.last7Rate,
    moodAvg: ctx.mood.last7Avg,
    workouts: ctx.workout.last7Sessions,
    journalEntries: ctx.journal.last30Entries,
  };
}

export function summarizeExperiment(
  title: string,
  predicted: string,
  before: ExperimentSnapshot,
  after: ExperimentSnapshot
): { status: "COMPLETED" | "FAILED"; actualOutcome: string; aiSummary: string } {
  const moodDelta = +(after.moodAvg - before.moodAvg).toFixed(1);
  const habitDelta = after.habitRate - before.habitRate;
  const improved = moodDelta > 0.2 || habitDelta > 5 || after.workouts > before.workouts;
  const parts: string[] = [];
  parts.push(`Mood ${moodDelta >= 0 ? "rose" : "fell"} ${Math.abs(moodDelta)} points (${before.moodAvg}→${after.moodAvg}).`);
  parts.push(`Habit consistency ${habitDelta >= 0 ? "up" : "down"} ${Math.abs(habitDelta)}% (${before.habitRate}%→${after.habitRate}%).`);
  if (after.workouts !== before.workouts) parts.push(`Workouts: ${before.workouts}→${after.workouts}.`);
  const actualOutcome = parts.join(" ");
  const aiSummary = improved
    ? `"${title}" worked. ${actualOutcome} The hypothesis held — this is worth keeping.`
    : `"${title}" didn't move the needle much this time. ${actualOutcome} Not a failure — now you know this lever needs a different approach.`;
  return { status: improved ? "COMPLETED" : "FAILED", actualOutcome, aiSummary };
}

// ════════════════════════════════════════════════════════════════
// 4. DECISION ANALYSIS (chat)
// ════════════════════════════════════════════════════════════════

export interface DecisionAnalysis {
  pros: string[];
  cons: string[];
  shortTerm: string;
  longTerm: string;
  goalAlignment: string;
  behaviorAlignment: string;
  possibleRegrets: string;
  recommendation: string;
}

const DECISION_TRIGGERS = [
  "should i", "shall i", "do you think i should", "is it worth", "what should i do",
  "help me decide", "good idea", "bad idea", "pros and cons", "or should i",
  "thinking about", "considering", "torn between", "what would you do", "make a decision",
];

export function isDecisionQuestion(text: string): boolean {
  const t = text.toLowerCase();
  return DECISION_TRIGGERS.some((k) => t.includes(k));
}

export function buildDecisionPrompt(question: string, ctx: DeepContext): string {
  return `You are Novus. The user is facing a decision. Use structured decision analysis grounded in their real data and patterns.

USER'S DATA:
${JSON.stringify(summariseForPrompt(ctx), null, 2)}

DECISION/QUESTION: "${question}"

Return ONLY this JSON:
{
  "pros": ["..."],
  "cons": ["..."],
  "shortTerm": "likely short-term consequences (1-2 sentences)",
  "longTerm": "likely long-term consequences (1-2 sentences)",
  "goalAlignment": "how this fits their stated goals",
  "behaviorAlignment": "how this fits their past behavior/patterns",
  "possibleRegrets": "what they might regret either way",
  "recommendation": "a clear, warm final recommendation"
}
Be specific to THIS person. 2-4 items per array. JSON only, no markdown.`;
}

export function parseDecision(raw: string): DecisionAnalysis | null {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const p = JSON.parse(raw.slice(start, end + 1));
    if (!p.recommendation && !Array.isArray(p.pros)) return null;
    return {
      pros: arr(p.pros), cons: arr(p.cons),
      shortTerm: String(p.shortTerm || ""), longTerm: String(p.longTerm || ""),
      goalAlignment: String(p.goalAlignment || ""), behaviorAlignment: String(p.behaviorAlignment || ""),
      possibleRegrets: String(p.possibleRegrets || ""), recommendation: String(p.recommendation || ""),
    };
  } catch {
    return null;
  }
}

/** Render a decision analysis as a readable chat message. */
export function formatDecision(question: string, a: DecisionAnalysis): string {
  const lines: string[] = [];
  if (a.pros.length) lines.push("**Pros**\n" + a.pros.map((x) => `• ${x}`).join("\n"));
  if (a.cons.length) lines.push("**Cons**\n" + a.cons.map((x) => `• ${x}`).join("\n"));
  if (a.shortTerm) lines.push(`**Short term:** ${a.shortTerm}`);
  if (a.longTerm) lines.push(`**Long term:** ${a.longTerm}`);
  if (a.goalAlignment) lines.push(`**Fit with your goals:** ${a.goalAlignment}`);
  if (a.behaviorAlignment) lines.push(`**Fit with your patterns:** ${a.behaviorAlignment}`);
  if (a.possibleRegrets) lines.push(`**Possible regrets:** ${a.possibleRegrets}`);
  if (a.recommendation) lines.push(`**My take:** ${a.recommendation}`);
  return lines.join("\n\n");
}

export function fallbackDecision(question: string, ctx: DeepContext): DecisionAnalysis {
  return {
    pros: ["It could move you toward something you say matters", "Acting beats staying stuck in indecision"],
    cons: ["It has a real cost in time or energy", "The timing may not be ideal given your current load"],
    shortTerm: "Expect some friction and adjustment in the first week.",
    longTerm: "If it aligns with your goals, the compounding benefit outweighs the short-term cost.",
    goalAlignment: ctx.goals.topGoal ? `Weigh it against your goal "${ctx.goals.topGoal}".` : "You have few active goals, so judge it against what you want this season.",
    behaviorAlignment: ctx.habits.last30Rate >= 55 ? "You follow through when you commit, so a clear yes is likely to stick." : "You start more than you finish, so only commit if you'll protect it.",
    possibleRegrets: "You may regret not trying more than trying and learning it wasn't right.",
    recommendation: ctx.tasks.overdue >= 3 ? "Clear your current load first, then commit fully." : "If it aligns with your goals, commit — but make it small enough to actually sustain.",
  };
}

// ════════════════════════════════════════════════════════════════
// 5. COMMITMENT (Promise Memory) detection
// ════════════════════════════════════════════════════════════════

const COMMIT_PATTERNS = [
  /\bi(?:'| a)?m going to\b/i,
  /\bi will\b/i,
  /\bi'?ll\b/i,
  /\bi promise\b/i,
  /\bi'?m quitting\b/i,
  /\bi'?m starting\b/i,
  /\bi want to start\b/i,
  /\bfrom (?:today|tomorrow|monday|next week)\b/i,
  /\bi commit to\b/i,
  /\bno more\b/i,
];

const MODULE_HINTS: Array<{ re: RegExp; module: string }> = [
  { re: /\b(workout|gym|train|exercise|run|lift)\b/i, module: "workout" },
  { re: /\b(journal|write|reflect)\b/i, module: "journal" },
  { re: /\b(habit|streak|daily)\b/i, module: "habits" },
  { re: /\b(goal|finish|complete|launch|ship)\b/i, module: "goals" },
  { re: /\b(sugar|smoking|drink|alcohol|junk|diet|eat)\b/i, module: "mood" },
  { re: /\b(save|spend|budget|money)\b/i, module: "finance" },
  { re: /\b(task|todo|project)\b/i, module: "tasks" },
];

export function detectCommitment(text: string): { text: string; relatedModule: string | null } | null {
  if (!text || text.length < 6 || text.length > 280) return null;
  const isCommit = COMMIT_PATTERNS.some((re) => re.test(text));
  if (!isCommit) return null;
  // Ignore questions ("should I…") — those are decisions, not commitments
  if (/\?\s*$/.test(text.trim()) || isDecisionQuestion(text)) return null;
  const hint = MODULE_HINTS.find((h) => h.re.test(text));
  return { text: text.trim(), relatedModule: hint?.module ?? null };
}

export function commitmentFollowUp(text: string): string {
  return `A little while ago you told me: "${text.replace(/"/g, "'")}". How's that going? No judgment — just checking in.`;
}

// ════════════════════════════════════════════════════════════════
// 6. EMOTIONAL ACHIEVEMENTS
// ════════════════════════════════════════════════════════════════

export interface EmotionalAchievement {
  key: string;
  name: string;
  description: string;
}

/**
 * Detect human, recovery-oriented achievements from context.
 * Deterministic — surfaced in Weekly Review and (optionally) notifications.
 */
export function detectEmotionalAchievements(ctx: DeepContext): EmotionalAchievement[] {
  const out: EmotionalAchievement[] = [];
  const h = ctx.habits;

  if (h.last7Rate > h.last30Rate + 12) {
    out.push({ key: "recovered-momentum", name: "Recovered Momentum", description: "You pulled your consistency back up after it had slipped. That's the hard part — and you did it." });
  }
  if (ctx.mood.trend === "improving" && ctx.mood.last30Avg < 6) {
    out.push({ key: "climbed-back", name: "Climbed Back Up", description: "Your mood is rising from a low place. Quietly, you've been doing the things that help." });
  }
  if (ctx.workout.last7Sessions >= 2 && ctx.mood.last7Avg < 5.5) {
    out.push({ key: "showed-up-low", name: "Showed Up Anyway", description: "You trained even on harder days. Showing up when you don't feel like it is what builds the real version of you." });
  }
  if (h.bestStreak >= 7 && h.last7Rate >= 70) {
    out.push({ key: "stayed-consistent", name: "Held the Line", description: "You stayed consistent through a full week. Reliability is becoming who you are." });
  }
  if (ctx.journal.last30Entries >= 10) {
    out.push({ key: "kept-reflecting", name: "Kept Listening to Yourself", description: "You've kept journaling through the month. Staying honest with yourself is a quiet superpower." });
  }
  return out;
}

// ════════════════════════════════════════════════════════════════
// helpers
// ════════════════════════════════════════════════════════════════

function arr(x: any): string[] {
  return Array.isArray(x) ? x.filter((i) => typeof i === "string" && i.trim()).slice(0, 6) : [];
}

function summariseForPrompt(ctx: DeepContext) {
  return {
    name: ctx.user.name,
    daysWithNovus: ctx.user.joinedDaysAgo,
    habits: { count: ctx.habits.list.length, consistency30: ctx.habits.last30Rate, consistency7: ctx.habits.last7Rate, bestStreak: ctx.habits.bestStreak },
    tasks: { completionRate: ctx.tasks.completionRate, overdue: ctx.tasks.overdue },
    goals: { active: ctx.goals.active, avgProgress: ctx.goals.avgProgress, top: ctx.goals.topGoal },
    mood: { avg: ctx.mood.avgScore, trend: ctx.mood.trend, last7: ctx.mood.last7Avg, topEmotions: ctx.mood.topEmotions, topFactors: ctx.mood.topFactors },
    workout: { last7: ctx.workout.last7Sessions, last30: ctx.workout.last30Sessions, consistent: ctx.workout.isConsistent },
    journal: { last30: ctx.journal.last30Entries, avgWords: ctx.journal.avgWordsPerEntry },
    patterns: ctx.patterns,
  };
}


// ════════════════════════════════════════════════════════════════
// 7. WEEKLY REVIEW EXTRAS (upgrades the existing review)
// ════════════════════════════════════════════════════════════════

export interface PrevWeekStats {
  habitRate?: number;
  avgMood?: number;
  workouts?: number;
  tasksCompleted?: number;
  goalsProgress?: number;
}

export interface WeeklyExtras {
  consistencyTrend: { direction: "up" | "down" | "steady"; text: string };
  personalityEvolution: string;
  recoveryAnalysis: string;
  whatChanged: string[];
  emotionalAchievements: EmotionalAchievement[];
  recommendedExperiment: ExperimentProposal;
}

export function generateWeeklyExtras(ctx: DeepContext, prev?: PrevWeekStats | null): WeeklyExtras {
  const delta = ctx.habits.last7Rate - ctx.habits.last30Rate;
  const direction: "up" | "down" | "steady" = delta > 8 ? "up" : delta < -8 ? "down" : "steady";

  const consistencyTrend = {
    direction,
    text:
      direction === "up"
        ? `Your consistency rose to ${ctx.habits.last7Rate}% this week, above your ${ctx.habits.last30Rate}% baseline.`
        : direction === "down"
        ? `Your consistency slipped to ${ctx.habits.last7Rate}% this week, below your ${ctx.habits.last30Rate}% baseline.`
        : `Your consistency held steady around ${ctx.habits.last7Rate}%.`,
  };

  const whatChanged: string[] = [];
  if (prev) {
    const cmp = (label: string, now: number, before: number | undefined | null, unit = "") => {
      if (before === undefined || before === null) return;
      const diff = Math.round((now - before) * 10) / 10;
      if (Math.abs(diff) < 0.1) return;
      whatChanged.push(`${label} ${diff > 0 ? "up" : "down"} ${Math.abs(diff)}${unit} (${before}${unit} → ${now}${unit})`);
    };
    cmp("Habit rate", ctx.habits.last7Rate, prev.habitRate, "%");
    cmp("Avg mood", ctx.mood.last7Avg, prev.avgMood);
    cmp("Workouts", ctx.workout.last7Sessions, prev.workouts);
  }
  if (!whatChanged.length) whatChanged.push(prev ? "Roughly the same rhythm as last week." : "This is your first tracked week — next week I'll compare it to this one.");

  const evoBits: string[] = [];
  if (direction === "up") evoBits.push("more disciplined");
  if (ctx.journal.last30Entries >= 8) evoBits.push("more reflective");
  if (ctx.workout.isConsistent) evoBits.push("more physically grounded");
  if (ctx.mood.trend === "improving") evoBits.push("emotionally lighter");
  const personalityEvolution = evoBits.length
    ? `This week you're becoming ${listJoin(evoBits)}. Small shifts — but the kind that compound into who you become.`
    : "You're holding your shape this week — steady, not stagnant. Consistency is its own kind of growth.";

  const recoveryAnalysis =
    direction === "up" && ctx.habits.last30Rate < 55
      ? "You pulled yourself back up this week after a softer stretch — that rebound is the real skill."
      : ctx.mood.trend === "improving"
      ? "Your mood is recovering. Whatever reset you made is working — protect it."
      : direction === "down"
      ? "This was more a recovery week than a peak week. That's allowed. One small win tomorrow restarts momentum."
      : "You stayed level — no crash to recover from, which is a quiet kind of strength.";

  return {
    consistencyTrend,
    personalityEvolution,
    recoveryAnalysis,
    whatChanged,
    emotionalAchievements: detectEmotionalAchievements(ctx),
    recommendedExperiment: proposeExperiment(ctx),
  };
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}


// ════════════════════════════════════════════════════════════════
// 8. TIMELINE NARRATIVE — life chapters + reflections
// ════════════════════════════════════════════════════════════════

export interface TimelineChapter {
  title: string;
  period: string;
  reflection: string;
}
export interface TimelineNarrative {
  currentChapter: TimelineChapter;
  chapters: TimelineChapter[];
}

export function fallbackTimelineNarrative(ctx: DeepContext): TimelineNarrative {
  const days = ctx.user.joinedDaysAgo;
  const delta = ctx.habits.last7Rate - ctx.habits.last30Rate;

  let title: string;
  let reflection: string;
  if (delta > 8) {
    title = "Building Momentum";
    reflection = `You're on an upswing — consistency climbing to ${ctx.habits.last7Rate}% and ${ctx.mood.trend === "improving" ? "your mood rising with it" : "your routine tightening"}. This is the part of the story where habits become identity.`;
  } else if (delta < -8) {
    title = "A Quieter Season";
    reflection = "Things have slowed recently. Every life has seasons like this — they're not failures, they're the dips that make the next climb mean something.";
  } else if (ctx.habits.last30Rate >= 60) {
    title = "Steady State";
    reflection = `You've found a rhythm — holding around ${ctx.habits.last30Rate}% consistency. The work now is to keep it from becoming autopilot.`;
  } else {
    title = "Finding Your Footing";
    reflection = "You're still building the foundation — testing what sticks. This is the most important chapter, even if it doesn't feel dramatic.";
  }

  const currentChapter: TimelineChapter = { title, period: "Now", reflection };

  const chapters: TimelineChapter[] = [];
  chapters.push({
    title: "The Beginning",
    period: days > 30 ? `${Math.round(days / 30)} month${days > 60 ? "s" : ""} ago` : "Your first weeks",
    reflection: `You started with Novus ${days} day${days === 1 ? "" : "s"} ago, choosing to actually pay attention to your life. That decision is the root of everything that follows.`,
  });
  if (days > 21) {
    chapters.push({
      title: "Laying Tracks",
      period: "The weeks since",
      reflection: `Across this stretch you logged ${ctx.habits.totalCompletions} habit completions${ctx.journal.totalEntries ? ` and ${ctx.journal.totalEntries} journal entries` : ""}. Quiet, repeated effort — the kind that doesn't feel like much day to day but builds a person over time.`,
    });
  }
  chapters.push(currentChapter);

  return { currentChapter, chapters };
}

export function buildTimelineNarrativePrompt(ctx: DeepContext): string {
  return `You are Novus, narrating this person's life as a series of chapters from their real data. Be warm, literary and specific — like a thoughtful biographer, not a coach.

DATA:
${JSON.stringify(summariseForPrompt(ctx), null, 2)}

Return ONLY this JSON:
{
  "currentChapter": { "title": "evocative 2-4 word chapter name", "period": "Now", "reflection": "2-3 sentences on where they are right now" },
  "chapters": [ { "title": "...", "period": "e.g. 'Your first weeks'", "reflection": "2-3 sentences" } ]
}
Provide 2-4 chapters ending with the current one. JSON only, no markdown.`;
}

export function parseTimelineNarrative(raw: string): TimelineNarrative | null {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const p = JSON.parse(raw.slice(start, end + 1));
    const norm = (c: any): TimelineChapter | null =>
      c && c.title ? { title: String(c.title), period: String(c.period || ""), reflection: String(c.reflection || "") } : null;
    const current = norm(p.currentChapter);
    const chapters = Array.isArray(p.chapters) ? p.chapters.map(norm).filter(Boolean) as TimelineChapter[] : [];
    if (!current && !chapters.length) return null;
    return { currentChapter: current || chapters[chapters.length - 1], chapters: chapters.length ? chapters : [current!] };
  } catch {
    return null;
  }
}
