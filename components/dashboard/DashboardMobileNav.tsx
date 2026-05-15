"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@/components/dashboard/dashboard-nav";
import { DashboardLogoutButton } from "@/components/dashboard/DashboardLogoutButton";
import { ProjectionsNavSection } from "@/components/dashboard/ProjectionsNavSection";

const NAV_BEFORE_PROJECTIONS = DASHBOARD_NAV_ITEMS.slice(0, 3);
const NAV_AFTER_PROJECTIONS = DASHBOARD_NAV_ITEMS.slice(3);

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/10 bg-slate-900/40 mf-light:border-slate-200 mf-light:bg-white/80 lg:hidden">
      <div className="flex items-stretch gap-2 px-3 py-2.5">
        <nav
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5"
          aria-label="Dashboard mobile"
        >
          {NAV_BEFORE_PROJECTIONS.map(({ href, label, Icon }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100 mf-light:border-cyan-400/50 mf-light:bg-cyan-500/10 mf-light:text-cyan-900"
                    : "border-white/10 text-slate-200 hover:border-cyan-300/35 hover:bg-white/5 hover:text-cyan-100 mf-light:border-slate-200 mf-light:text-slate-700 mf-light:hover:border-cyan-400/40 mf-light:hover:bg-cyan-500/5 mf-light:hover:text-cyan-800"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition ${
                    active
                      ? "text-cyan-200 mf-light:text-cyan-700"
                      : "text-slate-500 group-hover:text-cyan-200/90 mf-light:group-hover:text-cyan-700"
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
                {label}
              </Link>
            );
          })}
          <ProjectionsNavSection pathname={pathname} variant="mobile" />
          {NAV_AFTER_PROJECTIONS.map(({ href, label, Icon }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100 mf-light:border-cyan-400/50 mf-light:bg-cyan-500/10 mf-light:text-cyan-900"
                    : "border-white/10 text-slate-200 hover:border-cyan-300/35 hover:bg-white/5 hover:text-cyan-100 mf-light:border-slate-200 mf-light:text-slate-700 mf-light:hover:border-cyan-400/40 mf-light:hover:bg-cyan-500/5 mf-light:hover:text-cyan-800"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition ${
                    active
                      ? "text-cyan-200 mf-light:text-cyan-700"
                      : "text-slate-500 group-hover:text-cyan-200/90 mf-light:group-hover:text-cyan-700"
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center border-l border-white/10 pl-2 mf-light:border-slate-200">
          <DashboardLogoutButton variant="mobile" />
        </div>
      </div>
    </div>
  );
}
