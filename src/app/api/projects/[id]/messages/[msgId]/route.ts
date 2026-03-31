import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const message = await prisma.message.findUnique({ where: { id: params.msgId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.authorId !== appUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, body } = await req.json();
    const updated = await prisma.message.update({
      where: { id: params.msgId },
      data: { title, body, editedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const message = await prisma.message.findUnique({ where: { id: params.msgId } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (message.authorId !== appUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.message.delete({ where: { id: params.msgId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
