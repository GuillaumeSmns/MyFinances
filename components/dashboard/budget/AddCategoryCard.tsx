"use client";

import { Plus } from "lucide-react";

type AddCategoryCardProps = {
  onClick: () => void;
};

export function AddCategoryCard({ onClick }: AddCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-900/20 px-6 py-8 text-sm font-medium text-slate-400 transition hover:border-amber-300/35 hover:bg-amber-400/[0.04] hover:text-amber-200/90 mf-light:border-slate-300 mf-light:bg-slate-50/80 mf-light:hover:border-amber-400/40 mf-light:hover:text-amber-800"
    >
      <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      Add a category
    </button>
  );
}
