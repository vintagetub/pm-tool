import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/projects/[id]/members/[userId] — remove a member (admin or manager)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.projectMember.deleteMany({
    where: { projectId: params.id, userId: params.userId },
  });

  return NextResponse.json({ success: true });
}
