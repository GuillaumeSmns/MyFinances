"use client";

import { useCurrency } from "@/components/preferences/CurrencyProvider";

type CashflowAmountLineProps = {
  value: number;
  className?: string;
};

/** Inline cashflow label: Cashflow (USD 78,310) or Cashflow (USD -70,190) */
export function CashflowAmountLine({ value, className = "" }: CashflowAmountLineProps) {
  const { formatSignedAmount } = useCurrency();
  const positive = value >= 0;

  return (
    <span className={`text-sm ${className}`}>
      <span className="text-slate-400 mf-light:text-slate-600">Cashflow </span>
      <span
        className={
          positive
            ? "font-medium text-emerald-300 mf-light:text-emerald-700"
            : "font-medium text-rose-500 mf-light:text-rose-800"
        }
      >
        ({formatSignedAmount(value)})
      </span>
    </span>
  );
}
