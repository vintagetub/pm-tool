import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditMessageClient from "./EditMessageClient";

export default async function EditMessagePage({
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
    select: { id: true, title: true, body: true, authorId: true, projectId: true },
  });

  if (!message || message.projectId !== params.id) notFound();
  if (message.authorId !== appUser.id) redirect(`/projects/${params.id}/messages/${params.msgId}`);

  return (
    <EditMessageClient
      projectId={params.id}
      msgId={params.msgId}
      initialTitle={message.title}
      initialBody={message.body}
    />
  );
}
