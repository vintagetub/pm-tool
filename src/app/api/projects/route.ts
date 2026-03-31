import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        createdById: session.user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
