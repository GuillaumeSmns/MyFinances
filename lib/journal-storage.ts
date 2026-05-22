export type { BudgetCategory, BudgetTabId, JournalMonthSnapshot, LegacyJournalMonthSnapshot } from "@/lib/budget-model";
export {
  cloneSnapshotAsNewDraft,
  getDefaultJournalSnapshot,
  getStarterJournalSnapshot,
} from "@/lib/budget-model";

export function monthKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthKey(key: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function formatMonthLabel(key: string): string {
  const parsed = parseMonthKey(key);
  if (!parsed) return key;
  return new Date(parsed.year, parsed.month - 1, 1).toLocaleDateString("en-AE", {
    month: "long",
    year: "numeric",
  });
}
