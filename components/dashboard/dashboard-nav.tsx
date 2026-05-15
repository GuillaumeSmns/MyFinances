import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  NotebookPen,
  Percent,
  Sunset,
  TrendingUp,
  UserCircle,
  Wallet,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

export type DashboardNavChildItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/overview", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/budget", label: "Budget", Icon: NotebookPen },
  { href: "/dashboard/assets", label: "Assets", Icon: Wallet },
  { href: "/dashboard/profile", label: "Profile", Icon: UserCircle },
];

export const PROJECTIONS_NAV = {
  href: "/dashboard/projections",
  label: "Projections",
  Icon: TrendingUp,
  children: [
    {
      href: "/dashboard/projections/compound-interest",
      label: "Compound Interest Calculator",
      Icon: Percent,
    },
    {
      href: "/dashboard/projections/retirement",
      label: "Retirement Planning",
      Icon: Sunset,
    },
  ] satisfies DashboardNavChildItem[],
} as const;

export function isProjectionsNavActive(pathname: string) {
  return (
    pathname === PROJECTIONS_NAV.href || pathname.startsWith(`${PROJECTIONS_NAV.href}/`)
  );
}

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || (href === "/dashboard/overview" && pathname === "/dashboard");
}
