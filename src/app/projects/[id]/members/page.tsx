import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ProjectMembersClient from "./ProjectMembersClient";

export default async function ProjectMembersPage({
  params,
}: {
  params: { id: string };
}) {
  const stackUser = await stackServerApp.getUser({ or: "redirect" });
  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.status === "PENDING") redirect("/pending");
  if (appUser.status === "REJECTED") redirect("/rejected");

  if (!["ADMIN", "MANAGER"].includes(appUser.role)) {
    redirect(`/projects/${params.id}`);
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, color: true },
  });
  if (!project) notFound();

  const [members, allUsers] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← {project.name}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-2xl font-bold text-gray-900">Manage Members</h1>
      </div>

      <ProjectMembersClient
        projectId={params.id}
        members={members.map((m) => m.user)}
        allUsers={allUsers}
      />
    </div>
  );
}
