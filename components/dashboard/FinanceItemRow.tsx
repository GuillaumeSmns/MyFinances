import { Trash2 } from "lucide-react";
import type { FinanceItem } from "@/components/dashboard/types";

type FinanceItemRowProps = {
  item: FinanceItem;
  onAmountChange: (id: string, value: number) => void;
  onLabelChange?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
};

export function FinanceItemRow({ item, onAmountChange, onLabelChange, onDelete }: FinanceItemRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center mf-light:border-slate-200 mf-light:bg-slate-50">
      {onLabelChange ? (
        <input
          type="text"
          value={item.label}
          onChange={(e) => onLabelChange(item.id, e.target.value)}
          aria-label="Item label"
          className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0 mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
        />
      ) : (
        <p className="text-sm text-slate-100 mf-light:text-slate-800">{item.label}</p>
      )}
      <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-slate-900/90 px-3 py-2 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/15 mf-light:border-slate-200 mf-light:bg-white">
        <span className="text-xs font-medium tracking-wide text-slate-400">AED</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(item.amount) ? item.amount : 0}
          onChange={(event) => onAmountChange(item.id, Number(event.target.value || 0))}
          className="no-spinner w-full min-w-[120px] bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
        />
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.label}`}
          className="inline-flex items-center justify-center rounded-lg border border-rose-300/25 bg-rose-500/10 p-2.5 text-rose-200 transition hover:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}
