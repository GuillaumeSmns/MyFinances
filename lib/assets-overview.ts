import {
  computeAssetsAnalytics,
  normalizeAssetsSnapshot,
  type CategoryAllocationSlice,
} from "@/lib/assets-model";
import { getAssetsDisplayCurrency } from "@/lib/assets-preferences";
import { ASSETS_STORAGE_KEY } from "@/lib/assets-storage";

/** Read patrimony allocation slices for Overview chart (client-only). */
export function readAssetsAllocationForOverview(): CategoryAllocationSlice[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ASSETS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const snapshot = normalizeAssetsSnapshot(JSON.parse(raw));
    const analytics = computeAssetsAnalytics(snapshot, getAssetsDisplayCurrency());
    return analytics.categoryAllocation;
  } catch {
    return [];
  }
}
