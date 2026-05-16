"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_PREFERRED_CURRENCY,
  formatCurrencyAmount,
  formatSignedCurrencyAmount,
  getCurrencyCode,
  type PreferredCurrency,
} from "@/lib/currency";
import {
  getPreferredCurrency,
  PROFILE_PREFERENCES_CHANGE_EVENT,
  PROFILE_PREFERENCES_STORAGE_KEY,
} from "@/lib/profile-preferences";

type CurrencyContextValue = {
  currency: PreferredCurrency;
  currencyCode: string;
  formatAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatSignedAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function getCurrencySnapshot(): PreferredCurrency {
  return getPreferredCurrency();
}

function subscribeToCurrency(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onStoreChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === PROFILE_PREFERENCES_STORAGE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener(PROFILE_PREFERENCES_CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PROFILE_PREFERENCES_CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrencySnapshot,
    () => DEFAULT_PREFERRED_CURRENCY,
  );

  const formatAmount = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => formatCurrencyAmount(value, currency, options),
    [currency],
  );

  const formatSignedAmount = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => formatSignedCurrencyAmount(value, currency, options),
    [currency],
  );

  const value = useMemo(
    () => ({
      currency,
      currencyCode: getCurrencyCode(currency),
      formatAmount,
      formatSignedAmount,
    }),
    [currency, formatAmount, formatSignedAmount],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
