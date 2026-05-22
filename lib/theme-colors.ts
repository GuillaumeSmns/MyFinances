/**
 * MyFinances color system — chart colors & palette identifiers.
 *
 * UI surfaces use semantic CSS variables (`bg-background`, `text-foreground`, …)
 * defined in `app/globals.css`. Charts read theme mode + palette at runtime.
 */

import type { MfTheme } from "@/lib/theme-storage";

export const MF_PALETTE_STORAGE_KEY = "myfinances-palette";

/** Primary accent — champagne gold */
export const MF_ACCENT = "#f4be7e";

/** Analytics / spending trend blue */
export const MF_ANALYTICS = "#39bdf8";

/** Expense / negative finance */
export const MF_EXPENSE = {
  luxury: "#b85c5c",
  legacy: "#f43f5e",
} as const;

export type ChartColorSet = {
  revenue: string;
  expense: string;
  grid: string;
  axis: string;
  axisLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  pieStroke: string;
};

export const MF_THEME = {
  accent: MF_ACCENT,
  accentMuted: "#d4a46a",
  accentDeep: "#8f6b3f",
  champagne: "#edd9be",
  cream: "#f5f0e8",
  beige: "#e8dfd2",
  surfaceBase: "#1a1714",
  surfaceElevated: "#242018",
  surfaceCard: "#2d2822",
  textPrimary: "#f5f0e8",
  textMuted: "#b5a99a",
  borderSubtle: "rgba(244, 190, 126, 0.14)",
  chart: {
    revenue: "#9cb8a8",
    expense: MF_EXPENSE.luxury,
    grid: "rgba(244, 190, 126, 0.08)",
    axis: "#8a8074",
    axisLine: "rgba(244, 190, 126, 0.12)",
    tooltipBg: "rgba(26, 23, 20, 0.96)",
    tooltipBorder: "rgba(244, 190, 126, 0.18)",
    tooltipText: "#e8dfd2",
    pieStroke: "rgba(26, 23, 20, 0.92)",
  } satisfies ChartColorSet,
  allocation: ["#f4be7e", "#c9a06a", "#9cb8a8", "#b5a99a", "#e8dfd2"] as const,
} as const;

/** Original cyan / cool-slate palette */
export const MF_THEME_LEGACY = {
  accent: "#22d3ee",
  chart: {
    revenue: "#34d399",
    expense: MF_EXPENSE.legacy,
    grid: "rgba(255,255,255,0.06)",
    axis: "#94a3b8",
    axisLine: "rgba(255, 255, 255, 0.08)",
    tooltipBg: "rgba(15, 23, 42, 0.96)",
    tooltipBorder: "rgba(255,255,255,0.12)",
    tooltipText: "#e2e8f0",
    pieStroke: "rgba(15,23,42,0.9)",
  } satisfies ChartColorSet,
  allocation: ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"] as const,
} as const;

const CHART_LIGHT_LEGACY: ChartColorSet = {
  revenue: "#059669",
  expense: "#e11d48",
  grid: "rgba(15, 23, 42, 0.08)",
  axis: "#64748b",
  axisLine: "rgba(15, 23, 42, 0.12)",
  tooltipBg: "rgba(255, 255, 255, 0.98)",
  tooltipBorder: "rgba(15, 23, 42, 0.12)",
  tooltipText: "#0f172a",
  pieStroke: "rgba(248, 246, 243, 0.95)",
};

const CHART_LIGHT_LUXURY: ChartColorSet = {
  revenue: "#5a8f78",
  expense: "#b85c5c",
  grid: "rgba(45, 40, 34, 0.08)",
  axis: "#64748b",
  axisLine: "rgba(45, 40, 34, 0.12)",
  tooltipBg: "rgba(255, 255, 255, 0.98)",
  tooltipBorder: "rgba(244, 190, 126, 0.25)",
  tooltipText: "#2d2822",
  pieStroke: "rgba(248, 246, 243, 0.95)",
};

export type MfPaletteId = "luxury" | "legacy";

export function readStoredPalette(): MfPaletteId {
  if (typeof window === "undefined") return "legacy";
  return document.documentElement.getAttribute("data-mf-palette") === "luxury" ? "luxury" : "legacy";
}

export function readDocumentTheme(): MfTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-mf-theme") === "light" ? "light" : "dark";
}

export function getChartTheme(
  palette: MfPaletteId = "legacy",
  mode: MfTheme = "dark",
): { chart: ChartColorSet; allocation: readonly string[] } {
  const base = palette === "legacy" ? MF_THEME_LEGACY : MF_THEME;
  if (mode === "dark") {
    return { chart: base.chart, allocation: base.allocation };
  }
  const chart = palette === "legacy" ? CHART_LIGHT_LEGACY : CHART_LIGHT_LUXURY;
  return { chart, allocation: base.allocation };
}
