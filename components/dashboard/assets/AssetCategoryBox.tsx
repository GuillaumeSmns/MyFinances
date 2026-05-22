"use client";

import type { CSSProperties, Ref } from "react";
import { Plus } from "lucide-react";
import { AssetItemRow } from "@/components/dashboard/assets/AssetItemRow";
import {
  FloatingCategoryControls,
  type CategoryDragHandleProps,
} from "@/components/dashboard/budget/FloatingCategoryControls";
import { sumCategoryConverted, type AssetCategory, type AssetItem } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";
import { formatAssetCurrencyAmount } from "@/lib/currency-conversion";

type AssetCategoryBoxProps = {
  category: AssetCategory;
  displayCurrency: PreferredCurrency;
  sortableRef?: Ref<HTMLDivElement>;
  sortableStyle?: CSSProperties;
  isDragging?: boolean;
  dragHandle: CategoryDragHandleProps;
  onNameChange: (name: string) => void;
  onItemChange: (itemId: string, patch: Partial<Omit<AssetItem, "id">>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddLine: () => void;
  onDeleteCategory: () => void;
  onAddCategoryAfter: () => void;
};

export function AssetCategoryBox({
  category,
  displayCurrency,
  sortableRef,
  sortableStyle,
  isDragging = false,
  dragHandle,
  onNameChange,
  onItemChange,
  onDeleteItem,
  onAddLine,
  onDeleteCategory,
  onAddCategoryAfter,
}: AssetCategoryBoxProps) {
  const categoryTotal = sumCategoryConverted(category, displayCurrency);

  return (
    <div
      ref={sortableRef}
      style={sortableStyle}
      className={`group relative pr-2 sm:pr-10 ${isDragging ? "z-20" : ""}`}
    >
      <article
        className={`rounded-2xl border bg-card p-5 backdrop-blur transition mf-card-shadow ${
          isDragging
            ? "border-[#f4be7e]/40 opacity-90 ring-1 ring-[#f4be7e]/25"
            : "border-border hover:border-border-strong"
        }`}
      >
        <header className="mb-4 flex flex-col gap-1 border-b border-border-subtle pb-3 sm:flex-row sm:items-start sm:justify-between">
          <input
            type="text"
            value={category.name}
            onChange={(e) => onNameChange(e.target.value)}
            aria-label="Category name"
            className="w-full min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-foreground outline-none focus:ring-0"
          />
          <p className="shrink-0 text-right text-xs font-medium tabular-nums text-[#f4be7e] sm:text-sm">
            {categoryTotal > 0
              ? formatAssetCurrencyAmount(categoryTotal, displayCurrency, { maximumFractionDigits: 0 })
              : "—"}
          </p>
        </header>

        <div className="space-y-2">
          {category.items.length === 0 ? (
            <p className="py-2 text-xs text-faint">No assets yet — add a line below.</p>
          ) : (
            category.items.map((item) => (
              <AssetItemRow key={item.id} item={item} onChange={onItemChange} onDelete={onDeleteItem} />
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onAddLine}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-muted-foreground transition hover:text-[#f4be7e]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Add line
        </button>
      </article>

      <FloatingCategoryControls
        dragHandle={dragHandle}
        onDelete={onDeleteCategory}
        onAddAfter={onAddCategoryAfter}
      />
    </div>
  );
}
