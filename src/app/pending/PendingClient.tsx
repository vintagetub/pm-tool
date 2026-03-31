"use client";

import { useUser } from "@stackframe/stack";

export default function PendingClient({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const user = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
          <p className="text-gray-500 text-sm mb-1">
            Hi <span className="font-medium text-gray-700">{name}</span>, your account for{" "}
            <span className="font-medium text-gray-700">{email}</span> is waiting for an admin to review it.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            You&apos;ll be able to sign in once your account is approved. Please check back later.
          </p>
        </div>
        <button
          onClick={() => user?.signOut()}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
