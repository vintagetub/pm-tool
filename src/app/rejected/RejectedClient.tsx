"use client";

import { signOut } from "next-auth/react";

export default function RejectedClient({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-1">
            Hi <span className="font-medium text-gray-700">{name}</span>, your account request for{" "}
            <span className="font-medium text-gray-700">{email}</span> has been denied.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            If you believe this is a mistake, please contact your administrator.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
