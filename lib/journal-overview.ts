import type { JournalMonthSnapshot } from "@/lib/budget-model";
import { computeBudgetTotals, getLoanTotal, sumCategory } from "@/lib/budget-model";
import type { BudgetCategory } from "@/lib/budget-model";
import { loadAllJournalMonths, listSavedMonthKeys } from "@/lib/journal-storage";

export type JournalOverviewMetrics = {
  monthlyRevenue: number;
  monthlyExpenses: number;
  surplus: number;
  savingsRate: number;
  /** Sum of Loan category (monthly loan line items in Budget) */
  totalDebts: number;
  /** Sum of Investments tab categories */
  totalInvestments: number;
  netCashFlow: number;
};

export type JournalDerivedHealth = {
  liquidityScore: number;
  debtToIncome: number;
};

export type CashflowMonthPoint = {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  expenses: number;
};

export function computeJournalOverviewMetrics(snapshot: JournalMonthSnapshot): JournalOverviewMetrics {
  const { totalRevenues, totalInvestments, totalExpenses, surplus } = computeBudgetTotals(snapshot);
  const savingsRate = totalRevenues > 0 ? Math.round((surplus / totalRevenues) * 100) : 0;

  return {
    monthlyRevenue: totalRevenues,
    monthlyExpenses: totalExpenses,
    surplus,
    savingsRate,
    totalDebts: getLoanTotal(snapshot),
    totalInvestments,
    netCashFlow: surplus,
  };
}

export function computeJournalDerivedHealth(
  metrics: JournalOverviewMetrics,
): JournalDerivedHealth {
  const debtToIncome =
    metrics.monthlyRevenue > 0 ? metrics.totalDebts / metrics.monthlyRevenue : 0;
  const liquidityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(38 + metrics.savingsRate * 0.85 + (metrics.surplus >= 0 ? 18 : -12)),
    ),
  );
  return { liquidityScore, debtToIncome };
}

/** Short label for chart axis, e.g. Jan '26 */
export function formatChartMonthLabel(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length !== 2) return monthKey;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return monthKey;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-AE", { month: "short", year: "2-digit" }).replace(" ", " ");
}

/**
 * Builds one point per saved month, chronological (oldest → newest) for charts.
 * Pass the raw record from `loadAllJournalMonths()` (browser only).
 */
export function buildCashflowSeriesFromRecord(
  all: Record<string, JournalMonthSnapshot>,
): CashflowMonthPoint[] {
  return Object.keys(all)
    .sort()
    .map((monthKey) => {
      const snap = all[monthKey];
      const m = computeJournalOverviewMetrics(snap);
      return {
        monthKey,
        monthLabel: formatChartMonthLabel(monthKey),
        revenue: m.monthlyRevenue,
        expenses: m.monthlyExpenses,
      };
    });
}

/** Latest saved month key, or null if none. Uses same ordering as `listSavedMonthKeys()` (newest first). */
export function getLatestSavedJournalMonthKey(): string | null {
  const keys = listSavedMonthKeys();
  return keys[0] ?? null;
}

/**
 * Reads storage and returns latest snapshot + key, or null.
 * Browser-only; returns null on server or empty storage.
 */
export function getLatestSavedJournalFromStorage(): {
  monthKey: string;
  snapshot: JournalMonthSnapshot;
} | null {
  if (typeof window === "undefined") return null;
  const key = getLatestSavedJournalMonthKey();
  if (!key) return null;
  const all = loadAllJournalMonths();
  const snap = all[key];
  return snap ? { monthKey: key, snapshot: snap } : null;
}

/** Category breakdown for visualization panels. */
export function buildCategoryBreakdown(categories: BudgetCategory[]) {
  return categories.map((cat) => ({
    name: cat.title,
    total: sumCategory(cat),
  }));
}
