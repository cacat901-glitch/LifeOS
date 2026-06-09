import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.journalEntry.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return NextResponse.json({ message: "Deleted" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const entry = await prisma.journalEntry.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: body,
  });
  return NextResponse.json(entry);
}
