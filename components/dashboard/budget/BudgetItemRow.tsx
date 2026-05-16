import { Trash2 } from "lucide-react";
import type { FinanceItem } from "@/components/dashboard/types";

type BudgetItemRowProps = {
  item: FinanceItem;
  onAmountChange: (id: string, value: number) => void;
  onLabelChange: (id: string, label: string) => void;
  onDelete: (id: string) => void;
};

export function BudgetItemRow({ item, onAmountChange, onLabelChange, onDelete }: BudgetItemRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 py-2.5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3 mf-light:border-slate-200/80 mf-light:bg-white/90">
      <input
        type="text"
        value={item.label}
        onChange={(e) => onLabelChange(item.id, e.target.value)}
        aria-label="Line label"
        className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0 mf-light:text-slate-900"
      />
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 transition focus-within:border-amber-300/40 focus-within:ring-1 focus-within:ring-amber-300/20 mf-light:border-slate-200 mf-light:bg-slate-50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">AED</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(item.amount) ? item.amount : 0}
          onChange={(e) => onAmountChange(item.id, Number(e.target.value || 0))}
          aria-label="Amount"
          className="no-spinner w-full min-w-[100px] bg-transparent text-sm font-medium tabular-nums text-slate-100 outline-none mf-light:text-slate-900"
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label={`Delete ${item.label}`}
        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white mf-light:border-slate-200 mf-light:bg-slate-100 mf-light:hover:text-slate-800"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
