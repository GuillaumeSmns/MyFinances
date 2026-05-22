import { getEmptyAssetsSnapshot, normalizeAssetsSnapshot, type AssetsSnapshot } from "@/lib/assets-model";

export const ASSETS_STORAGE_KEY = "myfinances-assets";

export const ASSETS_CHANGE_EVENT = "myfinances-assets-change";

function cloneSnapshot(snapshot: AssetsSnapshot): AssetsSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as AssetsSnapshot;
}

/** Offline cache of last synced Supabase snapshot (not a source of truth). */
export function readAssetsFromStorage(): AssetsSnapshot {
  if (typeof window === "undefined") return getEmptyAssetsSnapshot();
  const raw = window.localStorage.getItem(ASSETS_STORAGE_KEY);
  if (!raw) return getEmptyAssetsSnapshot();
  try {
    return normalizeAssetsSnapshot(JSON.parse(raw));
  } catch {
    return getEmptyAssetsSnapshot();
  }
}

export function writeAssetsToStorage(snapshot: AssetsSnapshot): void {
  if (typeof window === "undefined") return;
  const payload: AssetsSnapshot = {
    ...cloneSnapshot(snapshot),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(ASSETS_CHANGE_EVENT));
}

export function subscribeToAssets(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === ASSETS_STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener(ASSETS_CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ASSETS_CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
