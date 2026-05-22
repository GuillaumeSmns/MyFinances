import {
  DEFAULT_PREFERRED_CURRENCY,
  isPreferredCurrency,
  type PreferredCurrency,
} from "@/lib/currency";

export const PROFILE_PREFERENCES_STORAGE_KEY = "myfinances-profile-preferences";

export const PROFILE_PREFERENCES_CHANGE_EVENT = "myfinances-profile-preferences-change";

export type ProfilePreferences = {
  displayName: string;
  preferredCurrency: PreferredCurrency;
};

type StoredProfilePreferences = {
  displayName?: string;
  preferredCurrency?: string;
};

function readStoredRaw(): StoredProfilePreferences | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_PREFERENCES_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProfilePreferences;
  } catch {
    return null;
  }
}

function parseCurrency(value: unknown): PreferredCurrency {
  return typeof value === "string" && isPreferredCurrency(value) ? value : DEFAULT_PREFERRED_CURRENCY;
}

export function readProfilePreferences(): ProfilePreferences | null {
  const data = readStoredRaw();
  if (!data) return null;
  const displayName = typeof data.displayName === "string" ? data.displayName.trim() : "";
  if (!displayName) return null;
  return {
    displayName,
    preferredCurrency: parseCurrency(data.preferredCurrency),
  };
}

export function writeProfilePreferences(preferences: ProfilePreferences): void {
  if (typeof window === "undefined") return;
  const normalized: ProfilePreferences = {
    displayName: preferences.displayName.trim(),
    preferredCurrency: preferences.preferredCurrency,
  };
  window.localStorage.setItem(PROFILE_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(PROFILE_PREFERENCES_CHANGE_EVENT));
}

export function getPreferredCurrency(): PreferredCurrency {
  const data = readStoredRaw();
  return parseCurrency(data?.preferredCurrency);
}

export function setPreferredCurrency(currency: PreferredCurrency): void {
  if (typeof window === "undefined") return;
  const existing = readStoredRaw() ?? {};
  window.localStorage.setItem(
    PROFILE_PREFERENCES_STORAGE_KEY,
    JSON.stringify({ ...existing, preferredCurrency: currency }),
  );
  window.dispatchEvent(new CustomEvent(PROFILE_PREFERENCES_CHANGE_EVENT));
}

export function getStoredDisplayName(): string | null {
  const name = readProfilePreferences()?.displayName;
  return name && name.length > 0 ? name : null;
}

/** Clears cached profile preferences (e.g. on logout) so the next user cannot inherit them. */
export function clearProfilePreferencesCache(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_PREFERENCES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(PROFILE_PREFERENCES_CHANGE_EVENT));
}
