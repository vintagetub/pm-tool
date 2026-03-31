"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  msgId: string;
}

export default function CommentForm({ projectId, msgId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/messages/${msgId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply…"
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
