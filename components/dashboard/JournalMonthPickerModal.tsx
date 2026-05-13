"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, CalendarRange, ChevronDown, X } from "lucide-react";
import { formatMonthLabel } from "@/lib/journal-storage";

type JournalMonthPickerModalProps = {
  open: boolean;
  onClose: () => void;
  monthKey: string;
  maxMonthKey: string;
  /** Return false to keep the dialog open (e.g. user cancelled unsaved warning). */
  onApply: (nextKey: string) => boolean | void;
};

/** Only mounted while `open`; draft resets each time the picker opens. */
function JournalMonthPickerModalContent({
  monthKey,
  maxMonthKey,
  onApply,
  onClose,
}: Omit<JournalMonthPickerModalProps, "open">) {
  const [draft, setDraft] = useState(monthKey);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const openNativeMonthPicker = () => {
    const el = monthInputRef.current;
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.focus();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleApply = () => {
    if (!draft) return;
    const proceed = onApply(draft);
    if (proceed !== false) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-[12vh] sm:pt-[15vh]">
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label="Close month picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-month-picker-title"
        className="relative w-full max-w-md rounded-2xl border border-white/12 bg-slate-900/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200">
              <CalendarRange className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h2 id="journal-month-picker-title" className="text-lg font-semibold text-white">
                Select month
              </h2>
              <p className="text-xs text-slate-400">Choose any month up to the current period.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <label
          htmlFor="journal-month-picker-input"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Month & year
        </label>
        <div
          role="presentation"
          className="group/month-field mb-2 cursor-pointer rounded-xl border border-white/25 bg-slate-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-400/55 hover:bg-slate-950 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/35"
        >
          <div className="flex min-h-[3.25rem] items-stretch">
            <div
              className="flex min-w-0 flex-1 items-center px-4 py-3"
              onClick={(e) => {
                const t = e.target as HTMLElement;
                if (t.tagName === "INPUT") return;
                openNativeMonthPicker();
              }}
            >
              <input
                id="journal-month-picker-input"
                ref={monthInputRef}
                type="month"
                value={draft}
                max={maxMonthKey}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full cursor-pointer border-0 bg-transparent p-0 text-base font-semibold text-white outline-none [color-scheme:dark] appearance-none placeholder:text-slate-500 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/10 bg-slate-950/50 px-2 py-2 sm:px-3">
              <button
                type="button"
                aria-label="Open month picker"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openNativeMonthPicker();
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-cyan-200/95 shadow-sm transition hover:border-cyan-400/45 hover:bg-cyan-500/15 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              >
                <CalendarDays className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </button>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-slate-500 transition group-hover/month-field:text-cyan-200/80"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>
        </div>
        {draft && <p className="mb-6 text-sm text-slate-400">{formatMonthLabel(draft)}</p>}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function JournalMonthPickerModal({ open, onClose, monthKey, maxMonthKey, onApply }: JournalMonthPickerModalProps) {
  if (!open) return null;
  return (
    <JournalMonthPickerModalContent
      key={monthKey}
      onClose={onClose}
      monthKey={monthKey}
      maxMonthKey={maxMonthKey}
      onApply={onApply}
    />
  );
}
