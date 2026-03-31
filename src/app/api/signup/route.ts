import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Extract the domain from the email
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if this is the very first user — make them ADMIN + APPROVED automatically
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role: "ADMIN", status: "APPROVED" },
        select: { id: true, name: true, email: true, role: true, status: true },
      });
      return NextResponse.json(
        { ...user, message: "Account created. You are the first user and have been granted admin access." },
        { status: 201 }
      );
    }

    // Check domain against approved list
    const approvedDomain = await prisma.approvedDomain.findUnique({
      where: { domain },
    });

    if (!approvedDomain) {
      // Domain not approved — auto-reject
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: { name, email, password: hashed, role: "USER", status: "REJECTED" },
      });
      return NextResponse.json(
        { error: "Your email domain is not authorized to access this application." },
        { status: 403 }
      );
    }

    // Domain is approved — create user as PENDING for admin review
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER", status: "PENDING" },
      select: { id: true, name: true, email: true, status: true },
    });

    return NextResponse.json(
      { ...user, message: "Account created. Your account is pending admin approval." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
