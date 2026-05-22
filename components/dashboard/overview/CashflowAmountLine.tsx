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
      <span className="text-muted-foreground">Cashflow </span>
      <span
        className={
          positive
            ? "font-medium text-accent-success"
            : "font-medium text-accent-danger"
        }
      >
        ({formatSignedAmount(value)})
      </span>
    </span>
  );
}
