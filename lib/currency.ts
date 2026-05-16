export const PREFERRED_CURRENCIES = ["AED", "USD", "EUR"] as const;

export type PreferredCurrency = (typeof PREFERRED_CURRENCIES)[number];

export const DEFAULT_PREFERRED_CURRENCY: PreferredCurrency = "AED";

export function isPreferredCurrency(value: string): value is PreferredCurrency {
  return (PREFERRED_CURRENCIES as readonly string[]).includes(value);
}

export function getCurrencyCode(currency: PreferredCurrency = DEFAULT_PREFERRED_CURRENCY): string {
  return currency;
}

export function formatCurrencyAmount(
  value: number,
  currency: PreferredCurrency = DEFAULT_PREFERRED_CURRENCY,
  options?: Intl.NumberFormatOptions,
): string {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    ...options,
  });
  return `${getCurrencyCode(currency)} ${formatted}`;
}

/** Absolute value formatted with currency code; negative values get a minus on the amount (e.g. USD -70,190). */
export function formatSignedCurrencyAmount(
  value: number,
  currency: PreferredCurrency = DEFAULT_PREFERRED_CURRENCY,
  options?: Intl.NumberFormatOptions,
): string {
  const absFormatted = formatCurrencyAmount(Math.abs(value), currency, options);
  if (value >= 0) return absFormatted;
  const spaceIndex = absFormatted.indexOf(" ");
  if (spaceIndex > 0) {
    return `${absFormatted.slice(0, spaceIndex)} -${absFormatted.slice(spaceIndex + 1)}`;
  }
  return `-${absFormatted}`;
}
