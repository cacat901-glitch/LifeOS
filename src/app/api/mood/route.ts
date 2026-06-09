import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/mood - Get mood logs
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const moods = await prisma.moodLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: since },
      },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const avg = moods.length
      ? moods.reduce((sum, m) => sum + m.score, 0) / moods.length
      : 0;

    return NextResponse.json({
      entries: moods,
      stats: {
        average: Math.round(avg * 10) / 10,
        total: moods.length,
        highest: moods.length ? Math.max(...moods.map((m) => m.score)) : 0,
        lowest: moods.length ? Math.min(...moods.map((m) => m.score)) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching mood logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/mood - Log mood
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { score, emoji, label, emotions, notes, factors } = body;

    if (!score || score < 1 || score > 10) {
      return NextResponse.json({ error: "Score must be between 1 and 10" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await prisma.moodLog.upsert({
      where: {
        userId_date: { userId: session.user.id, date: today },
      },
      update: {
        score,
        emoji,
        label,
        emotions: emotions || [],
        notes,
        factors: factors || [],
      },
      create: {
        userId: session.user.id,
        score,
        emoji,
        label,
        emotions: emotions || [],
        notes,
        factors: factors || [],
        date: today,
      },
    });

    // Award XP
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 5 } },
    });

    return NextResponse.json(mood, { status: 201 });
  } catch (error) {
    console.error("Error logging mood:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
