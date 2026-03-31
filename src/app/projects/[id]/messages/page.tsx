import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MessagesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, color: true },
  });

  if (!project) notFound();

  const messages = await prisma.message.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← {project.name}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-xl font-semibold text-gray-900">Message Board</h1>
        </div>
        <Link
          href={`/projects/${params.id}/messages/new`}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Message
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-3xl mb-3">💬</p>
          <p className="font-medium text-gray-600">No messages yet</p>
          <p className="text-sm mt-1">Start the conversation.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {messages.map((msg) => (
            <Link key={msg.id} href={`/projects/${params.id}/messages/${msg.id}`}>
              <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {msg.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{msg.author.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {msg._count.comments > 0 && (
                    <span className="text-xs text-gray-400">
                      {msg._count.comments} {msg._count.comments === 1 ? "reply" : "replies"}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
