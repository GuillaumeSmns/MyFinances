import {
  DEFAULT_PREFERRED_CURRENCY,
  isPreferredCurrency,
  type PreferredCurrency,
} from "@/lib/currency";

/** Default display currency for Assets page summaries and analytics. */
export const DEFAULT_ASSETS_DISPLAY_CURRENCY: PreferredCurrency = "USD";

export const ASSETS_DISPLAY_CURRENCY_STORAGE_KEY = "myfinances-assets-display-currency";

export const ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT = "myfinances-assets-display-currency-change";

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ASSETS_DISPLAY_CURRENCY_STORAGE_KEY);
}

export function getAssetsDisplayCurrency(): PreferredCurrency {
  const raw = readRaw();
  if (raw && isPreferredCurrency(raw)) return raw;
  return DEFAULT_ASSETS_DISPLAY_CURRENCY;
}

export function setAssetsDisplayCurrency(currency: PreferredCurrency): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSETS_DISPLAY_CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent(ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT));
}

export function subscribeToAssetsDisplayCurrency(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === ASSETS_DISPLAY_CURRENCY_STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener(ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/** @deprecated Use getAssetsDisplayCurrency — kept for clarity in profile copy */
export { DEFAULT_PREFERRED_CURRENCY };
