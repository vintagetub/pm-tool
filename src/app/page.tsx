import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const stackUser = await stackServerApp.getUser({ or: "redirect" });
  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.status === "PENDING") redirect("/pending");
  if (appUser.status === "REJECTED") redirect("/rejected");

  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(appUser.role);

  // Admins and Managers see all projects; Users see only their assigned projects
  const projects = await prisma.project.findMany({
    where: isAdminOrManager
      ? undefined
      : {
          members: {
            some: { userId: appUser.id },
          },
        },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          messages: true,
          todos: true,
        },
      },
      todos: {
        where: { completed: false },
        select: { id: true },
      },
    },
  });

  const totalProjects = projects.length;
  const totalOpenTodos = projects.reduce((sum, p) => sum + p.todos.length, 0);
  const totalMessages = projects.reduce((sum, p) => sum + p._count.messages, 0);

  const serialized = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    color: p.color,
    openTodosCount: p.todos.length,
    messagesCount: p._count.messages,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Projects", value: totalProjects },
          { label: "Open to-dos", value: totalOpenTodos },
          { label: "Messages", value: totalMessages },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        {isAdminOrManager && <DashboardClient />}
      </div>

      {/* Project grid */}
      {serialized.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-600">No projects yet</p>
          <p className="text-sm mt-1">
            {isAdminOrManager
              ? "Create your first project to get started."
              : "You haven't been added to any projects yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serialized.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
                {/* Color stripe */}
                <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />
                <div className="p-5">
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{project.openTodosCount}</span> open to-dos
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{project.messagesCount}</span> messages
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
