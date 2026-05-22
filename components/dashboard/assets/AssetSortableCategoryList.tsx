"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSensor, useSensors } from "@dnd-kit/core";
import { useIsClient } from "@/components/hooks/useIsClient";
import { AssetCategoryBox } from "@/components/dashboard/assets/AssetCategoryBox";
import { SortableAssetCategoryBox } from "@/components/dashboard/assets/SortableAssetCategoryBox";
import type { CategoryDragHandleProps } from "@/components/dashboard/budget/FloatingCategoryControls";
import { reorderCategoriesByIds, type AssetCategory, type AssetItem } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";

const STATIC_DRAG_HANDLE: CategoryDragHandleProps = {
  attributes: {},
  listeners: undefined,
};

type AssetSortableCategoryListProps = {
  categories: AssetCategory[];
  displayCurrency: PreferredCurrency;
  onReorder: (categories: AssetCategory[]) => void;
  onNameChange: (categoryId: string, name: string) => void;
  onItemChange: (categoryId: string, itemId: string, patch: Partial<Omit<AssetItem, "id">>) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onAddLine: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategoryAfter: (index: number) => void;
};

export function AssetSortableCategoryList({
  categories,
  displayCurrency,
  onReorder,
  onNameChange,
  onItemChange,
  onDeleteItem,
  onAddLine,
  onDeleteCategory,
  onAddCategoryAfter,
}: AssetSortableCategoryListProps) {
  const mounted = useIsClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(reorderCategoriesByIds(categories, String(active.id), String(over.id)));
  };

  if (!mounted) {
    return (
      <div className="space-y-5">
        {categories.map((category, index) => (
          <AssetCategoryBox
            key={category.id}
            category={category}
            displayCurrency={displayCurrency}
            dragHandle={STATIC_DRAG_HANDLE}
            onNameChange={(name) => onNameChange(category.id, name)}
            onItemChange={(itemId, patch) => onItemChange(category.id, itemId, patch)}
            onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
            onAddLine={() => onAddLine(category.id)}
            onDeleteCategory={() => onDeleteCategory(category.id)}
            onAddCategoryAfter={() => onAddCategoryAfter(index)}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-5">
          {categories.map((category, index) => (
            <SortableAssetCategoryBox
              key={category.id}
              category={category}
              displayCurrency={displayCurrency}
              onNameChange={(name) => onNameChange(category.id, name)}
              onItemChange={(itemId, patch) => onItemChange(category.id, itemId, patch)}
              onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
              onAddLine={() => onAddLine(category.id)}
              onDeleteCategory={() => onDeleteCategory(category.id)}
              onAddCategoryAfter={() => onAddCategoryAfter(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
