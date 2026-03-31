import { prisma } from "@/lib/prisma";
import AdminDomainsClient from "./AdminDomainsClient";

export default async function AdminDomainsPage() {
  const domains = await prisma.approvedDomain.findMany({
    orderBy: { createdAt: "asc" },
  });

  return <AdminDomainsClient domains={domains} />;
}
