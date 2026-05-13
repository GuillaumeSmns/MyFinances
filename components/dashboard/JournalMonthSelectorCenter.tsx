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
      className="group relative mx-auto flex w-full max-w-[280px] cursor-pointer flex-col items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-6 py-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-200 ease-out hover:border-cyan-400/35 hover:bg-white/[0.1] hover:shadow-[0_12px_40px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400">
        Select month
      </span>
      <div className="flex items-center gap-2 text-cyan-200/90">
        <CalendarDays className="h-6 w-6 shrink-0 transition group-hover:scale-105" strokeWidth={1.5} aria-hidden />
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-h-[3.25rem]">
        <span className="block text-xl font-semibold tracking-tight text-white sm:text-2xl">{month}</span>
        <span className="block text-sm font-medium text-slate-400">{year}</span>
      </div>
      {badge}
    </button>
  );
}
