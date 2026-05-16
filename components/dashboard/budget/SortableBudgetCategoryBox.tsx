"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BudgetCategoryBox } from "@/components/dashboard/budget/BudgetCategoryBox";
import type { BudgetCategory } from "@/lib/budget-model";

type SortableBudgetCategoryBoxProps = {
  category: BudgetCategory;
  onTitleChange: (title: string) => void;
  onAmountChange: (itemId: string, amount: number) => void;
  onLabelChange: (itemId: string, label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddLine: () => void;
  onDeleteCategory: () => void;
  onAddCategoryAfter: () => void;
};

export function SortableBudgetCategoryBox({
  category,
  ...handlers
}: SortableBudgetCategoryBoxProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <BudgetCategoryBox
      category={category}
      sortableRef={setNodeRef}
      sortableStyle={style}
      isDragging={isDragging}
      dragHandle={{ attributes, listeners }}
      {...handlers}
    />
  );
}
