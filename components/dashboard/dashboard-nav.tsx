import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, NotebookPen, TrendingUp, UserCircle, Wallet } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/overview", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/budget", label: "Budget", Icon: NotebookPen },
  { href: "/dashboard/assets", label: "Assets", Icon: Wallet },
  { href: "/dashboard/projections", label: "Projections", Icon: TrendingUp },
  { href: "/dashboard/profile", label: "Profile", Icon: UserCircle },
];
