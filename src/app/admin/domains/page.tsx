import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDomainsClient from "./AdminDomainsClient";

export default async function AdminDomainsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const domains = await prisma.approvedDomain.findMany({
    orderBy: { createdAt: "asc" },
  });

  return <AdminDomainsClient domains={domains} />;
}
