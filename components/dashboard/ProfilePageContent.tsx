"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { Check, Palette, UserCircle } from "lucide-react";
import { CurrencySelect } from "@/components/dashboard/profile/CurrencySelect";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { ThemeToggleControl } from "@/components/theme/ThemeToggleControl";
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
  readProfilePreferences,
  writeProfilePreferences,
} from "@/lib/profile-preferences";

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

function readDisplayName(fallbackDisplayName: string): string {
  return readProfilePreferences()?.displayName ?? fallbackDisplayName;
}

export function ProfilePageContent({ account }: { account: ProfilePageAccount }) {
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftCurrency, setDraftCurrency] = useState<PreferredCurrency | null>(null);
  const [draftAssetsCurrency, setDraftAssetsCurrency] = useState<PreferredCurrency | null>(null);
  const [saved, setSaved] = useState(false);

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

  const savedDisplayName = useSyncExternalStore(
    subscribeWithDraftReset,
    () => readDisplayName(account.fallbackDisplayName),
    () => account.fallbackDisplayName,
  );

  const savedCurrency = useSyncExternalStore(
    subscribeWithDraftReset,
    getPreferredCurrency,
    () => DEFAULT_PREFERRED_CURRENCY,
  );

  const savedAssetsCurrency = useSyncExternalStore(
    subscribeWithDraftReset,
    getAssetsDisplayCurrency,
    () => DEFAULT_ASSETS_DISPLAY_CURRENCY,
  );

  const displayName = draftName ?? savedDisplayName;
  const preferredCurrency = draftCurrency ?? savedCurrency;
  const assetsDisplayCurrency = draftAssetsCurrency ?? savedAssetsCurrency;

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 3200);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;
    writeProfilePreferences({ displayName: trimmed, preferredCurrency });
    setAssetsDisplayCurrency(assetsDisplayCurrency);
    setDraftName(null);
    setDraftCurrency(null);
    setDraftAssetsCurrency(null);
    setSaved(true);
  };

  const isDirty =
    displayName.trim() !== savedDisplayName.trim() ||
    preferredCurrency !== savedCurrency ||
    assetsDisplayCurrency !== savedAssetsCurrency;

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
        </div>
      </header>

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
          disabled={!isDirty && !saved}
          className="mf-btn-primary rounded-xl px-5 py-2.5 text-sm font-medium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save changes
        </button>
        {saved && (
          <p
            className="inline-flex items-center gap-1.5 text-sm text-emerald-300/95 mf-light:text-emerald-700"
            role="status"
          >
            <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Preferences saved
          </p>
        )}
      </div>
    </form>
  );
}
