import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [pendingCount, totalUsers, approvedDomains] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.approvedDomain.count(),
  ]);

  const recentPending = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500 mt-1">Pending approvals</p>
          {pendingCount > 0 && (
            <Link
              href="/admin/users?filter=pending"
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Review now →
            </Link>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">Total users</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-3xl font-bold text-gray-900">{approvedDomains}</p>
          <p className="text-sm text-gray-500 mt-1">Approved domains</p>
          {approvedDomains === 0 && (
            <Link
              href="/admin/domains"
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Add a domain →
            </Link>
          )}
        </div>
      </div>

      {/* Recent pending users */}
      {recentPending.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            <Link
              href="/admin/users?filter=pending"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentPending.map((user) => (
              <li key={user.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentPending.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-green-700 font-medium text-sm">All caught up!</p>
          <p className="text-green-600 text-xs mt-1">No users are waiting for approval.</p>
        </div>
      )}
    </div>
  );
}
