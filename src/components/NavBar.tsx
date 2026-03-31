"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: session } = useSession();

  if (!session) return null;

  const initials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          Basecamp
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{session.user.name}</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
