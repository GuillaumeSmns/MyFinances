import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

type SummaryCardProps = {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "negative";
  helper?: string;
  format?: "currency" | "percent";
  icon?: LucideIcon;
};

const formatValue = (value: number, format: "currency" | "percent") =>
  format === "percent" ? `${value.toLocaleString()}%` : `AED ${value.toLocaleString()}`;

export function SummaryCard({
  label,
  value,
  tone = "neutral",
  helper,
  format = "currency",
  icon: Icon,
}: SummaryCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300 mf-light:text-emerald-700"
      : tone === "negative"
        ? "text-rose-300 mf-light:text-rose-700"
        : "text-white mf-light:text-slate-900";

  return (
    <DashboardCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400 mf-light:text-slate-600">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-500 transition group-hover:border-cyan-300/20 group-hover:text-cyan-200/90 mf-light:border-slate-200 mf-light:bg-slate-100 mf-light:text-slate-500 mf-light:group-hover:border-cyan-400/40 mf-light:group-hover:text-cyan-700">
            <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${toneClass}`}>{formatValue(value, format)}</p>
      {helper && <p className="mt-2 text-xs text-slate-400 mf-light:text-slate-600">{helper}</p>}
    </DashboardCard>
  );
}
