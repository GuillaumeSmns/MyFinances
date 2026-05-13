"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-slate-900/60 p-6 lg:block">
      <Link href="/dashboard/overview" className="group block">
        <p className="text-xl font-semibold text-white transition group-hover:text-cyan-200">MyFinances</p>
        <p className="mt-1 text-sm text-slate-400">Finance Dashboard</p>
      </Link>
      <nav className="mt-8 space-y-1.5 text-sm" aria-label="Dashboard">
        {DASHBOARD_NAV_ITEMS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || (href === "/dashboard/overview" && pathname === "/dashboard");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                active
                  ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100"
                  : "border-transparent text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-500/10 hover:text-cyan-200"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition ${
                  active ? "text-cyan-200" : "text-slate-500 group-hover:text-cyan-200/90"
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
