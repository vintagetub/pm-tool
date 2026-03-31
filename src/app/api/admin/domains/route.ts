import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";

// GET /api/admin/domains — list all approved domains
export async function GET() {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const domains = await prisma.approvedDomain.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(domains);
}

// POST /api/admin/domains — add an approved domain
export async function POST(req: NextRequest) {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { domain } = await req.json();
  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  // Normalize: strip leading @, whitespace, lowercase
  const normalized = domain.replace(/^@/, "").trim().toLowerCase();
  if (!normalized || normalized.includes(" ") || !normalized.includes(".")) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  try {
    const created = await prisma.approvedDomain.create({
      data: { domain: normalized },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Domain already exists" },
      { status: 409 }
    );
  }
}
