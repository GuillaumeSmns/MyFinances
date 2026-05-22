"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getCompoundChartTheme, type CompoundChartTheme } from "@/lib/compound-interest-chart-theme";
import { getChartTheme, readStoredPalette, type ChartColorSet, type MfPaletteId } from "@/lib/theme-colors";

function subscribePalette(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ["data-mf-palette"] });
  return () => mo.disconnect();
}

function getPaletteSnapshot(): MfPaletteId {
  if (typeof document === "undefined") return "legacy";
  return document.documentElement.getAttribute("data-mf-palette") === "luxury" ? "luxury" : "legacy";
}

/** Chart colors that follow light/dark mode and optional palette. */
export function useChartTheme(): {
  chart: ChartColorSet;
  allocation: readonly string[];
} {
  const { theme } = useTheme();
  const palette = useSyncExternalStore(subscribePalette, getPaletteSnapshot, readStoredPalette);

  return useMemo(() => getChartTheme(palette, theme), [palette, theme]);
}

/** Projection calculators (compound interest, retirement). */
export function useCompoundChartTheme(): CompoundChartTheme {
  const { theme } = useTheme();
  return useMemo(() => getCompoundChartTheme(theme), [theme]);
}
