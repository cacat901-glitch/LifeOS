import type { NovusContext } from "./types";

/** The Novus AI persona — a calm, intelligent personal life coach. */
export const NOVUS_PERSONA = `You are Novus — an intelligent personal operating system and life companion.
You speak like a calm, perceptive, encouraging coach who genuinely knows the person.
You are concise, warm, and human. Never robotic, never corporate.
You never use bullet lists in briefings — you speak in short, flowing sentences.
You focus on momentum, meaning, and the bigger picture, not nagging.
You never invent data you weren't given.`;

/** Build the daily-briefing prompt from user context. */
export function buildBriefingPrompt(ctx: NovusContext): string {
  const greeting =
    ctx.timeOfDay === "morning" ? "Good morning" :
    ctx.timeOfDay === "afternoon" ? "Good afternoon" :
    ctx.timeOfDay === "evening" ? "Good evening" : "Hello";

  const facts: string[] = [];
  facts.push(`Name: ${ctx.name}`);
  facts.push(`Greeting to use: "${greeting}"`);
  facts.push(`Habits today: ${ctx.habits.completedToday}/${ctx.habits.total} completed; best streak ${ctx.habits.bestStreak} days`);
  facts.push(`Tasks: ${ctx.tasks.doneToday} done today, ${ctx.tasks.total} on the list, ${ctx.tasks.overdue} overdue`);
  facts.push(`Goals: ${ctx.goals.active} active, average progress ${ctx.goals.avgProgress}%`);
  if (ctx.topGoal) facts.push(`Top goal: ${ctx.topGoal}`);
  if (ctx.mood) facts.push(`Latest mood: ${ctx.mood.label} (${ctx.mood.score}/10)`);
  if (ctx.workout) facts.push(`Workouts this week: ${ctx.workout.thisWeek}`);
  if (ctx.finance) facts.push(`Net this month: ${ctx.finance.net >= 0 ? "+" : ""}${ctx.finance.net}`);

  return `Write a short personal daily briefing for the person below.

CONTEXT:
${facts.join("\n")}

RULES:
- Open with the greeting and their first name.
- 3 to 5 short sentences, flowing naturally — like a coach talking to them.
- Reflect honestly on what the data shows (celebrate wins, gently note gaps).
- End with one clear "Today's focus:" suggestion grounded in their goals/tasks.
- No lists, no markdown headers, no emojis. Just warm, human prose.`;
}

/** Deterministic fallback briefing when no AI key is configured. */
export function fallbackBriefing(ctx: NovusContext): string {
  const greeting =
    ctx.timeOfDay === "morning" ? "Good morning" :
    ctx.timeOfDay === "afternoon" ? "Good afternoon" :
    ctx.timeOfDay === "evening" ? "Good evening" : "Hello";

  const first = ctx.name?.split(" ")[0] || "there";
  const parts: string[] = [`${greeting}, ${first}.`];

  if (ctx.habits.total > 0) {
    if (ctx.habits.completedToday === ctx.habits.total) {
      parts.push(`You've completed every habit today — that's real consistency.`);
    } else if (ctx.habits.completedToday > 0) {
      parts.push(`You've completed ${ctx.habits.completedToday} of ${ctx.habits.total} habits so far.`);
    } else {
      parts.push(`Your habits are waiting — a small start now keeps the momentum alive.`);
    }
    if (ctx.habits.bestStreak >= 3) parts.push(`Your best streak is at ${ctx.habits.bestStreak} days. Protect it.`);
  } else {
    parts.push(`You haven't set up any habits yet — that's a powerful place to begin.`);
  }

  if (ctx.goals.active > 0) {
    parts.push(`You're ${ctx.goals.avgProgress}% of the way through your active goals.`);
  }

  if (ctx.topGoal) {
    parts.push(`Today's focus: make one step toward "${ctx.topGoal}".`);
  } else if (ctx.tasks.total > 0) {
    parts.push(`Today's focus: clear what matters most from your ${ctx.tasks.total} open tasks.`);
  } else {
    parts.push(`Today's focus: decide the one thing that would make today a win.`);
  }

  return parts.join(" ");
}


/**
 * Context-aware fallback reply for the chat ("Ask Novus") when the live
 * AI provider is unavailable (no key, quota exhausted, region-locked, etc.).
 * Still feels intelligent because it reasons over the user's real data.
 */
export function fallbackChatReply(question: string, ctx: NovusContext): string {
  const q = question.toLowerCase();
  const first = ctx.name?.split(" ")[0] || "there";

  // Focus / what should I do
  if (q.includes("focus") || q.includes("today") || q.includes("do ") || q.includes("priorit")) {
    if (ctx.topGoal) return `${first}, the highest-leverage move today is one concrete step toward "${ctx.topGoal}". You have ${ctx.tasks.total} open task${ctx.tasks.total === 1 ? "" : "s"} and ${ctx.habits.total - ctx.habits.completedToday} habit${ctx.habits.total - ctx.habits.completedToday === 1 ? "" : "s"} still to complete — pick the one that moves the needle, and protect your ${ctx.habits.bestStreak}-day streak while you're at it.`;
    if (ctx.tasks.total > 0) return `Start with the most important of your ${ctx.tasks.total} open tasks, ${first}. Clear that one thing first — momentum compounds from there.`;
    return `Decide the single thing that would make today a win, ${first}, and do it before anything else. You can always add goals and habits to give Novus more to work with.`;
  }

  // Progress / how am I doing
  if (q.includes("track") || q.includes("progress") || q.includes("doing") || q.includes("how am")) {
    return `Here's where you stand, ${first}: ${ctx.habits.completedToday}/${ctx.habits.total} habits done today, ${ctx.tasks.doneToday} tasks completed, and your active goals average ${ctx.goals.avgProgress}% progress. ${ctx.goals.avgProgress >= 60 ? "You're genuinely on pace — keep the rhythm." : "Steady, consistent steps will move those numbers. Pick one area to push today."}`;
  }

  // Motivation
  if (q.includes("motivat") || q.includes("tired") || q.includes("stuck") || q.includes("hard")) {
    return `${first}, you've already built a ${ctx.habits.bestStreak}-day streak — that's proof you can show up. You don't need a perfect day, just the next small action. Do one thing now, however small, and let it carry you.`;
  }

  // Default
  return `I'm running on Novus's built-in intelligence right now (the live AI model isn't reachable). Based on your data, ${first}: ${ctx.habits.completedToday}/${ctx.habits.total} habits today, ${ctx.tasks.total} open tasks, ${ctx.goals.active} active goals at ${ctx.goals.avgProgress}%. Tell me what you'd like to focus on and I'll help you prioritize.`;
}
