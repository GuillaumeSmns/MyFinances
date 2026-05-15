/**
 * Landing hero holographic chart — colors tuned for slate-950 + cyan landing bg.
 * Edit values here to adjust glow, opacity, and chart silhouette.
 */
export const HERO_VISUAL = {
  accent: "#22d3ee",
  accentBright: "#67e8f9",
  accentGlow: "#00f2ff",
  accentMuted: "rgba(34, 211, 238, 0.45)",
  grid: "rgba(34, 211, 238, 0.06)",
  gridBright: "rgba(34, 211, 238, 0.11)",
  macroBarTop: "rgba(34, 211, 238, 0.22)",
  macroBarBottom: "rgba(34, 211, 238, 0.02)",
  microBarTop: "rgba(103, 232, 249, 0.85)",
  microBarBottom: "rgba(34, 211, 238, 0)",
  platformStroke: "rgba(34, 211, 238, 0.35)",
  platformFill: "rgba(34, 211, 238, 0.04)",
  bloom: "rgba(34, 211, 238, 0.14)",
  areaTop: "rgba(34, 211, 238, 0.18)",
} as const;

/** Wide background bars (0–1) — macro trend */
export const HERO_VISUAL_MACRO_BARS = [
  0.38, 0.44, 0.42, 0.5, 0.48, 0.56, 0.54, 0.62, 0.6, 0.7, 0.68, 0.78, 0.82, 0.9,
] as const;

/** Zig-zag trend vertices [x, y] in SVG space */
export const HERO_VISUAL_TREND: readonly (readonly [number, number])[] = [
  [48, 172],
  [76, 158],
  [104, 166],
  [132, 148],
  [160, 156],
  [188, 132],
  [216, 140],
  [244, 118],
  [272, 126],
  [300, 98],
  [328, 78],
  [356, 58],
];

/** Thin foreground bars — generated heights (0–1) */
export const HERO_VISUAL_MICRO_BARS = Array.from({ length: 52 }, (_, i) => {
  const t = i / 51;
  const base = 0.32 + t * 0.58;
  const noise = Math.sin(i * 1.65) * 0.09 + Math.cos(i * 0.85) * 0.06;
  return Math.min(1, Math.max(0.22, base + noise));
});
