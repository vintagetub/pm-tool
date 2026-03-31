"use client";

import { useState } from "react";

type Domain = {
  id: string;
  domain: string;
  createdAt: Date;
};

export default function AdminDomainsClient({
  domains: initialDomains,
}: {
  domains: Domain[];
}) {
  const [domains, setDomains] = useState(initialDomains);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add domain");
        return;
      }
      setDomains((prev) => [...prev, data]);
      setInput("");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeDomain(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/domains/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Approved Domains</h1>
      <p className="text-sm text-gray-500 mb-6">
        Only users with email addresses from these domains can request an account.
        Users with unapproved domains are automatically rejected.
      </p>

      {/* Add domain form */}
      <form onSubmit={addDomain} className="flex gap-3 mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="example.com"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting || !input.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding…" : "Add Domain"}
        </button>
      </form>

      {/* Domain list */}
      {domains.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <p className="text-yellow-800 font-medium text-sm">No approved domains yet</p>
          <p className="text-yellow-700 text-xs mt-1">
            Without approved domains, all new signups will be automatically rejected.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {domains.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">@{d.domain}</p>
                  <p className="text-xs text-gray-400">
                    Added {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  disabled={deleting === d.id}
                  onClick={() => removeDomain(d.id)}
                  className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
