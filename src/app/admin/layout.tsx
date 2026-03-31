import { stackServerApp } from "@/stack";
import { getOrProvisionAppUser } from "@/lib/getAppUser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stackUser = await stackServerApp.getUser({ or: "redirect" });
  const appUser = await getOrProvisionAppUser(stackUser);

  if (appUser.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Admin breadcrumb nav */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Admin</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/domains", label: "Approved Domains" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
