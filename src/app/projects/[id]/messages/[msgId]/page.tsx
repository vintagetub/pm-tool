import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import DeleteButton from "@/components/DeleteButton";

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string; msgId: string };
}) {
  const stackUser = await stackServerApp.getUser({ or: "redirect" });
  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.status === "PENDING") redirect("/pending");
  if (appUser.status === "REJECTED") redirect("/rejected");

  const message = await prisma.message.findUnique({
    where: { id: params.msgId },
    include: {
      author: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });

  if (!message || message.projectId !== params.id) notFound();

  const isAuthor = message.authorId === appUser.id;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/projects/${params.id}/messages`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← Message Board
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{message.title}</h1>
          {isAuthor && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/projects/${params.id}/messages/${params.msgId}/edit`}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Edit
              </Link>
              <DeleteButton
                url={`/api/projects/${params.id}/messages/${params.msgId}`}
                redirectTo={`/projects/${params.id}/messages`}
                label="Delete"
                confirmMessage="Delete this message and all its replies?"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
            {getInitials(message.author.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{message.author.name}</p>
            <p className="text-xs text-gray-400">
              {formatDate(message.createdAt)}
              {message.editedAt && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {message.body}
        </div>
      </div>

      {message.comments.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {message.comments.length} {message.comments.length === 1 ? "Reply" : "Replies"}
          </h2>
          {message.comments.map((comment) => {
            const isCommentAuthor = comment.authorId === appUser.id;
            return (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold">
                      {getInitials(comment.author.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{comment.author.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  {isCommentAuthor && (
                    <DeleteButton
                      url={`/api/comments/${comment.id}`}
                      label="×"
                      confirmMessage="Delete this reply?"
                      className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {comment.body}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add a reply</h3>
        <CommentForm projectId={params.id} msgId={params.msgId} />
      </div>
    </div>
  );
}
