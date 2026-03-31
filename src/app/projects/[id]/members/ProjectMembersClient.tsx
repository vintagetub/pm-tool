"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  USER: "User",
};

export default function ProjectMembersClient({
  projectId,
  members: initialMembers,
  allUsers,
}: {
  projectId: string;
  members: User[];
  allUsers: User[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const memberIds = new Set(members.map((m) => m.id));
  const nonMembers = allUsers.filter((u) => !memberIds.has(u.id));

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add member");
        return;
      }
      setMembers((prev) => [...prev, data.user]);
      setSelectedUserId("");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(userId: string) {
    setRemoving(userId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
      }
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add member form */}
      {nonMembers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Add Member</h2>
          <form onSubmit={addMember} className="flex gap-3">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {nonMembers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — {ROLE_LABELS[u.role] ?? u.role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding || !selectedUserId}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </form>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Current members list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Members{" "}
            <span className="text-gray-400 font-normal text-sm">({members.length})</span>
          </h2>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400 px-5 py-8 text-center">No members yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{ROLE_LABELS[m.role] ?? m.role}</span>
                  <button
                    disabled={removing === m.id}
                    onClick={() => removeMember(m.id)}
                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
