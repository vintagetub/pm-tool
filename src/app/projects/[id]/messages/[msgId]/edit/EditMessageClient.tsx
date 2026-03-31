"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  projectId: string;
  msgId: string;
  initialTitle: string;
  initialBody: string;
}

export default function EditMessageClient({ projectId, msgId, initialTitle, initialBody }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/messages/${msgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update message");
        return;
      }

      router.push(`/projects/${projectId}/messages/${msgId}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/projects/${projectId}/messages/${msgId}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← Back to message
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Message</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !title.trim() || !body.trim()}
              className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <Link
              href={`/projects/${projectId}/messages/${msgId}`}
              className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
