import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const stackUser = await stackServerApp.getUser({ or: "redirect" });
  const appUser = await getOrProvisionAppUser(stackUser);

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
      currentUserId={appUser.id}
      initialFilter={searchParams.filter ?? "all"}
    />
  );
}
