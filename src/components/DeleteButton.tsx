"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  url: string;
  redirectTo?: string;
  label?: string;
  confirmMessage?: string;
  onDeleted?: () => void;
  className?: string;
}

export default function DeleteButton({
  url,
  redirectTo,
  label = "Delete",
  confirmMessage = "Are you sure? This cannot be undone.",
  onDeleted,
  className,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      await fetch(url, { method: "DELETE" });
      if (onDeleted) {
        onDeleted();
      } else if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={
        className ??
        "text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
      }
    >
      {loading ? "Deleting…" : label}
    </button>
  );
}
