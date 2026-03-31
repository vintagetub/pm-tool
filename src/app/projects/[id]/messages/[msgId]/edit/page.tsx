import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditMessageClient from "./EditMessageClient";

export default async function EditMessagePage({
  params,
}: {
  params: { id: string; msgId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const message = await prisma.message.findUnique({
    where: { id: params.msgId },
    select: { id: true, title: true, body: true, authorId: true, projectId: true },
  });

  if (!message || message.projectId !== params.id) notFound();
  if (message.authorId !== session.user.id) redirect(`/projects/${params.id}/messages/${params.msgId}`);

  return (
    <EditMessageClient
      projectId={params.id}
      msgId={params.msgId}
      initialTitle={message.title}
      initialBody={message.body}
    />
  );
}
