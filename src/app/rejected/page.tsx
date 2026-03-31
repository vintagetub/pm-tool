import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RejectedClient from "./RejectedClient";

export default async function RejectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.status === "APPROVED") redirect("/");
  if (session.user.status === "PENDING") redirect("/pending");

  return <RejectedClient name={session.user.name} email={session.user.email} />;
}
