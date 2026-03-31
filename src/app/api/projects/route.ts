import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "MANAGER"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, description, color } = await req.json();
    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        color,
        createdById: appUser.id,
        members: {
          create: { userId: appUser.id },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
