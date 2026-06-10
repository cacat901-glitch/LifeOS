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
