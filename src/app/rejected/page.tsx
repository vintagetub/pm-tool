import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { redirect } from "next/navigation";
import RejectedClient from "./RejectedClient";

export default async function RejectedPage() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) redirect("/handler/sign-in");

  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.status === "APPROVED") redirect("/");
  if (appUser.status === "PENDING") redirect("/pending");

  return <RejectedClient name={appUser.name} email={appUser.email} />;
}
