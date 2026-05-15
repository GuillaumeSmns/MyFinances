"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  persistThemeClient,
  readStoredTheme,
  THEME_STORAGE_KEY,
  type MfTheme,
} from "@/lib/theme-storage";

type ThemeContextValue = {
  theme: MfTheme;
  setTheme: (theme: MfTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeSnapshot(): MfTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-mf-theme") === "light" ? "light" : "dark";
}

function subscribeToTheme(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ["data-mf-theme"] });
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    mo.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

type ThemeProviderProps = {
  children: React.ReactNode;
  /** Theme from the server cookie — used for SSR and hydration. */
  initialTheme: MfTheme;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => initialTheme,
  );

  useLayoutEffect(() => {
    const resolved = readStoredTheme(initialTheme);
    persistThemeClient(resolved);
  }, [initialTheme]);

  const setTheme = useCallback((next: MfTheme) => {
    persistThemeClient(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
