"use client";

import { CalendarDays, CheckCircle2, ChevronDown, CircleDashed } from "lucide-react";
import { parseMonthKey } from "@/lib/journal-storage";

type JournalMonthSelectorCenterProps = {
  monthKey: string;
  hasSavedCopyOnDisk: boolean;
  dirty: boolean;
  pickerOpen: boolean;
  onOpenPicker: () => void;
};

function splitHeading(monthKey: string): { month: string; year: string } {
  const p = parseMonthKey(monthKey);
  if (!p) return { month: monthKey, year: "" };
  const d = new Date(p.year, p.month - 1, 1);
  return {
    month: d.toLocaleDateString("en-AE", { month: "long" }),
    year: String(p.year),
  };
}

export function JournalMonthSelectorCenter({
  monthKey,
  hasSavedCopyOnDisk,
  dirty,
  pickerOpen,
  onOpenPicker,
}: JournalMonthSelectorCenterProps) {
  const { month, year } = splitHeading(monthKey);

  const badge = dirty ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
      Unsaved
    </span>
  ) : hasSavedCopyOnDisk ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
      <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
      Saved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/35 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
      <CircleDashed className="h-3 w-3" strokeWidth={2} aria-hidden />
      Not saved
    </span>
  );

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      aria-haspopup="dialog"
      aria-expanded={pickerOpen}
      className="group relative mx-auto flex w-full max-w-[260px] cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-border-strong bg-card px-5 py-3.5 text-center shadow-mf-card backdrop-blur-xl transition duration-200 ease-out hover:border-cyan-400/35 hover:shadow-mf-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-faint group-hover:text-slate-400 mf-light:text-faint">
        Select month
      </span>
      <div className="flex items-center gap-1.5 text-cyan-200/90 mf-light:text-cyan-800">
        <CalendarDays className="h-5 w-5 shrink-0 transition group-hover:scale-105" strokeWidth={1.5} aria-hidden />
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-h-[2.5rem]">
        <span className="block text-lg font-semibold tracking-tight text-foreground sm:text-xl">{month}</span>
        <span className="block text-xs font-medium text-muted-foreground sm:text-sm">{year}</span>
      </div>
      {badge}
    </button>
  );
}
