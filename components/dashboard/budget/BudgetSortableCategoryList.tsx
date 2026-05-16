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
import { SortableBudgetCategoryBox } from "@/components/dashboard/budget/SortableBudgetCategoryBox";
import type { BudgetCategory } from "@/lib/budget-model";
import { reorderCategoriesByIds } from "@/lib/budget-model";

type BudgetSortableCategoryListProps = {
  categories: BudgetCategory[];
  onReorder: (categories: BudgetCategory[]) => void;
  onTitleChange: (categoryId: string, title: string) => void;
  onAmountChange: (categoryId: string, itemId: string, amount: number) => void;
  onLabelChange: (categoryId: string, itemId: string, label: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onAddLine: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategoryAfter: (index: number) => void;
};

export function BudgetSortableCategoryList({
  categories,
  onReorder,
  onTitleChange,
  onAmountChange,
  onLabelChange,
  onDeleteItem,
  onAddLine,
  onDeleteCategory,
  onAddCategoryAfter,
}: BudgetSortableCategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(reorderCategoriesByIds(categories, String(active.id), String(over.id)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-5">
          {categories.map((category, index) => (
            <SortableBudgetCategoryBox
              key={category.id}
              category={category}
              onTitleChange={(title) => onTitleChange(category.id, title)}
              onAmountChange={(itemId, amount) => onAmountChange(category.id, itemId, amount)}
              onLabelChange={(itemId, label) => onLabelChange(category.id, itemId, label)}
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
