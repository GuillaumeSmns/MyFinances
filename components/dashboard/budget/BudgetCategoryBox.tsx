"use client";

import type { CSSProperties, Ref } from "react";
import { Plus } from "lucide-react";
import { BudgetItemRow } from "@/components/dashboard/budget/BudgetItemRow";
import {
  FloatingCategoryControls,
  type CategoryDragHandleProps,
} from "@/components/dashboard/budget/FloatingCategoryControls";
import type { BudgetCategory } from "@/lib/budget-model";
import { sumCategory } from "@/lib/budget-model";

type BudgetCategoryBoxProps = {
  category: BudgetCategory;
  sortableRef?: Ref<HTMLDivElement>;
  sortableStyle?: CSSProperties;
  isDragging?: boolean;
  dragHandle: CategoryDragHandleProps;
  onTitleChange: (title: string) => void;
  onAmountChange: (itemId: string, amount: number) => void;
  onLabelChange: (itemId: string, label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddLine: () => void;
  onDeleteCategory: () => void;
  onAddCategoryAfter: () => void;
};

export function BudgetCategoryBox({
  category,
  sortableRef,
  sortableStyle,
  isDragging = false,
  dragHandle,
  onTitleChange,
  onAmountChange,
  onLabelChange,
  onDeleteItem,
  onAddLine,
  onDeleteCategory,
  onAddCategoryAfter,
}: BudgetCategoryBoxProps) {
  const total = sumCategory(category);

  return (
    <div
      ref={sortableRef}
      style={sortableStyle}
      className={`group relative pr-2 sm:pr-10 ${isDragging ? "z-20" : ""}`}
    >
      <article
        className={`rounded-2xl border bg-slate-900/55 p-5 backdrop-blur transition mf-light:bg-white mf-light:shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${
          isDragging
            ? "border-cyan-300/40 opacity-90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-cyan-300/25 mf-light:border-cyan-400/50"
            : "border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-white/15 mf-light:border-slate-200/90"
        }`}
      >
        <header className="mb-4 flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3 mf-light:border-slate-100">
          <input
            type="text"
            value={category.title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-label="Category name"
            className="w-full min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-white outline-none focus:ring-0 mf-light:text-slate-900"
          />
          <p className="shrink-0 text-sm font-medium tabular-nums text-white mf-light:text-slate-900">
            AED {total.toLocaleString()}
          </p>
        </header>

        <div className="space-y-2">
          {category.items.map((item) => (
            <BudgetItemRow
              key={item.id}
              item={item}
              onAmountChange={onAmountChange}
              onLabelChange={onLabelChange}
              onDelete={onDeleteItem}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onAddLine}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-slate-400 transition hover:text-amber-200/90 mf-light:hover:text-amber-800"
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
