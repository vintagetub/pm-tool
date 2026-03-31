import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <AdminUsersClient
      users={users}
      currentUserId={session.user.id}
      initialFilter={searchParams.filter ?? "all"}
    />
  );
}
