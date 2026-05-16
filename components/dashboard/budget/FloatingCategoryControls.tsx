"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export type CategoryDragHandleProps = {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
};

type FloatingCategoryControlsProps = {
  dragHandle: CategoryDragHandleProps;
  onDelete: () => void;
  onAddAfter: () => void;
};

export function FloatingCategoryControls({
  dragHandle,
  onDelete,
  onAddAfter,
}: FloatingCategoryControlsProps) {
  return (
    <div
      className="pointer-events-none absolute -right-11 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
    >
      <button
        type="button"
        title="Drag to reorder"
        aria-label="Drag to reorder category"
        className="pointer-events-auto flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-white/12 bg-slate-900/95 text-slate-400 shadow-lg backdrop-blur transition hover:border-cyan-300/35 hover:text-cyan-200 active:cursor-grabbing active:border-cyan-300/50 mf-light:border-slate-200 mf-light:bg-white mf-light:hover:text-slate-700 touch-none"
        {...dragHandle.attributes}
        {...dragHandle.listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete category"
        aria-label="Delete category"
        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-slate-900/95 text-slate-400 shadow-lg backdrop-blur transition hover:border-white/25 hover:text-white mf-light:border-slate-200 mf-light:bg-white mf-light:hover:text-slate-800"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onAddAfter}
        title="Add category below"
        aria-label="Add category below"
        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300/25 bg-slate-900/95 text-amber-200/90 shadow-lg backdrop-blur transition hover:border-amber-300/45 hover:text-amber-100 mf-light:border-amber-300/40 mf-light:bg-white mf-light:hover:text-amber-800"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
