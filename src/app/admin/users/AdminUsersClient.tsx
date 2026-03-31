"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  USER: "bg-gray-100 text-gray-700",
};

export default function AdminUsersClient({
  users: initialUsers,
  currentUserId,
  initialFilter,
}: {
  users: User[];
  currentUserId: string;
  initialFilter: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (filter === "pending") return u.status === "PENDING";
    if (filter === "approved") return u.status === "APPROVED";
    if (filter === "rejected") return u.status === "REJECTED";
    return true;
  });

  async function updateUser(userId: string, patch: { status?: string; role?: string }) {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } finally {
      setLoading(null);
    }
  }

  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {pendingCount > 0 && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              filter === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No users found.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                const isLoading = loading === user.id;
                return (
                  <tr key={user.id} className={isSelf ? "bg-blue-50" : ""}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 text-xs text-blue-600">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status] ?? ""}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? ""}`}
                        >
                          {user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={isLoading}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USER">User</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <div className="flex items-center gap-2 justify-end">
                          {user.status === "PENDING" && (
                            <>
                              <button
                                disabled={isLoading}
                                onClick={() => updateUser(user.id, { status: "APPROVED" })}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => updateUser(user.id, { status: "REJECTED" })}
                                className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                Deny
                              </button>
                            </>
                          )}
                          {user.status === "APPROVED" && (
                            <button
                              disabled={isLoading}
                              onClick={() => updateUser(user.id, { status: "REJECTED" })}
                              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                          {user.status === "REJECTED" && (
                            <button
                              disabled={isLoading}
                              onClick={() => updateUser(user.id, { status: "APPROVED" })}
                              className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                            >
                              Re-approve
                            </button>
                          )}
                          <button
                            disabled={isLoading}
                            onClick={() => deleteUser(user.id)}
                            className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
