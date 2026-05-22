"use client";

import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useCurrency } from "@/components/preferences/CurrencyProvider";

type SummaryCardProps = {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "negative" | "accent";
  helper?: string;
  format?: "currency" | "signed-currency" | "percent";
  icon?: LucideIcon;
};

export function SummaryCard({
  label,
  value,
  tone = "neutral",
  helper,
  format = "currency",
  icon: Icon,
}: SummaryCardProps) {
  const { formatAmount, formatSignedAmount } = useCurrency();
  const toneClass =
    tone === "positive"
      ? "text-accent-success"
      : tone === "negative"
        ? "text-accent-danger"
        : tone === "accent"
          ? "mf-text-investment"
          : "text-foreground";

  return (
    <DashboardCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-overlay text-faint transition group-hover:border-cyan-400/30 group-hover:text-cyan-500">
            <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${toneClass}`}>
        {format === "percent"
          ? `${value.toLocaleString()}%`
          : format === "signed-currency"
            ? formatSignedAmount(value)
            : formatAmount(value)}
      </p>
      {helper && <p className="mt-2 text-xs text-muted-foreground">{helper}</p>}
    </DashboardCard>
  );
}
