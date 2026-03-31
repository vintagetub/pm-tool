import "server-only";
import { stackServerApp } from "@/stack";
import { prisma } from "@/lib/prisma";

type AppUser = {
  id: string;
  stackAuthId: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

/**
 * Returns the current authenticated app user from our DB, or null if not authenticated.
 * Does NOT provision — call getOrProvisionAppUser for first-time users.
 */
export async function getAppUser(): Promise<AppUser | null> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return null;

  return prisma.user.findUnique({
    where: { stackAuthId: stackUser.id },
  });
}

/**
 * Returns the current user, creating a DB record on first sign-in.
 * Applies domain-based approval logic during provisioning.
 */
export async function getOrProvisionAppUser(
  stackUser: Awaited<ReturnType<typeof stackServerApp.getUser>>
): Promise<AppUser> {
  if (!stackUser) throw new Error("Not authenticated");

  const existing = await prisma.user.findUnique({
    where: { stackAuthId: stackUser.id },
  });
  if (existing) return existing;

  const email = stackUser.primaryEmail;
  if (!email) throw new Error("User has no email");

  const domain = email.split("@")[1]?.toLowerCase();
  const userCount = await prisma.user.count();

  let role: "ADMIN" | "USER" = "USER";
  let status: "APPROVED" | "PENDING" | "REJECTED" = "PENDING";

  if (userCount === 0) {
    // First user becomes admin
    role = "ADMIN";
    status = "APPROVED";
  } else if (domain) {
    const approvedDomain = await prisma.approvedDomain.findUnique({
      where: { domain },
    });
    status = approvedDomain ? "PENDING" : "REJECTED";
  } else {
    status = "REJECTED";
  }

  const appUser = await prisma.user.create({
    data: {
      stackAuthId: stackUser.id,
      name: stackUser.displayName || email.split("@")[0],
      email,
      role,
      status,
    },
  });

  // Sync role/status to Stack Auth clientMetadata so middleware + client can read them
  await stackUser.update({ clientMetadata: { role, status } });

  return appUser;
}
