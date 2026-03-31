import type { Metadata } from "next";
import "./globals.css";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Basecamp — Project Management",
  description: "Internal project management tool inspired by Basecamp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <NavBar />
            <main className="min-h-screen">{children}</main>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
