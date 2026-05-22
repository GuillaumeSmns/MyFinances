"use client";

import { PREFERRED_CURRENCIES, type PreferredCurrency } from "@/lib/currency";

type AssetCurrencySelectProps = {
  value: PreferredCurrency;
  onChange: (currency: PreferredCurrency) => void;
  "aria-label"?: string;
  className?: string;
};

export function AssetCurrencySelect({
  value,
  onChange,
  "aria-label": ariaLabel = "Currency",
  className = "",
}: AssetCurrencySelectProps) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value as PreferredCurrency)}
      className={`cursor-pointer rounded-lg border border-border bg-input px-2 py-1.5 text-xs font-semibold tabular-nums text-foreground outline-none transition focus:border-[#f4be7e]/50 focus:ring-1 focus:ring-[#f4be7e]/20 ${className}`}
    >
      {PREFERRED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
