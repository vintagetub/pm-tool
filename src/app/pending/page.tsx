import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import PendingClient from "./PendingClient";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login
  if (!session) redirect("/login");

  // If approved or admin, redirect to home
  if (session.user.status === "APPROVED") redirect("/");

  // If rejected, redirect to rejected page
  if (session.user.status === "REJECTED") redirect("/rejected");

  return <PendingClient name={session.user.name} email={session.user.email} />;
}
