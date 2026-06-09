import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/notifications – mark read
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/notifications – clear all
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ message: "Cleared" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
