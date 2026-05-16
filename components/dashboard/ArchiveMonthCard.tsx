"use client";

import { CheckCircle2 } from "lucide-react";
import { useCurrency } from "@/components/preferences/CurrencyProvider";
import { formatMonthLabel } from "@/lib/journal-storage";

export type ArchiveMonthCardProps = {
  monthKey: string;
  revenue: number;
  expenses: number;
  surplus: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function ArchiveMonthCard({
  monthKey,
  revenue,
  expenses,
  surplus,
  isSelected,
  onSelect,
  onDelete,
}: ArchiveMonthCardProps) {
  const { formatAmount, formatSignedAmount } = useCurrency();
  const cashflowPositive = surplus >= 0;

  return (
    <div
      className={`group relative min-h-[148px] rounded-lg border backdrop-blur-md transition mf-light:border-slate-200 mf-light:bg-white/80 ${
        isSelected
          ? "border-cyan-400/45 bg-cyan-500/12 shadow-mf-accent-ring mf-light:border-cyan-500/50 mf-light:bg-cyan-50"
          : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06] mf-light:hover:border-slate-300 mf-light:hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full min-h-[148px] flex-col rounded-lg px-3 pb-3 pt-3 pr-9 text-left"
      >
        <div className="mb-3 flex items-start justify-between gap-2 border-b border-white/[0.08] pb-2 mf-light:border-slate-200">
          <span className="text-xs font-semibold leading-snug text-white mf-light:text-slate-900">{formatMonthLabel(monthKey)}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
            Saved
          </span>
        </div>
        <dl className="flex flex-1 flex-col justify-center gap-2.5 text-[11px] leading-tight">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-slate-500">Revenue</dt>
            <dd className="truncate font-semibold tabular-nums text-emerald-200/95">{formatAmount(revenue)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-slate-500">Expenses</dt>
            <dd className="truncate font-semibold tabular-nums mf-text-expense mf-light:text-rose-800">
              {formatAmount(expenses)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-slate-500">Cashflow</dt>
            <dd
              className={`truncate font-semibold tabular-nums ${
                cashflowPositive
                  ? "text-emerald-300 mf-light:text-emerald-700"
                  : "text-rose-500 mf-light:text-rose-800"
              }`}
            >
              {formatSignedAmount(surplus)}
            </dd>
          </div>
        </dl>
      </button>
      <button
        type="button"
        aria-label={`Delete saved data for ${monthKey}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-slate-950/90 text-sm leading-none text-slate-500 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-200 mf-light:border-slate-200 mf-light:bg-white mf-light:hover:border-slate-300 mf-light:hover:bg-slate-200 mf-light:hover:text-slate-800"
      >
        ×
      </button>
    </div>
  );
}
