import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true },
      },
      _count: {
        select: { messages: true, todos: true },
      },
      todos: {
        select: { completed: true },
      },
    },
  });

  if (!project) notFound();

  const totalTodos = project._count.todos;
  const completedTodos = project.todos.filter((t) => t.completed).length;
  const progressPct = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← All projects
      </Link>

      {/* Project heading */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
      </div>

      {project.description && (
        <p className="text-gray-600 mb-8 -mt-4">{project.description}</p>
      )}

      {/* Two section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Message Board */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Message Board</h2>
            <span className="text-sm text-gray-400">{project._count.messages} messages</span>
          </div>

          {project.messages.length > 0 ? (
            <ul className="space-y-1.5 mb-4">
              {project.messages.map((msg) => (
                <li key={msg.id}>
                  <Link
                    href={`/projects/${params.id}/messages/${msg.id}`}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors truncate block"
                  >
                    {msg.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No messages yet.</p>
          )}

          <Link
            href={`/projects/${params.id}/messages`}
            className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            View Message Board →
          </Link>
        </div>

        {/* To-Dos */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">To-Dos</h2>
            <span className="text-sm text-gray-400">
              {completedTodos} of {totalTodos} complete
            </span>
          </div>

          {totalTodos > 0 ? (
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPct}%`, backgroundColor: project.color }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progressPct}% complete</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No to-dos yet.</p>
          )}

          <Link
            href={`/projects/${params.id}/todos`}
            className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            View To-Dos →
          </Link>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 bg-red-50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-500 mb-3">
          Deleting a project is permanent and will remove all messages, replies, and to-dos.
        </p>
        <DeleteButton
          url={`/api/projects/${params.id}`}
          redirectTo="/"
          label="Delete this project"
          confirmMessage={`Delete "${project.name}"? This will permanently remove all messages, replies, and to-dos.`}
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        />
      </div>
    </div>
  );
}
