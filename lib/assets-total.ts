import {
  computeJournalOverviewMetrics,
  getLatestSavedJournalFromStorage,
} from "@/lib/journal-overview";
import { formatMonthLabel } from "@/lib/journal-storage";

const ASSETS_TOTAL_STORAGE_KEY = "myfinances-total-assets";

export type AssetsTotalSnapshot = {
  totalAssets: number;
  updatedAt?: string;
};

export type ResolvedAssetsTotal = {
  totalAssets: number;
  sourceLabel: string;
};

/**
 * Reads persisted total assets (browser only).
 * Assets page can write to this key in a future release without changing this API.
 */
export function loadAssetsTotalSnapshot(): AssetsTotalSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ASSETS_TOTAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssetsTotalSnapshot;
    if (typeof parsed.totalAssets !== "number" || !Number.isFinite(parsed.totalAssets)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Until the Assets page persists a grand total, fall back to the latest Budget
 * month investment-line sum (read-only; does not modify Budget storage).
 */
export function getLatestBudgetAssetsProxy(): ResolvedAssetsTotal | null {
  if (typeof window === "undefined") return null;
  const latest = getLatestSavedJournalFromStorage();
  if (!latest) return null;
  const metrics = computeJournalOverviewMetrics(latest.snapshot);
  return {
    totalAssets: metrics.totalInvestments,
    sourceLabel: `Budget investments total (${formatMonthLabel(latest.monthKey)})`,
  };
}

/** Prefer saved Assets total; otherwise Budget investments proxy. */
export function resolveTotalAssetsForRetirement(): ResolvedAssetsTotal | null {
  const saved = loadAssetsTotalSnapshot();
  if (saved) {
    return { totalAssets: saved.totalAssets, sourceLabel: "Saved Assets total" };
  }
  return getLatestBudgetAssetsProxy();
}
