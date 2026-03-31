import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { body } = await req.json();
    if (!body) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        body,
        messageId: params.msgId,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
