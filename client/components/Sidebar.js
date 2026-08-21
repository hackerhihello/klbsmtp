"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/create-org", label: "Create Organization" },
  { href: "/dashboard/orgs", label: "Organization List" },
  { href: "/dashboard/logs", label: "Email Logs" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-900 p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <nav className="mt-5 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded px-3 py-2 text-sm ${
              pathname === link.href ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-6 w-full rounded border border-slate-700 px-3 py-2 text-sm text-slate-200"
      >
        Logout
      </button>
    </aside>
  );
}
