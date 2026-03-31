import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { todoId: string } }
) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, assigneeName, dueDate, completed } = await req.json();

    const todo = await prisma.todo.update({
      where: { id: params.todoId },
      data: {
        ...(title !== undefined && { title }),
        ...(assigneeName !== undefined && { assigneeName: assigneeName || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json(todo);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { todoId: string } }
) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.todo.delete({ where: { id: params.todoId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
