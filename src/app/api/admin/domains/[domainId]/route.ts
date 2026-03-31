import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/domains/[domainId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { domainId: string } }
) {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.approvedDomain.delete({ where: { id: params.domainId } });
  return NextResponse.json({ success: true });
}
