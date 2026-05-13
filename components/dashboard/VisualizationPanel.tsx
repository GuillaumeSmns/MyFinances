import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CreditCard,
  GitCompare,
  Home,
  Landmark,
  ListTree,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import type { SectionTotal } from "@/components/dashboard/types";

type VisualizationPanelProps = {
  totalRevenue: number;
  totalExpense: number;
  difference: number;
  revenueSections: SectionTotal[];
  expenseSections: SectionTotal[];
};

function revenueRowIcon(name: string): LucideIcon {
  if (name === "Immo") return Building2;
  return ArrowUpRight;
}

function expenseRowIcon(name: string): LucideIcon {
  if (name === "Loan") return CreditCard;
  if (name === "Home Charges") return Home;
  if (name === "Investments") return Landmark;
  return ArrowDownRight;
}

export function VisualizationPanel({
  totalRevenue,
  totalExpense,
  difference,
  revenueSections,
  expenseSections,
}: VisualizationPanelProps) {
  const grandTotal = Math.max(totalRevenue + totalExpense, 1);
  const revenueShare = (totalRevenue / grandTotal) * 100;
  const expenseShare = (totalExpense / grandTotal) * 100;

  const renderBreakdown = (
    sections: SectionTotal[],
    total: number,
    barClass: string,
    iconFor: (name: string) => LucideIcon,
  ) =>
    sections.map((section) => {
      const width = total > 0 ? (section.total / total) * 100 : 0;
      const RowIcon = iconFor(section.name);
      return (
        <div key={section.name} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-slate-300">
              <RowIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.5} aria-hidden />
              <span className="truncate">{section.name}</span>
            </span>
            <span className="shrink-0 text-slate-400">AED {section.total.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} />
          </div>
        </div>
      );
    });

  return (
    <DashboardCard
      title="Cash Flow Visualization"
      subtitle="Revenue vs expense and section-level contribution"
      titleIcon={
        <IconBox>
          <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
        </IconBox>
      }
    >
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-slate-300">
            <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-400/90" strokeWidth={1.5} aria-hidden />
            Total Revenues
          </span>
          <span className="text-emerald-300">AED {totalRevenue.toLocaleString()}</span>
        </div>
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-slate-300">
            <ArrowDownRight className="h-4 w-4 shrink-0 text-rose-400/90" strokeWidth={1.5} aria-hidden />
            Total Expenses
          </span>
          <span className="text-rose-300">AED {totalExpense.toLocaleString()}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="flex h-full">
            <div className="bg-emerald-400/80" style={{ width: `${revenueShare}%` }} />
            <div className="bg-rose-400/80" style={{ width: `${expenseShare}%` }} />
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <GitCompare className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.5} aria-hidden />
          <span className="text-slate-400">Difference: </span>
          <span className={difference >= 0 ? "text-emerald-300" : "text-rose-300"}>
            {difference >= 0 ? "Surplus" : "Deficit"} (AED {Math.abs(difference).toLocaleString()})
          </span>
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-white">
            <ListTree className="h-4 w-4 text-slate-500" strokeWidth={1.5} aria-hidden />
            Revenue Breakdown
          </h4>
          {renderBreakdown(revenueSections, totalRevenue, "bg-emerald-400/80", revenueRowIcon)}
        </div>
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-white">
            <ListTree className="h-4 w-4 text-slate-500" strokeWidth={1.5} aria-hidden />
            Expense Breakdown
          </h4>
          {renderBreakdown(expenseSections, totalExpense, "bg-rose-400/80", expenseRowIcon)}
        </div>
      </div>
    </DashboardCard>
  );
}
