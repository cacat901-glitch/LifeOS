/**
 * Novus AI — Action Execution Engine
 *
 * Turns natural-language requests in "Ask Novus" into REAL operations against
 * the database (scoped strictly to the current user). The AI provider decides
 * intent + extracts arguments as structured JSON; this module validates and
 * executes those actions, mirroring the same logic the REST routes use.
 *
 * Destructive actions (resetting data, deleting the account) are never executed
 * without an explicit confirmation round-trip — see DESTRUCTIVE_ACTIONS + the
 * /api/ai/chat route.
 */
import { prisma } from "@/lib/prisma";
import type { NovusContext } from "./types";

// ════════════════════════════════════════════════════════════════
// Action catalog
// ════════════════════════════════════════════════════════════════

export type NovusActionType =
  | "create_habit"
  | "create_task"
  | "create_goal"
  | "create_journal_entry"
  | "log_mood"
  | "complete_habit"
  | "complete_task"
  | "reset_data"
  | "delete_account";

export interface NovusAction {
  type: NovusActionType;
  // Loose bag of args — validated per-type at execution time.
  [key: string]: any;
}

/** Actions that irreversibly destroy data — require explicit user confirmation. */
export const DESTRUCTIVE_ACTIONS: ReadonlySet<NovusActionType> = new Set<NovusActionType>([
  "reset_data",
  "delete_account",
]);

export const KNOWN_ACTION_TYPES: ReadonlySet<NovusActionType> = new Set<NovusActionType>([
  "create_habit",
  "create_task",
  "create_goal",
  "create_journal_entry",
  "log_mood",
  "complete_habit",
  "complete_task",
  "reset_data",
  "delete_account",
]);

export function isDestructive(action: NovusAction): boolean {
  return DESTRUCTIVE_ACTIONS.has(action.type);
}

export function hasDestructive(actions: NovusAction[]): boolean {
  return actions.some(isDestructive);
}

export interface ActionResult {
  type: NovusActionType;
  ok: boolean;
  /** Short human-readable summary of what happened. */
  summary: string;
  data?: any;
  error?: string;
}

// ════════════════════════════════════════════════════════════════
// Prompt — the "agent brain"
// ════════════════════════════════════════════════════════════════

/**
 * The system prompt that turns the model into an agent which can both chat and
 * propose concrete actions. It must ALWAYS answer in a single JSON object.
 */
export function buildAgentSystemPrompt(ctx: NovusContext): string {
  const contextBlock = `CURRENT CONTEXT (use only when relevant, never invent data):
- Name: ${ctx.name}
- Habits today: ${ctx.habits.completedToday}/${ctx.habits.total} done, best streak ${ctx.habits.bestStreak}d
- Tasks: ${ctx.tasks.doneToday} done today, ${ctx.tasks.total} open, ${ctx.tasks.overdue} overdue
- Goals: ${ctx.goals.active} active at ${ctx.goals.avgProgress}% avg${ctx.topGoal ? `, top goal "${ctx.topGoal}"` : ""}
${ctx.mood ? `- Mood: ${ctx.mood.label} (${ctx.mood.score}/10)` : ""}`;

  return `You are Novus — an intelligent personal operating system and life companion.
You are warm, perceptive, concise, and genuinely helpful. You speak like a trusted coach.

You can take REAL actions in the user's account. When the user asks you to create,
log, complete, reset, or delete something, you MUST include the matching action(s)
so it actually happens — do not merely say you did it.

${contextBlock}

AVAILABLE ACTIONS (the "type" field must be one of these):
- create_habit        { "name": string, "description"?: string, "frequency"?: "DAILY"|"WEEKLY"|"MONTHLY", "icon"?: string, "color"?: string }
- create_task         { "title": string, "description"?: string, "priority"?: "LOW"|"MEDIUM"|"HIGH"|"URGENT", "dueDate"?: "YYYY-MM-DD" }
- create_goal         { "title": string, "description"?: string, "targetDate"?: "YYYY-MM-DD", "milestones"?: string[] }
- create_journal_entry{ "content": string, "title"?: string, "mood"?: 1-10, "tags"?: string[] }
- log_mood            { "score": 1-10, "label"?: string, "emoji"?: string, "emotions"?: string[], "factors"?: string[], "notes"?: string }
- complete_habit      { "name": string }   // marks an existing habit done for today
- complete_task       { "title": string }  // marks an existing task as done
- reset_data          { }                  // DESTRUCTIVE: wipes ALL the user's content (habits, tasks, goals, journal, mood, workouts, projects, finance). Keeps the account.
- delete_account      { }                  // DESTRUCTIVE: permanently deletes the entire account.

RESPONSE FORMAT — respond with ONE JSON object and nothing else:
{
  "reply": "a short, natural, friendly message to show the user",
  "actions": [ { "type": "...", ... }, ... ]
}

CRITICAL RULES — READ CAREFULLY:
- The "actions" array is the ONLY way anything actually happens. Your "reply" text does NOT
  perform anything by itself.
- If the user asks you to create, add, make, start, log, record, track, complete, finish, mark,
  reset, wipe, clear, or delete ANYTHING, you MUST include the matching action object in "actions".
- NEVER claim you did something (e.g. "I've created that habit") unless you included the
  corresponding action in the "actions" array. Saying it without the action is a failure.
- If the user is just chatting or asking a question, return "actions": [] and answer in "reply".
- Only include actions the user clearly asked for. Never invent extra items.
- You may include multiple actions in one response (e.g. a goal plus supporting habits).
- For create_goal, derive 2–5 concrete "milestones" when it helps, but keep them realistic.
- For destructive actions (reset_data, delete_account), still include the action; the system
  will ask the user to confirm before anything is deleted. In "reply", clearly state what will
  be removed and that it cannot be undone.
- Keep "reply" concise (1–3 sentences). No markdown headers, no bullet lists.
- Output ONLY the JSON object. No prose before or after, no code fences.

EXAMPLES:
User: "create a habit called Meditate"
{"reply":"Done — I've added a Meditate habit to your tracker.","actions":[{"type":"create_habit","name":"Meditate","frequency":"DAILY"}]}

User: "add buy groceries to my tasks for tomorrow"
{"reply":"Added \\"Buy groceries\\" to your tasks, due tomorrow.","actions":[{"type":"create_task","title":"Buy groceries","priority":"MEDIUM"}]}

User: "I'm feeling great today, like an 8"
{"reply":"Logged your mood at 8/10 — glad you're feeling great!","actions":[{"type":"log_mood","score":8,"label":"Great"}]}

User: "set a goal to run a marathon by december"
{"reply":"Created your goal to run a marathon, with a few milestones to get you there.","actions":[{"type":"create_goal","title":"Run a marathon","milestones":["Run 5K without stopping","Complete a 10K race","Finish a half marathon","Build up to 30K long runs"]}]}

User: "delete everything and let me start over"
{"reply":"This will permanently erase all your habits, tasks, goals, journal, mood, workouts, projects and finance data. Your account stays. This can't be undone — confirm to proceed.","actions":[{"type":"reset_data"}]}

User: "what should I focus on today?"
{"reply":"Given your overdue tasks, I'd knock out the most urgent one first, then keep your habit streak alive.","actions":[]}`;
}

// ════════════════════════════════════════════════════════════════
// Parsing the model output
// ════════════════════════════════════════════════════════════════

export interface AgentDecision {
  reply: string;
  actions: NovusAction[];
}

/** Robustly extract the JSON decision from a raw model completion. */
export function parseAgentDecision(raw: string): AgentDecision | null {
  if (!raw) return null;

  // Strip code fences if the model added them.
  let text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  // Find the outermost JSON object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const slice = text.slice(start, end + 1);
  let parsed: any;
  try {
    parsed = JSON.parse(slice);
  } catch {
    return null;
  }

  const reply = typeof parsed?.reply === "string" ? parsed.reply.trim() : "";
  const rawActions = Array.isArray(parsed?.actions) ? parsed.actions : [];

  const actions: NovusAction[] = rawActions
    .filter((a: any) => a && typeof a.type === "string" && KNOWN_ACTION_TYPES.has(a.type))
    .map((a: any) => ({ ...a, type: a.type as NovusActionType }));

  if (!reply && actions.length === 0) return null;
  return { reply: reply || "Done.", actions };
}

/** A short, human-readable description of a single action (for confirmations/logs). */
export function describeAction(action: NovusAction): string {
  switch (action.type) {
    case "create_habit": return `Create habit "${action.name ?? "Untitled"}"`;
    case "create_task": return `Create task "${action.title ?? "Untitled"}"`;
    case "create_goal": return `Create goal "${action.title ?? "Untitled"}"`;
    case "create_journal_entry": return `Add a journal entry`;
    case "log_mood": return `Log mood (${action.score ?? "?"}/10)`;
    case "complete_habit": return `Mark habit "${action.name ?? ""}" done today`;
    case "complete_task": return `Complete task "${action.title ?? ""}"`;
    case "reset_data": return `Erase ALL your content (habits, tasks, goals, journal, mood, workouts, projects, finance)`;
    case "delete_account": return `Permanently delete your entire account`;
    default: return action.type;
  }
}

// ════════════════════════════════════════════════════════════════
// Execution
// ════════════════════════════════════════════════════════════════

const VALID_FREQUENCIES = new Set(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]);
const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Execute a single validated action for a user. Never throws — returns an
 * ActionResult describing success or failure so the caller can summarise.
 */
export async function executeAction(userId: string, action: NovusAction): Promise<ActionResult> {
  try {
    switch (action.type) {
      // ── Create habit (respects FREE plan 3-habit cap) ──────────────
      case "create_habit": {
        const name = String(action.name || action.title || "").trim();
        if (!name) return fail(action.type, "I need a name for the habit.");

        const sub = await prisma.subscription.findUnique({ where: { userId } });
        if (sub?.plan === "FREE") {
          const count = await prisma.habit.count({ where: { userId, isArchived: false } });
          if (count >= 3) {
            return fail(action.type, "You're on the Free plan (limited to 3 habits). Upgrade to Pro for unlimited habits.");
          }
        }

        const frequency = VALID_FREQUENCIES.has(action.frequency) ? action.frequency : "DAILY";
        const habit = await prisma.habit.create({
          data: {
            userId,
            name,
            description: typeof action.description === "string" ? action.description : undefined,
            icon: typeof action.icon === "string" && action.icon ? action.icon : "✅",
            color: typeof action.color === "string" && action.color ? action.color : "#6366f1",
            frequency: frequency as any,
          },
        });
        return ok(action.type, `Created habit "${habit.name}".`, { id: habit.id, name: habit.name });
      }

      // ── Create task ────────────────────────────────────────────────
      case "create_task": {
        const title = String(action.title || action.name || "").trim();
        if (!title) return fail(action.type, "I need a title for the task.");
        const priority = VALID_PRIORITIES.has(action.priority) ? action.priority : "MEDIUM";
        const task = await prisma.task.create({
          data: {
            userId,
            title,
            description: typeof action.description === "string" ? action.description : undefined,
            priority: priority as any,
            dueDate: parseDate(action.dueDate),
          },
        });
        return ok(action.type, `Added task "${task.title}".`, { id: task.id, title: task.title });
      }

      // ── Create goal (with optional milestones) ─────────────────────
      case "create_goal": {
        const title = String(action.title || action.name || "").trim();
        if (!title) return fail(action.type, "I need a title for the goal.");
        const milestones: string[] = Array.isArray(action.milestones)
          ? action.milestones.filter((m: any) => typeof m === "string" && m.trim()).slice(0, 8)
          : [];
        const goal = await prisma.goal.create({
          data: {
            userId,
            title,
            description: typeof action.description === "string" ? action.description : undefined,
            type: "LONG_TERM",
            targetDate: parseDate(action.targetDate),
            milestones: milestones.length
              ? { create: milestones.map((m, i) => ({ userId, title: m.trim(), order: i })) }
              : undefined,
          },
          include: { milestones: true },
        });
        return ok(
          action.type,
          `Created goal "${goal.title}"${milestones.length ? ` with ${milestones.length} milestone${milestones.length === 1 ? "" : "s"}` : ""}.`,
          { id: goal.id, title: goal.title, milestones: milestones.length },
        );
      }

      // ── Create journal entry ───────────────────────────────────────
      case "create_journal_entry": {
        const content = String(action.content || "").trim();
        if (!content) return fail(action.type, "I need some content for the journal entry.");
        const mood = Number.isFinite(action.mood) ? clamp(Math.round(action.mood), 1, 10) : undefined;
        const tags = Array.isArray(action.tags)
          ? action.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 10)
          : [];
        const entry = await prisma.journalEntry.create({
          data: {
            userId,
            title: typeof action.title === "string" ? action.title : undefined,
            content,
            mood,
            tags,
            type: "DAILY",
            wordCount: content.split(/\s+/).filter(Boolean).length,
          },
        });
        await prisma.user.update({ where: { id: userId }, data: { xp: { increment: 15 } } });
        return ok(action.type, "Saved a new journal entry.", { id: entry.id });
      }

      // ── Log mood (upsert today) ────────────────────────────────────
      case "log_mood": {
        const score = clamp(Math.round(Number(action.score)), 1, 10);
        if (!Number.isFinite(score)) return fail(action.type, "I need a mood score from 1 to 10.");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const emotions = Array.isArray(action.emotions) ? action.emotions.filter((e: any) => typeof e === "string") : [];
        const factors = Array.isArray(action.factors) ? action.factors.filter((f: any) => typeof f === "string") : [];
        const mood = await prisma.moodLog.upsert({
          where: { userId_date: { userId, date: today } },
          update: {
            score,
            emoji: typeof action.emoji === "string" ? action.emoji : undefined,
            label: typeof action.label === "string" ? action.label : undefined,
            emotions,
            factors,
            notes: typeof action.notes === "string" ? action.notes : undefined,
          },
          create: {
            userId,
            score,
            emoji: typeof action.emoji === "string" ? action.emoji : undefined,
            label: typeof action.label === "string" ? action.label : undefined,
            emotions,
            factors,
            notes: typeof action.notes === "string" ? action.notes : undefined,
            date: today,
          },
        });
        await prisma.user.update({ where: { id: userId }, data: { xp: { increment: 5 } } });
        return ok(action.type, `Logged your mood at ${score}/10.`, { id: mood.id, score });
      }

      // ── Complete an existing habit for today ───────────────────────
      case "complete_habit": {
        const name = String(action.name || action.title || "").trim();
        if (!name) return fail(action.type, "Which habit should I mark done?");
        const habit = await findByName(
          await prisma.habit.findMany({ where: { userId, isArchived: false }, select: { id: true, name: true } }),
          name,
          (h) => h.name,
        );
        if (!habit) return fail(action.type, `I couldn't find a habit called "${name}".`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.habitLog.upsert({
          where: { habitId_date: { habitId: habit.id, date: today } },
          update: { completed: true },
          create: { userId, habitId: habit.id, date: today, completed: true },
        });
        await recalcStreak(habit.id);
        return ok(action.type, `Marked "${habit.name}" done for today.`, { id: habit.id });
      }

      // ── Complete an existing task ──────────────────────────────────
      case "complete_task": {
        const title = String(action.title || action.name || "").trim();
        if (!title) return fail(action.type, "Which task should I complete?");
        const task = await findByName(
          await prisma.task.findMany({
            where: { userId, isDeleted: false, status: { not: "DONE" } },
            select: { id: true, title: true },
          }),
          title,
          (t) => t.title,
        );
        if (!task) return fail(action.type, `I couldn't find an open task called "${title}".`);
        await prisma.task.update({
          where: { id: task.id },
          data: { status: "DONE", completedAt: new Date() },
        });
        return ok(action.type, `Completed "${task.title}".`, { id: task.id });
      }

      // ── DESTRUCTIVE: wipe all content ──────────────────────────────
      case "reset_data": {
        const counts = await resetUserData(userId);
        return ok(action.type, "Your data has been reset — you're starting fresh.", counts);
      }

      // ── DESTRUCTIVE: delete the whole account ──────────────────────
      case "delete_account": {
        await prisma.user.delete({ where: { id: userId } });
        return ok(action.type, "Your account has been permanently deleted.", { deleted: true });
      }

      default:
        return fail((action as any).type, "I don't know how to do that yet.");
    }
  } catch (e: any) {
    console.error(`executeAction(${action.type}) failed:`, e);
    return fail(action.type, "Something went wrong performing that action.");
  }
}

/** Execute a batch, preserving order. */
export async function executeActions(userId: string, actions: NovusAction[]): Promise<ActionResult[]> {
  const results: ActionResult[] = [];
  for (const action of actions) {
    // Stop after an account deletion — the user no longer exists.
    results.push(await executeAction(userId, action));
    if (action.type === "delete_account" && results[results.length - 1].ok) break;
  }
  return results;
}

// ════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════

function ok(type: NovusActionType, summary: string, data?: any): ActionResult {
  return { type, ok: true, summary, data };
}
function fail(type: NovusActionType, error: string): ActionResult {
  return { type, ok: false, summary: error, error };
}
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Case-insensitive best-effort match: exact first, then substring. */
function findByName<T>(items: T[], query: string, getName: (t: T) => string): T | null {
  const q = query.toLowerCase().trim();
  return (
    items.find((i) => getName(i).toLowerCase() === q) ||
    items.find((i) => getName(i).toLowerCase().includes(q)) ||
    items.find((i) => q.includes(getName(i).toLowerCase())) ||
    null
  );
}

/**
 * Recompute a habit's streak from its completed logs (date-based).
 * Mirrors the logic in /api/habits.
 */
async function recalcStreak(habitId: string) {
  const logs = await prisma.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  if (!logs.length) {
    await prisma.habit.update({ where: { id: habitId }, data: { currentStreak: 0 } });
    return;
  }
  const days = Array.from(
    new Set(logs.map((l) => { const d = new Date(l.date); d.setHours(0, 0, 0, 0); return d.getTime(); })),
  ).sort((a, b) => b - a);

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const todayTs = now.getTime();
  const yesterdayTs = todayTs - 86400000;

  if (days[0] !== todayTs && days[0] !== yesterdayTs) {
    await prisma.habit.update({ where: { id: habitId }, data: { currentStreak: 0 } });
    return;
  }
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 86400000) streak++;
    else break;
  }
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { longestStreak: true },
  });
  await prisma.habit.update({
    where: { id: habitId },
    data: {
      currentStreak: streak,
      longestStreak: Math.max(streak, habit?.longestStreak ?? 0),
      totalCompletions: await prisma.habitLog.count({ where: { habitId, completed: true } }),
    },
  });
}

/**
 * Delete ALL of a user's content while keeping their account, settings, and
 * subscription intact. Runs in a transaction. Children are removed before (or
 * together with) parents; FK cascades handle the rest.
 */
export async function resetUserData(userId: string): Promise<Record<string, number>> {
  return prisma.$transaction(async (tx) => {
    const counts: Record<string, number> = {};
    const del = async (key: string, fn: () => Promise<{ count: number }>) => {
      counts[key] = (await fn()).count;
    };

    // Leaf / log tables first
    await del("habitLogs", () => tx.habitLog.deleteMany({ where: { userId } }));
    await del("moodLogs", () => tx.moodLog.deleteMany({ where: { userId } }));
    await del("journalEntries", () => tx.journalEntry.deleteMany({ where: { userId } }));

    // Workouts (sessions cascade their sets; templates cascade their exercises)
    await del("workoutSessions", () => tx.workoutSession.deleteMany({ where: { userId } }));
    await del("workoutTemplates", () => tx.workoutTemplate.deleteMany({ where: { userId } }));
    await del("workoutPrograms", () => tx.workoutProgram.deleteMany({ where: { userId } }));
    await del("customExercises", () => tx.exercise.deleteMany({ where: { userId } }));

    // Goals (milestones cascade)
    await del("goalMilestones", () => tx.goalMilestone.deleteMany({ where: { userId } }));
    await del("goals", () => tx.goal.deleteMany({ where: { userId } }));
    await del("goalCategories", () => tx.goalCategory.deleteMany({ where: { userId } }));

    // Tasks — clear self-referencing parent links first to avoid FK restrict
    await tx.task.updateMany({ where: { userId }, data: { parentId: null } });
    await del("tasks", () => tx.task.deleteMany({ where: { userId } }));
    await del("taskCategories", () => tx.taskCategory.deleteMany({ where: { userId } }));

    // Habits (logs already gone) + categories
    await del("habits", () => tx.habit.deleteMany({ where: { userId } }));
    await del("habitCategories", () => tx.habitCategory.deleteMany({ where: { userId } }));

    // Projects (tasks + notes cascade)
    await del("projectTasks", () => tx.projectTask.deleteMany({ where: { userId } }));
    await del("projectNotes", () => tx.projectNote.deleteMany({ where: { userId } }));
    await del("projects", () => tx.project.deleteMany({ where: { userId } }));

    // Finance (transactions cascade from accounts; delete explicitly anyway)
    await del("transactions", () => tx.financeTransaction.deleteMany({ where: { userId } }));
    await del("budgets", () => tx.financeBudget.deleteMany({ where: { userId } }));
    await del("financeAccounts", () => tx.financeAccount.deleteMany({ where: { userId } }));

    // Derived / meta
    await del("timelineEvents", () => tx.timelineEvent.deleteMany({ where: { userId } }));
    await del("notifications", () => tx.notification.deleteMany({ where: { userId } }));
    await del("aiReports", () => tx.aIReport.deleteMany({ where: { userId } }));
    await del("lifeScores", () => tx.lifeScore.deleteMany({ where: { userId } }));
    await del("statistics", () => tx.statistics.deleteMany({ where: { userId } }));
    await del("achievements", () => tx.userAchievement.deleteMany({ where: { userId } }));

    // Reset gamification on the user record
    await tx.user.update({
      where: { id: userId },
      data: { xp: 0, level: 1, title: "Beginner" },
    });

    return counts;
  });
}
