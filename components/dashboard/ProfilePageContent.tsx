"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { AlertCircle, Check, Loader2, Palette, UserCircle } from "lucide-react";
import { CurrencySelect } from "@/components/dashboard/profile/CurrencySelect";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { ThemeToggleControl } from "@/components/theme/ThemeToggleControl";
import { useTheme } from "@/components/theme/ThemeProvider";
import { DEFAULT_PREFERRED_CURRENCY, type PreferredCurrency } from "@/lib/currency";
import {
  DEFAULT_ASSETS_DISPLAY_CURRENCY,
  getAssetsDisplayCurrency,
  setAssetsDisplayCurrency,
  subscribeToAssetsDisplayCurrency,
} from "@/lib/assets-preferences";
import {
  getPreferredCurrency,
  PROFILE_PREFERENCES_CHANGE_EVENT,
  PROFILE_PREFERENCES_STORAGE_KEY,
  writeProfilePreferences,
} from "@/lib/profile-preferences";
import {
  applyUserProfileToClient,
  ensureUserProfile,
  toSyncedProfile,
  updateUserProfile,
  type SyncedProfile,
} from "@/lib/user-profile";
import { createClient } from "@/utils/supabase/client";

export type ProfilePageAccount = {
  email: string;
  accountStatus: string;
  memberSince: string;
  fallbackDisplayName: string;
};

const inputClass =
  "w-full max-w-md rounded-xl border border-white/12 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-border-strong focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:placeholder:text-slate-400 mf-light:hover:border-slate-300";

function ProfileReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] py-3 last:border-b-0 mf-light:border-slate-200/80">
      <dt className="text-xs font-medium uppercase tracking-wide text-faint">{label}</dt>
      <dd className="text-sm text-secondary">{value}</dd>
    </div>
  );
}

function subscribeToProfilePreferences(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PROFILE_PREFERENCES_STORAGE_KEY || e.key === null) onStoreChange();
  };
  const unsubAssets = subscribeToAssetsDisplayCurrency(onStoreChange);
  window.addEventListener(PROFILE_PREFERENCES_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    unsubAssets();
    window.removeEventListener(PROFILE_PREFERENCES_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

type ProfileLoadState = "idle" | "loading" | "ready" | "error";

export function ProfilePageContent({
  account,
  userId,
}: {
  account: ProfilePageAccount;
  userId: string | null;
}) {
  const { theme: currentTheme } = useTheme();
  const [syncedProfile, setSyncedProfile] = useState<SyncedProfile | null>(null);
  const [loadState, setLoadState] = useState<ProfileLoadState>(() => (userId ? "loading" : "ready"));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftCurrency, setDraftCurrency] = useState<PreferredCurrency | null>(null);
  const [draftAssetsCurrency, setDraftAssetsCurrency] = useState<PreferredCurrency | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const subscribeWithDraftReset = useCallback(
    (onStoreChange: () => void) =>
      subscribeToProfilePreferences(() => {
        setDraftName(null);
        setDraftCurrency(null);
        setDraftAssetsCurrency(null);
        onStoreChange();
      }),
    [],
  );

  const savedDisplayName =
    syncedProfile?.displayName ?? account.fallbackDisplayName;

  const savedCurrency = useSyncExternalStore(
    subscribeWithDraftReset,
    () => syncedProfile?.budgetCurrency ?? getPreferredCurrency(),
    () => DEFAULT_PREFERRED_CURRENCY,
  );

  const savedAssetsCurrency = useSyncExternalStore(
    subscribeWithDraftReset,
    () => syncedProfile?.assetsCurrency ?? getAssetsDisplayCurrency(),
    () => DEFAULT_ASSETS_DISPLAY_CURRENCY,
  );

  const displayName = draftName ?? savedDisplayName;
  const preferredCurrency = draftCurrency ?? savedCurrency;
  const assetsDisplayCurrency = draftAssetsCurrency ?? savedAssetsCurrency;

  useEffect(() => {
    const uid = userId;
    if (!uid) return;

    let cancelled = false;

    async function loadProfile(forUserId: string) {
      setSyncedProfile(null);
      setDraftName(null);
      setDraftCurrency(null);
      setDraftAssetsCurrency(null);
      setLoadError(null);
      setLoadState("loading");
      try {
        const supabase = createClient();
        const row = await ensureUserProfile(supabase, forUserId, account.fallbackDisplayName);
        if (cancelled) return;
        applyUserProfileToClient(row);
        setSyncedProfile(toSyncedProfile(row));
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Could not load profile.");
        setLoadState("error");
      }
    }

    void loadProfile(uid);
    return () => {
      cancelled = true;
    };
  }, [userId, account.fallbackDisplayName]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 3200);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed || !userId || !syncedProfile) return;

    setSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const row = await updateUserProfile(supabase, userId, {
        display_name: trimmed,
        budget_currency: preferredCurrency,
        assets_currency: assetsDisplayCurrency,
        theme: currentTheme,
      });
      applyUserProfileToClient(row);
      setSyncedProfile(toSyncedProfile(row));
      setDraftName(null);
      setDraftCurrency(null);
      setDraftAssetsCurrency(null);
      setSaved(true);
    } catch (err) {
      writeProfilePreferences({ displayName: trimmed, preferredCurrency });
      setAssetsDisplayCurrency(assetsDisplayCurrency);
      setSaveError(
        err instanceof Error
          ? `${err.message} Preferences were saved locally only.`
          : "Could not save to the server. Preferences were saved locally only.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    loadState === "ready" &&
    syncedProfile !== null &&
    (displayName.trim() !== syncedProfile.displayName.trim() ||
      preferredCurrency !== syncedProfile.budgetCurrency ||
      assetsDisplayCurrency !== syncedProfile.assetsCurrency ||
      currentTheme !== syncedProfile.theme);

  const formDisabled = loadState === "loading" || saving || syncedProfile === null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <UserCircle className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your account and workspace preferences in one place.
          </p>
          {loadState === "loading" && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Syncing preferences…
            </p>
          )}
        </div>
      </header>

      {loadError && (
        <p
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100/95"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {loadError}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Account" subtitle="Identity and plan status">
          <dl>
            <div className="flex flex-col gap-1.5 border-b border-white/[0.06] py-3 mf-light:border-slate-200/80">
              <dt className="text-xs font-medium uppercase tracking-wide text-faint">Name</dt>
              <dd>
                <input
                  id="profile-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDraftName(e.target.value)}
                  autoComplete="name"
                  required
                  maxLength={80}
                  disabled={formDisabled}
                  className={inputClass}
                />
              </dd>
            </div>
            <ProfileReadOnlyRow label="Email" value={account.email} />
            <ProfileReadOnlyRow label="Account status" value={account.accountStatus} />
            <ProfileReadOnlyRow label="Member since" value={account.memberSince} />
          </dl>
        </DashboardCard>

        <DashboardCard
          title="Workspace defaults"
          subtitle="Currency preferences for Budget, Overview, and Assets"
          className="relative z-20 overflow-visible"
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Budget / Overview currency
              </p>
              <CurrencySelect
                id="profile-currency"
                value={preferredCurrency}
                onChange={setDraftCurrency}
                aria-label="Preferred currency for Budget and Overview"
              />
              <p className="text-xs text-faint">
                Updates currency labels on Overview and Budget. Amounts are not converted.
              </p>
            </div>
            <div className="border-t border-border-subtle pt-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-faint">
                  Assets default currency
                </p>
                <CurrencySelect
                  id="profile-assets-currency"
                  value={assetsDisplayCurrency}
                  onChange={setDraftAssetsCurrency}
                  aria-label="Assets default currency"
                />
                <p className="text-xs text-faint">
                  Converts Assets summaries, charts, and risk scores (static FX). Does not affect Budget or
                  Overview.
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Appearance"
          subtitle="Dark mode is the default MyFinances look"
          className="lg:col-span-2"
          titleIcon={
            <IconBox>
              <Palette className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <ThemeToggleControl />
        </DashboardCard>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={formDisabled || (!isDirty && !saved)}
          className="mf-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <p
            className="inline-flex items-center gap-1.5 text-sm text-emerald-300/95 mf-light:text-emerald-700"
            role="status"
          >
            <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Profile saved
          </p>
        )}
        {saveError && (
          <p className="inline-flex items-center gap-1.5 text-sm text-amber-200/95" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {saveError}
          </p>
        )}
      </div>
    </form>
  );
}
