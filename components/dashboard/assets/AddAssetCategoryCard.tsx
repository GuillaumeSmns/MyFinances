"use client";

import { Plus } from "lucide-react";

type AddAssetCategoryCardProps = {
  onClick: () => void;
};

export function AddAssetCategoryCard({ onClick }: AddAssetCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong bg-overlay/30 px-6 py-8 text-sm font-medium text-muted-foreground transition hover:border-[#f4be7e]/40 hover:bg-[#f4be7e]/[0.04] hover:text-[#f4be7e]"
    >
      <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      Add asset category +
    </button>
  );
}
