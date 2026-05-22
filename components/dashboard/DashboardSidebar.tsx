"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/dashboard/dashboard-nav";
import { DashboardLogoutButton } from "@/components/dashboard/DashboardLogoutButton";
import { ProjectionsNavSection } from "@/components/dashboard/ProjectionsNavSection";

const NAV_BEFORE_PROJECTIONS = DASHBOARD_NAV_ITEMS.slice(0, 3);
const NAV_AFTER_PROJECTIONS = DASHBOARD_NAV_ITEMS.slice(3);

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-6 lg:flex">
      <Link href="/dashboard/overview" className="group block shrink-0">
        <p className="text-xl font-semibold text-foreground transition group-hover:text-cyan-500">
          MyFinances
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Finance Dashboard</p>
      </Link>
      <nav className="mt-8 min-h-0 flex-1 space-y-1.5 overflow-y-auto text-sm" aria-label="Dashboard">
        {NAV_BEFORE_PROJECTIONS.map(({ href, label, Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                active
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                  : "border-transparent text-muted-foreground hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-400"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition ${
                  active
                    ? "text-cyan-400"
                    : "text-faint group-hover:text-cyan-400"
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
        <ProjectionsNavSection pathname={pathname} variant="sidebar" />
        {NAV_AFTER_PROJECTIONS.map(({ href, label, Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                active
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                  : "border-transparent text-muted-foreground hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-400"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition ${
                  active
                    ? "text-cyan-400"
                    : "text-faint group-hover:text-cyan-400"
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 shrink-0 border-t border-border pt-6">
        <DashboardLogoutButton variant="sidebar" />
      </div>
    </aside>
  );
}
