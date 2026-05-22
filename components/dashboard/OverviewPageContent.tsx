"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Landmark,
  LayoutDashboard,
  LineChart,
  Percent,
  PieChart,
  Wallet,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { useAssetsDisplayCurrency } from "@/components/preferences/useAssetsDisplayCurrency";
import { readAssetsAllocationForOverview } from "@/lib/assets-overview";
import type { CategoryAllocationSlice } from "@/lib/assets-model";
import { ASSETS_CHANGE_EVENT } from "@/lib/assets-storage";
import { ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT } from "@/lib/assets-preferences";
import { CashflowAmountLine } from "@/components/dashboard/overview/CashflowAmountLine";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { useCurrency } from "@/components/preferences/CurrencyProvider";
import {
  buildCashflowSeriesFromRecord,
  computeJournalDerivedHealth,
  computeJournalOverviewMetrics,
  formatChartMonthLabel,
  getLatestSavedJournalFromStorage,
  type CashflowMonthPoint,
  type JournalDerivedHealth,
  type JournalOverviewMetrics,
} from "@/lib/journal-overview";
import { readBudgetMonthsCache, BUDGET_CHANGE_EVENT } from "@/lib/budget-storage";
import { formatMonthLabel, monthKeyFromDate } from "@/lib/journal-storage";

const MonthlyCashflowChart = dynamic(
  () => import("@/components/dashboard/MonthlyCashflowChart").then((m) => m.MonthlyCashflowChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const PatrimonyAllocationChart = dynamic(
  () =>
    import("@/components/dashboard/assets/PatrimonyAllocationChart").then(
      (m) => m.PatrimonyAllocationChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-xl bg-white/[0.04] text-xs text-faint"
      style={{ height: 320 }}
    >
      Loading chart…
    </div>
  );
}

const EMPTY_OVERVIEW_METRICS: JournalOverviewMetrics = {
  monthlyRevenue: 0,
  monthlyExpenses: 0,
  surplus: 0,
  savingsRate: 0,
  totalDebts: 0,
  totalInvestments: 0,
  netCashFlow: 0,
};

const EMPTY_HEALTH: JournalDerivedHealth = {
  liquidityScore: 0,
  debtToIncome: 0,
};

function buildEmptyCashflowSeries(): CashflowMonthPoint[] {
  const out: CashflowMonthPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthKeyFromDate(d);
    out.push({
      monthKey,
      monthLabel: formatChartMonthLabel(monthKey),
      revenue: 0,
      expenses: 0,
    });
  }
  return out;
}

export function OverviewPageContent() {
  const [mounted, setMounted] = useState(false);
  const [hasJournalData, setHasJournalData] = useState(false);
  const [latestMonthKey, setLatestMonthKey] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<JournalOverviewMetrics>(EMPTY_OVERVIEW_METRICS);
  const [health, setHealth] = useState<JournalDerivedHealth>(EMPTY_HEALTH);
  const [cashflowData, setCashflowData] = useState<CashflowMonthPoint[]>(() => buildEmptyCashflowSeries());
  const [cashflowIsSample, setCashflowIsSample] = useState(true);
  const assetsDisplayCurrency = useAssetsDisplayCurrency();
  const [categoryAllocation, setCategoryAllocation] = useState<CategoryAllocationSlice[]>([]);

  useEffect(() => {
    const refreshAssets = () => {
      setCategoryAllocation(readAssetsAllocationForOverview());
    };
    refreshAssets();
    window.addEventListener(ASSETS_CHANGE_EVENT, refreshAssets);
    window.addEventListener(ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT, refreshAssets);
    return () => {
      window.removeEventListener(ASSETS_CHANGE_EVENT, refreshAssets);
      window.removeEventListener(ASSETS_DISPLAY_CURRENCY_CHANGE_EVENT, refreshAssets);
    };
  }, []);

  const refreshBudgetOverview = useCallback(() => {
    const all = readBudgetMonthsCache();
    if (Object.keys(all).length === 0) {
      setHasJournalData(false);
      setLatestMonthKey(null);
      setMetrics(EMPTY_OVERVIEW_METRICS);
      setHealth(EMPTY_HEALTH);
      setCashflowData(buildEmptyCashflowSeries());
      setCashflowIsSample(true);
      return;
    }

    setHasJournalData(true);
    const latest = getLatestSavedJournalFromStorage();
    if (!latest) {
      setHasJournalData(false);
      setMetrics(EMPTY_OVERVIEW_METRICS);
      setHealth(EMPTY_HEALTH);
      setCashflowData(buildEmptyCashflowSeries());
      setCashflowIsSample(true);
      return;
    }

    setLatestMonthKey(latest.monthKey);
    const m = computeJournalOverviewMetrics(latest.snapshot);
    setMetrics(m);
    setHealth(computeJournalDerivedHealth(m));
    setCashflowData(buildCashflowSeriesFromRecord(all));
    setCashflowIsSample(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      refreshBudgetOverview();
    });
  }, [refreshBudgetOverview]);

  useEffect(() => {
    const onBudgetChange = () => refreshBudgetOverview();
    window.addEventListener(BUDGET_CHANGE_EVENT, onBudgetChange);
    return () => window.removeEventListener(BUDGET_CHANGE_EVENT, onBudgetChange);
  }, [refreshBudgetOverview]);

  const { formatAmount, currencyCode } = useCurrency();

  const {
    monthlyRevenue,
    monthlyExpenses,
    savingsRate,
    totalDebts,
    totalInvestments,
    netCashFlow,
  } = metrics;

  const expenseShare = useMemo(
    () =>
      monthlyRevenue + monthlyExpenses > 0 ? (monthlyExpenses / (monthlyRevenue + monthlyExpenses)) * 100 : 0,
    [monthlyRevenue, monthlyExpenses],
  );
  const revenueShare = 100 - expenseShare;

  const debtsHelper = hasJournalData ? undefined : "From Loan in Budget (0 until you add amounts)";
  const investmentsHelper = hasJournalData ? undefined : "From Investments tab (0 until you add amounts)";
  const netCashHelper = hasJournalData ? "Revenue − expenses" : "Revenue minus expenses";

  const revExpSubtitle = hasJournalData && latestMonthKey
    ? `Latest saved month · ${formatMonthLabel(latestMonthKey)}`
    : "No saved month yet";

  const healthSubtitle = hasJournalData
    ? "Derived from your latest saved month in Budget"
    : "Derived from Budget once you save a month";

  const cashflowCardSubtitle = cashflowIsSample
    ? "No saved months yet — save in Budget to build your trend"
    : `All saved months · ${currencyCode}`;

  return (
    <div className="space-y-8">
      {!hasJournalData && mounted && (
        <p className="rounded-lg border border-amber-300/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100/95">
          No budget data saved yet. Figures below are zero until you add amounts in Budget.
        </p>
      )}

      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {hasJournalData && latestMonthKey
              ? `Figures reflect your most recent month saved in Budget (${formatMonthLabel(latestMonthKey)}). Health signals are derived from that snapshot.`
              : "Monthly snapshot and financial health at a glance. Save a month in Budget to populate these cards."}
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Monthly Revenue" value={monthlyRevenue} tone="positive" icon={ArrowUpRight} />
        <SummaryCard
          label="Monthly Investments"
          value={totalInvestments}
          tone="accent"
          helper={investmentsHelper}
          icon={Landmark}
        />
        <SummaryCard label="Monthly Expenses" value={monthlyExpenses} tone="negative" icon={ArrowDownRight} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Monthly loan repayments" value={totalDebts} helper={debtsHelper} icon={CreditCard} />
        <SummaryCard
          label="Cashflow"
          value={netCashFlow}
          format="signed-currency"
          tone={netCashFlow >= 0 ? "positive" : "negative"}
          helper={netCashHelper}
          icon={Wallet}
        />
        <SummaryCard label="Savings rate" value={savingsRate} format="percent" icon={Percent} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Revenue vs expenses"
          subtitle={revExpSubtitle}
          titleIcon={
            <IconBox>
              <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <div className="mb-3 flex justify-between text-sm">
            <span className="flex items-center gap-2 text-emerald-300">
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              {formatAmount(monthlyRevenue)}
            </span>
            <span className="flex items-center gap-2 text-accent-danger">
              <ArrowDownRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              {formatAmount(monthlyExpenses)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="flex h-full">
              <div className="bg-emerald-400/85" style={{ width: `${revenueShare}%` }} />
              <div className="mf-expense-fill h-full" style={{ width: `${expenseShare}%` }} />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Health indicators"
          subtitle={healthSubtitle}
          titleIcon={
            <IconBox>
              <Activity className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <ul className="space-y-4">
            <li className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-slate-300">
                <Activity className="h-4 w-4 shrink-0 text-faint" strokeWidth={1.5} aria-hidden />
                Liquidity score
              </span>
              <span className="text-sm font-medium text-cyan-200">{health.liquidityScore}/100</span>
            </li>
            <li className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-400/80" style={{ width: `${health.liquidityScore}%` }} />
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Debt-to-income (monthly)</span>
              <span className="text-slate-200">{Math.round(health.debtToIncome * 100)}%</span>
            </li>
          </ul>
        </DashboardCard>
      </section>

      <section className="space-y-6">
        <DashboardCard
          title="Monthly cash flow"
          subtitle={cashflowCardSubtitle}
          titleIcon={
            <IconBox>
              <LineChart className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <MonthlyCashflowChart data={cashflowData} />
          <div className="mt-4 border-t border-border pt-4">
            <CashflowAmountLine value={netCashFlow} />
            <p className="mt-1 text-xs text-faint">
              {hasJournalData && latestMonthKey
                ? `Latest saved month · ${formatMonthLabel(latestMonthKey)}`
                : "No saved month yet"}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Asset allocation"
          subtitle={
            categoryAllocation.length > 0
              ? `By category · converted to ${assetsDisplayCurrency}`
              : "From Assets · by category"
          }
          titleIcon={
            <IconBox>
              <PieChart className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <PatrimonyAllocationChart
            slices={categoryAllocation}
            displayCurrency={assetsDisplayCurrency}
          />
        </DashboardCard>
      </section>
    </div>
  );
}
