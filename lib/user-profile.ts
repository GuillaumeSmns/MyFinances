import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_ASSETS_DISPLAY_CURRENCY,
  getAssetsDisplayCurrency,
  setAssetsDisplayCurrency,
} from "@/lib/assets-preferences";
import {
  DEFAULT_PREFERRED_CURRENCY,
  isPreferredCurrency,
  type PreferredCurrency,
} from "@/lib/currency";
import { getPreferredCurrency, writeProfilePreferences } from "@/lib/profile-preferences";
import { persistThemeClient, readStoredTheme, type MfTheme } from "@/lib/theme-storage";

export type UserProfileRow = {
  id: string;
  display_name: string;
  budget_currency: PreferredCurrency;
  assets_currency: PreferredCurrency;
  theme: MfTheme;
  created_at: string;
  updated_at: string;
};

export type SyncedProfile = {
  displayName: string;
  budgetCurrency: PreferredCurrency;
  assetsCurrency: PreferredCurrency;
  theme: MfTheme;
};

function parseTheme(value: unknown): MfTheme {
  return value === "light" ? "light" : "dark";
}

function parseProfileRow(row: Record<string, unknown>): UserProfileRow | null {
  const id = typeof row.id === "string" ? row.id : null;
  const displayName = typeof row.display_name === "string" ? row.display_name.trim() : "";
  if (!id || !displayName) return null;

  const budgetRaw = row.budget_currency;
  const assetsRaw = row.assets_currency;

  return {
    id,
    display_name: displayName,
    budget_currency:
      typeof budgetRaw === "string" && isPreferredCurrency(budgetRaw)
        ? budgetRaw
        : DEFAULT_PREFERRED_CURRENCY,
    assets_currency:
      typeof assetsRaw === "string" && isPreferredCurrency(assetsRaw)
        ? assetsRaw
        : DEFAULT_ASSETS_DISPLAY_CURRENCY,
    theme: parseTheme(row.theme),
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
}

export function toSyncedProfile(row: UserProfileRow): SyncedProfile {
  return {
    displayName: row.display_name,
    budgetCurrency: row.budget_currency,
    assetsCurrency: row.assets_currency,
    theme: row.theme,
  };
}

/** Mirror Supabase profile into localStorage / theme cookie (client cache). */
export function applyUserProfileToClient(profile: UserProfileRow): void {
  writeProfilePreferences({
    displayName: profile.display_name,
    preferredCurrency: profile.budget_currency,
  });
  setAssetsDisplayCurrency(profile.assets_currency);
  persistThemeClient(profile.theme);
}

/** Resolve display name from auth metadata / email — never from localStorage. */
export function resolveAuthDisplayName(
  userMetadata: Record<string, unknown> | undefined,
  email: string | undefined,
): string {
  const fullName = userMetadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  const emailLocal = email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal;
  return "Guest";
}

export function buildDefaultProfileInsert(
  userId: string,
  displayName: string,
): Omit<UserProfileRow, "created_at" | "updated_at"> {
  return {
    id: userId,
    display_name: displayName.trim() || "Guest",
    budget_currency: getPreferredCurrency(),
    assets_currency: getAssetsDisplayCurrency(),
    theme: readStoredTheme("dark"),
  };
}

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return parseProfileRow(data as Record<string, unknown>);
}

export async function createUserProfile(
  supabase: SupabaseClient,
  insert: Omit<UserProfileRow, "created_at" | "updated_at">,
): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: insert.id,
      display_name: insert.display_name,
      budget_currency: insert.budget_currency,
      assets_currency: insert.assets_currency,
      theme: insert.theme,
    })
    .select("*")
    .single();

  if (error) throw error;
  const parsed = parseProfileRow(data as Record<string, unknown>);
  if (!parsed) throw new Error("Invalid profile row returned after insert.");
  return parsed;
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  displayNameFallback: string,
): Promise<UserProfileRow> {
  const existing = await fetchUserProfile(supabase, userId);
  if (existing) return existing;

  const insert = buildDefaultProfileInsert(userId, displayNameFallback);

  try {
    return await createUserProfile(supabase, insert);
  } catch (err) {
    const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";
    if (code === "23505") {
      const raced = await fetchUserProfile(supabase, userId);
      if (raced) return raced;
    }
    throw err;
  }
}

export type ProfileUpdatePayload = {
  display_name: string;
  budget_currency: PreferredCurrency;
  assets_currency: PreferredCurrency;
  theme: MfTheme;
};

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: payload.display_name,
      budget_currency: payload.budget_currency,
      assets_currency: payload.assets_currency,
      theme: payload.theme,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  const parsed = parseProfileRow(data as Record<string, unknown>);
  if (!parsed) throw new Error("Invalid profile row returned after update.");
  return parsed;
}
