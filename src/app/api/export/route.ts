import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/export?type=json|csv|markdown
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "json";
    const userId = session.user.id;

    // ── Gather all data ─────────────────────────────────────────────────────
    const [user, habits, tasks, goals, journal, moods, workouts, projects, finance] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, createdAt: true, xp: true, level: true } }),
      prisma.habit.findMany({ where: { userId, isArchived: false }, include: { logs: { orderBy: { date: "desc" }, take: 90 } } }),
      prisma.task.findMany({ where: { userId, isDeleted: false }, orderBy: { createdAt: "desc" } }),
      prisma.goal.findMany({ where: { userId }, include: { milestones: true } }),
      prisma.journalEntry.findMany({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.moodLog.findMany({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.workoutSession.findMany({ where: { userId }, include: { sets: { include: { exercise: true } } }, orderBy: { startTime: "desc" } }),
      prisma.project.findMany({ where: { userId }, include: { tasks: true, notes: true } }),
      prisma.financeTransaction.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    ]);

    // ── JSON export ──────────────────────────────────────────────────────────
    if (type === "json") {
      const payload = { exportedAt: new Date().toISOString(), user, habits, tasks, goals, journal, moods, workouts, projects, finance };
      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="novus-export-${new Date().toISOString().slice(0,10)}.json"`,
        },
      });
    }

    // ── Markdown journal export ──────────────────────────────────────────────
    if (type === "markdown") {
      const lines: string[] = [`# Novus Journal Export\n*Exported: ${new Date().toLocaleDateString()}*\n\n---\n`];
      for (const entry of journal) {
        lines.push(`## ${entry.title || "Untitled"}`);
        lines.push(`*${new Date(entry.date).toLocaleDateString()}*${entry.moodEmoji ? ` · ${entry.moodEmoji}` : ""}`);
        if (entry.tags?.length) lines.push(`\n**Tags:** ${entry.tags.join(", ")}`);
        lines.push(`\n${entry.content}\n\n---\n`);
      }
      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="novus-journal-${new Date().toISOString().slice(0,10)}.md"`,
        },
      });
    }

    // ── CSV export ───────────────────────────────────────────────────────────
    if (type === "csv") {
      const csvTarget = searchParams.get("data") || "transactions";

      if (csvTarget === "transactions") {
        const rows = [["Date","Title","Type","Amount","Category","Account","Notes"]];
        for (const tx of finance) {
          rows.push([
            new Date(tx.date).toLocaleDateString(),
            `"${tx.title.replace(/"/g, '""')}"`,
            tx.type,
            tx.amount.toFixed(2),
            tx.category,
            tx.accountId,
            `"${(tx.notes || "").replace(/"/g, '""')}"`,
          ]);
        }
        const csv = rows.map((r) => r.join(",")).join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="novus-transactions-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }

      if (csvTarget === "habits") {
        const rows = [["Habit","Frequency","Current Streak","Longest Streak","Total Completions","Created"]];
        for (const h of habits) {
          rows.push([`"${h.name}"`, h.frequency, String(h.currentStreak), String(h.longestStreak), String(h.totalCompletions), new Date(h.createdAt).toLocaleDateString()]);
        }
        const csv = rows.map((r) => r.join(",")).join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="novus-habits-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }

      if (csvTarget === "mood") {
        const rows = [["Date","Score","Label","Emotions","Factors","Notes"]];
        for (const m of moods) {
          rows.push([
            new Date(m.date).toLocaleDateString(),
            String(m.score),
            m.label || "",
            `"${m.emotions.join(", ")}"`,
            `"${m.factors.join(", ")}"`,
            `"${(m.notes || "").replace(/"/g, '""')}"`,
          ]);
        }
        const csv = rows.map((r) => r.join(",")).join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="novus-mood-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
