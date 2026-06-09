import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/journal - Get journal entries
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { userId: session.user.id };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.journalEntry.count({ where });

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/journal - Create a journal entry
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, mood, moodEmoji, tags, type } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title,
        content,
        mood,
        moodEmoji,
        tags: tags || [],
        type: type || "DAILY",
        wordCount,
      },
    });

    // Award XP for journaling
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 15 } },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
