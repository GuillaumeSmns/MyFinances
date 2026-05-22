"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AssetCategoryBox } from "@/components/dashboard/assets/AssetCategoryBox";
import type { AssetCategory, AssetItem } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";

type SortableAssetCategoryBoxProps = {
  category: AssetCategory;
  displayCurrency: PreferredCurrency;
  onTitleChange: (title: string) => void;
  onItemChange: (itemId: string, patch: Partial<Omit<AssetItem, "id">>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddLine: () => void;
  onDeleteCategory: () => void;
  onAddCategoryAfter: () => void;
};

export function SortableAssetCategoryBox({ category, ...handlers }: SortableAssetCategoryBoxProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <AssetCategoryBox
      category={category}
      sortableRef={setNodeRef}
      sortableStyle={style}
      isDragging={isDragging}
      dragHandle={{ attributes, listeners }}
      {...handlers}
    />
  );
}
