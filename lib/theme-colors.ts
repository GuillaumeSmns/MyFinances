/**
 * MyFinances color system — luxury wealth-management palette (default).
 *
 * UI classes still use Tailwind names (`cyan-*`, `slate-*`, etc.); those scales are
 * remapped to these values in `app/globals.css` via CSS variables.
 *
 * Switch back to the original cyan/slate palette:
 *   `document.documentElement.setAttribute("data-mf-palette", "legacy")`
 * Remove the attribute (or set `"luxury"`) to restore this palette.
 */

export const MF_PALETTE_STORAGE_KEY = "myfinances-palette";

/** Primary accent — champagne gold */
export const MF_ACCENT = "#f4be7e";

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
    expense: "#c9a0a0",
    grid: "rgba(244, 190, 126, 0.08)",
    axis: "#8a8074",
    tooltipBg: "rgba(26, 23, 20, 0.96)",
    tooltipBorder: "rgba(244, 190, 126, 0.18)",
    tooltipText: "#e8dfd2",
    pieStroke: "rgba(26, 23, 20, 0.92)",
  },
  allocation: ["#f4be7e", "#c9a06a", "#9cb8a8", "#b5a99a", "#e8dfd2"] as const,
} as const;

/** Original cyan / cool-slate palette — used when `data-mf-palette="legacy"` */
export const MF_THEME_LEGACY = {
  accent: "#22d3ee",
  chart: {
    revenue: "#34d399",
    expense: "#fb7185",
    grid: "rgba(255,255,255,0.06)",
    axis: "#94a3b8",
    tooltipBg: "rgba(15, 23, 42, 0.96)",
    tooltipBorder: "rgba(255,255,255,0.12)",
    tooltipText: "#e2e8f0",
    pieStroke: "rgba(15,23,42,0.9)",
  },
  allocation: ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"] as const,
} as const;

export type MfPaletteId = "luxury" | "legacy";

export function readStoredPalette(): MfPaletteId {
  if (typeof window === "undefined") return "legacy";
  try {
    return localStorage.getItem(MF_PALETTE_STORAGE_KEY) === "luxury" ? "luxury" : "legacy";
  } catch {
    return "legacy";
  }
}

export function getChartTheme(palette: MfPaletteId = "luxury") {
  return palette === "legacy" ? MF_THEME_LEGACY : MF_THEME;
}
