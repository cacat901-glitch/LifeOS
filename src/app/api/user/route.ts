import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/user - Get current user profile + settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true, subscription: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/user - Update profile or settings
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, bio, location, timezone, currentPassword, newPassword, settings } = body;

    // Update profile fields
    if (name !== undefined || bio !== undefined || location !== undefined || timezone !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name, bio, location, timezone },
      });
    }

    // Change password
    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.password) return NextResponse.json({ error: "No password set" }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
    }

    // Update settings
    if (settings) {
      await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: settings,
        create: { userId: session.user.id, ...settings },
      });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/user - Delete account
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ message: "Account deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
