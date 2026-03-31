import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[userId] — update status and/or role (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent admins from modifying their own role/status
  if (params.userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot modify your own account from the admin panel" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { status, role } = body;

  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
  const validRoles = ["ADMIN", "MANAGER", "USER"];

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/users/[userId] — remove a user (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id: params.userId } });
  return NextResponse.json({ success: true });
}
