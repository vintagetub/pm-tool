import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TodoList from "@/components/TodoList";

export default async function TodosPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, color: true },
  });

  if (!project) notFound();

  const todos = await prisma.todo.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      assigneeName: true,
      dueDate: true,
      completed: true,
    },
  });

  const serialized = todos.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← {project.name}
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
        <h1 className="text-xl font-semibold text-gray-900">To-Dos</h1>
      </div>

      <TodoList projectId={params.id} initialTodos={serialized} />
    </div>
  );
}
