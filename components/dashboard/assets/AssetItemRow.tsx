"use client";

import { Trash2 } from "lucide-react";
import { BlurNumericInput } from "@/components/dashboard/NumericInput";
import { AssetCurrencySelect } from "@/components/dashboard/assets/AssetCurrencySelect";
import type { AssetItem } from "@/lib/assets-model";

type AssetItemRowProps = {
  item: AssetItem;
  onChange: (itemId: string, patch: Partial<Omit<AssetItem, "id">>) => void;
  onDelete: (itemId: string) => void;
};

export function AssetItemRow({ item, onChange, onDelete }: AssetItemRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-border-subtle bg-overlay/50 px-3 py-2.5 sm:grid-cols-[1fr_110px_72px_1fr_auto] sm:items-center sm:gap-2">
      <input
        type="text"
        value={item.name}
        onChange={(e) => onChange(item.id, { name: e.target.value })}
        aria-label="Asset name"
        placeholder="Asset name"
        className="min-w-0 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-faint focus:ring-0"
      />
      <BlurNumericInput
        value={Number.isFinite(item.value) ? item.value : 0}
        onValueChange={(value) => onChange(item.id, { value })}
        aria-label="Value"
        className="no-spinner w-full min-w-[90px] rounded-lg border border-border bg-input px-2 py-1.5 text-sm font-medium tabular-nums text-foreground outline-none"
      />
      <AssetCurrencySelect
        value={item.currency}
        onChange={(currency) => onChange(item.id, { currency })}
        aria-label={`Currency for ${item.name}`}
      />
      <input
        type="text"
        value={item.country ?? ""}
        onChange={(e) => onChange(item.id, { country: e.target.value })}
        aria-label="Country or location"
        placeholder="Country (optional)"
        className="min-w-0 border-0 bg-transparent text-xs text-muted-foreground outline-none placeholder:text-faint focus:ring-0 sm:text-sm"
      />
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label={`Delete ${item.name}`}
        className="inline-flex items-center justify-center rounded-lg border border-border bg-overlay p-2 text-faint transition hover:border-border-strong hover:bg-overlay-hover hover:text-accent-danger sm:justify-self-end"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
