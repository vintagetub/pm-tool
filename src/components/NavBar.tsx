"use client";

import { useUser } from "@stackframe/stack";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  USER: "User",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-600",
};

export default function NavBar() {
  const user = useUser();

  if (!user) return null;

  const meta = (user.clientMetadata ?? {}) as Record<string, string>;
  const role = meta.role ?? "USER";
  const displayName = user.displayName ?? user.primaryEmail ?? "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
            Basecamp
          </Link>
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-3 py-1 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex ${ROLE_COLORS[role] ?? ""}`}
          >
            {ROLE_LABELS[role] ?? role}
          </span>
          <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <button
            onClick={() => user.signOut()}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
