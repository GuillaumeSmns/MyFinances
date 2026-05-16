import { BlurNumericInput } from "@/components/dashboard/NumericInput";
import { Trash2 } from "lucide-react";
import type { FinanceItem } from "@/components/dashboard/types";

type FinanceItemRowProps = {
  item: FinanceItem;
  onAmountChange: (id: string, value: number) => void;
  onLabelChange: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
};

export function FinanceItemRow({ item, onAmountChange, onLabelChange, onDelete }: FinanceItemRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center mf-light:border-slate-200 mf-light:bg-slate-50">
      <input
        type="text"
        value={item.label}
        onChange={(e) => onLabelChange(item.id, e.target.value)}
        aria-label="Item label"
        className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0 mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
      />
      <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-slate-900/90 px-3 py-2 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/15 mf-light:border-slate-200 mf-light:bg-white">
        <span className="text-xs font-medium tracking-wide text-slate-400">AED</span>
        <BlurNumericInput
          value={Number.isFinite(item.amount) ? item.amount : 0}
          onValueChange={(amount) => onAmountChange(item.id, amount)}
          className="no-spinner w-full min-w-[120px] bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500 mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
        />
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.label}`}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white mf-light:border-slate-200 mf-light:bg-slate-100 mf-light:text-slate-500 mf-light:hover:border-slate-300 mf-light:hover:bg-slate-200 mf-light:hover:text-slate-800"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}
