"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { PREFERRED_CURRENCIES, type PreferredCurrency } from "@/lib/currency";

const CURRENCY_LABELS: Record<PreferredCurrency, string> = {
  AED: "UAE Dirham",
  USD: "US Dollar",
  EUR: "Euro",
};

type CurrencySelectProps = {
  id?: string;
  value: PreferredCurrency;
  onChange: (currency: PreferredCurrency) => void;
  "aria-label"?: string;
};

export function CurrencySelect({ id, value, onChange, "aria-label": ariaLabel }: CurrencySelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `currency-select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updateMenuPosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const select = (currency: PreferredCurrency) => {
    onChange(currency);
    close();
  };

  const menu =
    open && menuRect ? (
      <ul
        ref={menuRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={triggerId}
        style={{
          position: "fixed",
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          zIndex: 9999,
        }}
        className="overflow-hidden rounded-xl border border-white/12 bg-slate-900/98 py-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md mf-light:border-slate-200 mf-light:bg-white mf-light:shadow-xl"
      >
        {PREFERRED_CURRENCIES.map((code) => {
          const selected = code === value;
          return (
            <li key={code} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => select(code)}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-cyan-500/10 text-cyan-100 mf-light:bg-cyan-50 mf-light:text-cyan-900"
                    : "text-slate-200 hover:bg-white/[0.06] hover:text-white mf-light:text-slate-800 mf-light:hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium tracking-wide">{code}</span>
                  <span className="text-xs text-faint">{CURRENCY_LABELS[code]}</span>
                </span>
                {selected && (
                  <Check
                    className="h-4 w-4 shrink-0 text-cyan-300 mf-light:text-cyan-700"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className="relative z-10 max-w-[240px]">
      <button
        type="button"
        id={triggerId}
        aria-label={ariaLabel ?? "Preferred currency"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-950/80 px-3.5 py-2.5 text-left text-sm text-white outline-none transition hover:border-border-strong focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:hover:border-slate-300"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-medium tracking-wide">{value}</span>
          <span className="truncate text-xs text-faint">{CURRENCY_LABELS[value]}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-faint transition-transform mf-light:text-slate-400 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
