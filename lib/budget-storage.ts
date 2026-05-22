import type { JournalMonthSnapshot } from "@/lib/budget-model";

export const BUDGET_CACHE_KEY = "myfinances-budget-months";

export const BUDGET_CHANGE_EVENT = "myfinances-budget-change";

function cloneRecord(
  record: Record<string, JournalMonthSnapshot>,
): Record<string, JournalMonthSnapshot> {
  return JSON.parse(JSON.stringify(record)) as Record<string, JournalMonthSnapshot>;
}

/** Offline cache of last synced budget months (Overview reads this). */
export function readBudgetMonthsCache(): Record<string, JournalMonthSnapshot> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(BUDGET_CACHE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, JournalMonthSnapshot>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeBudgetMonthsCache(record: Record<string, JournalMonthSnapshot>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BUDGET_CACHE_KEY, JSON.stringify(cloneRecord(record)));
  window.dispatchEvent(new CustomEvent(BUDGET_CHANGE_EVENT));
}

export function writeBudgetMonthToCache(monthKey: string, snapshot: JournalMonthSnapshot): void {
  const all = readBudgetMonthsCache();
  all[monthKey] = snapshot;
  writeBudgetMonthsCache(all);
}

export function removeBudgetMonthFromCache(monthKey: string): void {
  const all = readBudgetMonthsCache();
  if (!(monthKey in all)) return;
  const next = { ...all };
  delete next[monthKey];
  writeBudgetMonthsCache(next);
}
