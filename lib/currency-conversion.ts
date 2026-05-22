import type { PreferredCurrency } from "@/lib/currency";
import { PREFERRED_CURRENCIES } from "@/lib/currency";

/**
 * Static rates for prototype only — replace with live FX rates later.
 * USD is the base reference: multiply native amount by `toUsd[from]` to get USD,
 * then multiply by `fromUsd[to]` to reach the target currency.
 */
const TO_USD: Record<PreferredCurrency, number> = {
  USD: 1,
  EUR: 1.08,
  AED: 0.2723,
};

const FROM_USD: Record<PreferredCurrency, number> = {
  USD: 1,
  EUR: 0.93,
  AED: 3.67,
};

export function convertCurrencyAmount(
  amount: number,
  from: PreferredCurrency,
  to: PreferredCurrency,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const usd = amount * TO_USD[from];
  return usd * FROM_USD[to];
}

/** Format amounts for Assets summaries/charts (e.g. USD 100,000). */
export function formatAssetCurrencyAmount(
  amount: number,
  currency: PreferredCurrency,
  options?: Intl.NumberFormatOptions,
): string {
  const formatted = amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    ...options,
  });
  return `${currency} ${formatted}`;
}

export { PREFERRED_CURRENCIES };
