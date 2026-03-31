import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { redirect } from "next/navigation";
import PendingClient from "./PendingClient";

export default async function PendingPage() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) redirect("/handler/sign-in");

  // Provision the user if they haven't been provisioned yet
  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.status === "APPROVED") redirect("/");
  if (appUser.status === "REJECTED") redirect("/rejected");

  return <PendingClient name={appUser.name} email={appUser.email} />;
}
