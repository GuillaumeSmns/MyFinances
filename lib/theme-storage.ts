export const THEME_STORAGE_KEY = "myfinances-theme";

/** Cookie lifetime — 1 year */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type MfTheme = "dark" | "light";

export function parseThemeCookie(value: string | undefined | null): MfTheme {
  return value === "light" ? "light" : "dark";
}

export function readStoredTheme(fallback: MfTheme = "dark"): MfTheme {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode / disabled storage */
  }
  return fallback;
}

export function applyThemeToDocument(theme: MfTheme) {
  document.documentElement.setAttribute("data-mf-theme", theme);
}

export function serializeThemeCookie(theme: MfTheme): string {
  return `${THEME_STORAGE_KEY}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Keep document attribute, localStorage, and cookie in sync (client only). */
export function persistThemeClient(theme: MfTheme) {
  applyThemeToDocument(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  document.cookie = serializeThemeCookie(theme);
}
