import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, body } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        title,
        body,
        projectId: params.id,
        authorId: appUser.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
