"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/dashboard-nav";
import { DashboardLogoutButton } from "@/components/dashboard/DashboardLogoutButton";

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch gap-2 border-b border-white/10 bg-slate-900/40 px-3 py-2.5 lg:hidden">
      <nav
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5"
        aria-label="Dashboard mobile"
      >
        {DASHBOARD_NAV_ITEMS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || (href === "/dashboard/overview" && pathname === "/dashboard");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                active
                  ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100"
                  : "border-white/10 text-slate-200 hover:border-cyan-300/35 hover:bg-white/5 hover:text-cyan-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition ${active ? "text-cyan-200" : "text-slate-500 group-hover:text-cyan-200/90"}`}
                strokeWidth={1.5}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex shrink-0 items-center border-l border-white/10 pl-2">
        <DashboardLogoutButton variant="mobile" />
      </div>
    </div>
  );
}
