/**
 * Semantic theme class tokens — pair with CSS variables in `app/globals.css`.
 * Use these instead of `bg-slate-950` + `mf-light:*` pairs.
 */

/** Page / shell background */
export const mfSurface = "bg-background text-foreground";

/** Elevated card (dashboard panels) */
export const mfCard =
  "rounded-2xl border border-border bg-card p-5 backdrop-blur mf-card-shadow";

/** Card title & subtitle */
export const mfCardTitle = "text-base font-semibold text-foreground";
export const mfCardSubtitle = "mt-1 text-sm text-muted-foreground";

/** Sidebar / nav shell */
export const mfSidebar =
  "border-r border-border bg-sidebar text-foreground";

/** Subtle panel (filters, toolbars) */
export const mfPanel =
  "rounded-2xl border border-border bg-muted/50 p-4 backdrop-blur";

/** Text hierarchy */
export const mfTextPrimary = "text-foreground";
export const mfTextSecondary = "text-secondary";
export const mfTextMuted = "text-muted-foreground";
export const mfTextFaint = "text-faint";

/** Borders & overlays */
export const mfBorder = "border-border";
export const mfBorderSubtle = "border-border-subtle";
export const mfOverlay = "bg-overlay";
export const mfOverlayHover = "hover:bg-overlay-hover";

/** Form controls */
export const mfInput =
  "rounded-xl border border-border bg-input text-foreground outline-none transition placeholder:text-faint hover:border-border-strong focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20";

export const mfInputInline =
  "border-0 bg-transparent text-foreground outline-none placeholder:text-faint focus:ring-0";

/** Finance accent text */
export const mfTextSuccess = "text-accent-success";
export const mfTextDanger = "text-accent-danger";
export const mfTextInvestment = "text-accent-investment";
export const mfTextAnalytics = "text-accent-analytics";

/** Primary CTA (gold) */
export const mfBtnPrimary = "mf-btn-primary";

/** Icon box on cards */
export const mfIconBox =
  "flex items-center justify-center rounded-lg border border-border bg-overlay text-muted-foreground transition group-hover:border-cyan-400/30 group-hover:text-cyan-500";

/** Nav link states */
export const mfNavLink =
  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-muted-foreground transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-400";

export const mfNavLinkActive =
  "flex items-center gap-3 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-2.5 text-cyan-300";

/** Divider */
export const mfDivider = "border-border";

/** Modal / dropdown surface */
export const mfPopover =
  "rounded-xl border border-border bg-card-solid shadow-lg";

/** Status chip */
export const mfChip =
  "rounded-full border border-border bg-overlay px-3 py-1 text-xs text-muted-foreground";

/** Ghost button */
export const mfBtnGhost =
  "inline-flex items-center justify-center rounded-lg border border-border bg-overlay px-3 py-2 text-sm text-secondary transition hover:border-border-strong hover:bg-overlay-hover hover:text-foreground";
