export const THEME_STORAGE_KEY = "myfinances-theme";

export type MfTheme = "dark" | "light";

export function readStoredTheme(): MfTheme {
  if (typeof window === "undefined") return "dark";
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyThemeToDocument(theme: MfTheme) {
  document.documentElement.setAttribute("data-mf-theme", theme);
}
