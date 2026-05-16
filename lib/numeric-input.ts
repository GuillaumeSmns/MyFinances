/**
 * Helpers for editable numeric fields: keep string state while typing,
 * parse safely for calculations with `parseNumericInput(value, fallback)`.
 */

export function parseNumericInput(value: string | undefined | null, fallback = 0): number {
  if (value === undefined || value === null || value.trim() === "") return fallback;
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function numberToInputString(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

/** Map numeric defaults to string field state for forms. */
export function numericFieldsFromDefaults<T extends Record<string, number>>(defaults: T): Record<keyof T, string> {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, val]) => [key, numberToInputString(val as number)]),
  ) as Record<keyof T, string>;
}

/** Parse string field state into numbers for calculations. */
export function parseNumericFields<T extends Record<string, number>>(
  fields: Record<keyof T, string>,
  defaults: T,
): T {
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    out[key] = parseNumericInput(fields[key], defaults[key]) as T[keyof T];
  }
  return out;
}

/** Allow digits and at most one decimal separator while editing. */
export function sanitizeNumericDraft(raw: string, allowNegative = false): string {
  let value = raw.replace(/,/g, "");
  if (value === "") return "";

  const allowed = allowNegative ? /[^\d.-]/g : /[^\d.]/g;
  value = value.replace(allowed, "");

  if (allowNegative) {
    const negative = value.startsWith("-");
    value = value.replace(/-/g, "");
    value = negative ? `-${value}` : value;
  }

  const parts = value.split(".");
  if (parts.length <= 1) return value;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}
