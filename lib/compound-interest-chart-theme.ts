import type { MfTheme } from "@/lib/theme-storage";

/** Gold/beige + analytics blue chart palette — compound & retirement projections */
const COMPOUND_CHART_DARK = {
  accent: "#f4be7e",
  accentMuted: "#d4a46a",
  champagne: "#edd9be",
  contributions: "#38bdf8",
  contributionsFillTop: "rgba(56, 189, 248, 0.55)",
  contributionsFillBottom: "rgba(56, 189, 248, 0.06)",
  interest: "#f4be7e",
  interestFillTop: "rgba(244, 190, 126, 0.65)",
  interestFillBottom: "rgba(244, 190, 126, 0.08)",
  grid: "rgba(148, 163, 184, 0.12)",
  axis: "#94a3b8",
  axisLine: "rgba(255, 255, 255, 0.08)",
  tooltipBg: "rgba(15, 23, 42, 0.96)",
  tooltipBorder: "rgba(244, 190, 126, 0.22)",
  tooltipText: "#e8dfd2",
} as const;

const COMPOUND_CHART_LIGHT = {
  ...COMPOUND_CHART_DARK,
  grid: "rgba(15, 23, 42, 0.08)",
  axis: "#64748b",
  axisLine: "rgba(15, 23, 42, 0.12)",
  tooltipBg: "rgba(255, 255, 255, 0.98)",
  tooltipBorder: "rgba(244, 190, 126, 0.28)",
  tooltipText: "#0f172a",
  contributionsFillTop: "rgba(56, 189, 248, 0.45)",
  contributionsFillBottom: "rgba(56, 189, 248, 0.05)",
  interestFillTop: "rgba(244, 190, 126, 0.5)",
  interestFillBottom: "rgba(244, 190, 126, 0.06)",
} as const;

export type CompoundChartTheme = typeof COMPOUND_CHART_DARK | typeof COMPOUND_CHART_LIGHT;

/** @deprecated Use `getCompoundChartTheme(mode)` */
export const COMPOUND_CHART_THEME = COMPOUND_CHART_DARK;

export function getCompoundChartTheme(mode: MfTheme = "dark"): CompoundChartTheme {
  return mode === "light" ? COMPOUND_CHART_LIGHT : COMPOUND_CHART_DARK;
}
