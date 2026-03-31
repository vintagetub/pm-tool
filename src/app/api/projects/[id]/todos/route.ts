import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, assigneeName, dueDate } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        assigneeName: assigneeName || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: params.id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
