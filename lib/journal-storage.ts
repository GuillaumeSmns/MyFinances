import type { FinanceItem } from "@/components/dashboard/types";

const STORAGE_KEY = "myfinances-journal-months";

export type JournalMonthSnapshot = {
  pilotRevenue: FinanceItem[];
  financialRevenue: FinanceItem[];
  immoRevenue: FinanceItem[];
  pilotExpense: FinanceItem[];
  loanExpense: FinanceItem[];
  everydayExpense: FinanceItem[];
  homeCharges: FinanceItem[];
  investments: FinanceItem[];
  savedAt?: string;
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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

export function getDefaultJournalSnapshot(): JournalMonthSnapshot {
  return {
    pilotRevenue: [
      { id: "rev-basic-salary", label: "Basic salary", amount: 5200 },
      { id: "rev-accommodation", label: "Accommodation allowance", amount: 1300 },
      { id: "rev-layover", label: "Layover allowance", amount: 550 },
      { id: "rev-flight-pay", label: "Flight pay", amount: 1100 },
      { id: "rev-other", label: "Other", amount: 300 },
    ],
    financialRevenue: [
      { id: makeId(), label: "Dividends", amount: 260 },
      { id: makeId(), label: "Side income", amount: 420 },
    ],
    immoRevenue: [{ id: makeId(), label: "Apartment rent", amount: 950 }],
    pilotExpense: [
      { id: "exp-provident", label: "Provident fund deductions", amount: 700 },
      { id: "exp-staff-travel", label: "Staff travel", amount: 180 },
      { id: "exp-pilot-other", label: "Other", amount: 120 },
    ],
    loanExpense: [{ id: makeId(), label: "Car loan", amount: 480 }],
    everydayExpense: [
      { id: makeId(), label: "Groceries", amount: 530 },
      { id: makeId(), label: "Dining", amount: 220 },
    ],
    homeCharges: [
      { id: "home-dewa", label: "DEWA", amount: 260 },
      { id: "home-service-fees", label: "Service fees", amount: 340 },
      { id: "home-other", label: "Other", amount: 90 },
    ],
    investments: [{ id: makeId(), label: "ETF monthly contribution", amount: 400 }],
  };
}

function cloneSnapshot(s: JournalMonthSnapshot): JournalMonthSnapshot {
  return JSON.parse(JSON.stringify(s)) as JournalMonthSnapshot;
}

/**
 * When the user opens a month that has no saved row yet, seed the editor from the
 * chronologically latest month that *is* saved (excluding the target key), or fall back
 * to {@link getDefaultJournalSnapshot} if there is no prior save.
 */
export function createJournalSnapshotForNewMonth(monthKey: string): JournalMonthSnapshot {
  const savedKeys = listSavedMonthKeysChronological().filter((k) => k !== monthKey);
  if (savedKeys.length === 0) {
    return getDefaultJournalSnapshot();
  }
  const latestKey = savedKeys[savedKeys.length - 1];
  const latest = loadJournalMonth(latestKey);
  if (!latest) {
    return getDefaultJournalSnapshot();
  }
  return cloneSnapshot(latest);
}

export function loadAllJournalMonths(): Record<string, JournalMonthSnapshot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, JournalMonthSnapshot>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadJournalMonth(monthKey: string): JournalMonthSnapshot | null {
  const all = loadAllJournalMonths();
  const entry = all[monthKey];
  return entry ? cloneSnapshot(entry) : null;
}

export function saveJournalMonth(monthKey: string, data: JournalMonthSnapshot): void {
  if (typeof window === "undefined") return;
  const all = loadAllJournalMonths();
  all[monthKey] = { ...cloneSnapshot(data), savedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function listSavedMonthKeys(): string[] {
  return Object.keys(loadAllJournalMonths()).sort().reverse();
}

/** Oldest → newest (for timeline reading order). */
export function listSavedMonthKeysChronological(): string[] {
  return Object.keys(loadAllJournalMonths()).sort();
}

export function deleteJournalMonth(monthKey: string): void {
  if (typeof window === "undefined") return;
  const all = loadAllJournalMonths();
  if (!(monthKey in all)) return;
  const next = { ...all };
  delete next[monthKey];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
