"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, startTransition } from "react";
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
  Scale,
  Wallet,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { SAMPLE_ASSET_ALLOCATION } from "@/components/dashboard/AssetAllocationChart";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
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
import { formatMonthLabel, loadAllJournalMonths, monthKeyFromDate } from "@/lib/journal-storage";

const MonthlyCashflowChart = dynamic(
  () => import("@/components/dashboard/MonthlyCashflowChart").then((m) => m.MonthlyCashflowChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const AssetAllocationChart = dynamic(
  () => import("@/components/dashboard/AssetAllocationChart").then((m) => m.AssetAllocationChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-xl bg-white/[0.04] text-xs text-slate-500"
      style={{ height: 320 }}
    >
      Loading chart…
    </div>
  );
}

const FALLBACK_METRICS: JournalOverviewMetrics = {
  monthlyRevenue: 8450,
  monthlyExpenses: 6120,
  surplus: 2330,
  savingsRate: 28,
  totalDebts: 127500,
  totalInvestments: 48200,
  netCashFlow: 2330,
};

const FALLBACK_HEALTH: JournalDerivedHealth = {
  liquidityScore: 82,
  debtToIncome: 0.18,
};

function buildSampleCashflowSeries(): CashflowMonthPoint[] {
  const out: CashflowMonthPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthKeyFromDate(d);
    const base = 7600 + (5 - i) * 140;
    out.push({
      monthKey,
      monthLabel: formatChartMonthLabel(monthKey),
      revenue: Math.round(base + i * 50),
      expenses: Math.round(base * 0.72 + i * 40),
    });
  }
  return out;
}

export function OverviewPageContent() {
  const [mounted, setMounted] = useState(false);
  const [hasJournalData, setHasJournalData] = useState(false);
  const [latestMonthKey, setLatestMonthKey] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<JournalOverviewMetrics>(FALLBACK_METRICS);
  const [health, setHealth] = useState<JournalDerivedHealth>(FALLBACK_HEALTH);
  const [cashflowData, setCashflowData] = useState<CashflowMonthPoint[]>(() => buildSampleCashflowSeries());
  const [cashflowIsSample, setCashflowIsSample] = useState(true);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      const all = loadAllJournalMonths();
      if (Object.keys(all).length === 0) {
        setHasJournalData(false);
        setLatestMonthKey(null);
        setMetrics(FALLBACK_METRICS);
        setHealth(FALLBACK_HEALTH);
        setCashflowData(buildSampleCashflowSeries());
        setCashflowIsSample(true);
        return;
      }

      setHasJournalData(true);
      const latest = getLatestSavedJournalFromStorage();
      if (!latest) {
        setHasJournalData(false);
        setMetrics(FALLBACK_METRICS);
        setHealth(FALLBACK_HEALTH);
        setCashflowData(buildSampleCashflowSeries());
        setCashflowIsSample(true);
        return;
      }

      setLatestMonthKey(latest.monthKey);
      const m = computeJournalOverviewMetrics(latest.snapshot);
      setMetrics(m);
      setHealth(computeJournalDerivedHealth(m));
      setCashflowData(buildCashflowSeriesFromRecord(all));
      setCashflowIsSample(false);
    });
  }, []);

  const {
    monthlyRevenue,
    monthlyExpenses,
    surplus,
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

  const debtsHelper = hasJournalData
    ? "Sum of Loan section lines (this month)"
    : "Outstanding liabilities (sample)";
  const investmentsHelper = hasJournalData
    ? "Sum of Investment allocations (this month)"
    : "Portfolio value (sample)";
  const netCashHelper = hasJournalData ? "Revenue − expenses (latest saved month)" : "Revenue minus expenses (sample)";

  const revExpSubtitle = hasJournalData && latestMonthKey
    ? `Latest saved month · ${formatMonthLabel(latestMonthKey)}`
    : "This month (sample)";

  const healthSubtitle = hasJournalData
    ? "Derived from your latest saved month in Budget"
    : "Quick signals (sample)";

  const cashflowCardSubtitle = cashflowIsSample
    ? "Sample monthly trend — save months in Budget to see your data"
    : "All saved months · AED";

  return (
    <div className="space-y-8">
      {!hasJournalData && mounted && (
        <p className="rounded-lg border border-amber-300/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100/95">
          No budget data saved yet. Showing sample overview.
        </p>
      )}

      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mf-light:text-slate-900">Overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400 mf-light:text-slate-600">
            {hasJournalData && latestMonthKey
              ? `Figures reflect your most recent month saved in Budget (${formatMonthLabel(latestMonthKey)}). Health signals are derived from that snapshot.`
              : "Monthly snapshot and financial health at a glance. Save a month in Budget to replace sample figures."}
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total monthly revenue" value={monthlyRevenue} tone="positive" icon={ArrowUpRight} />
        <SummaryCard
          label="Total investments"
          value={totalInvestments}
          tone="accent"
          helper={investmentsHelper}
          icon={Landmark}
        />
        <SummaryCard label="Total monthly expenses" value={monthlyExpenses} tone="negative" icon={ArrowDownRight} />
        <SummaryCard
          label="Monthly surplus / deficit"
          value={surplus}
          tone={surplus >= 0 ? "positive" : "negative"}
          helper={surplus >= 0 ? "Cash-positive month" : "Review spending in Budget"}
          icon={Scale}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total debts" value={totalDebts} helper={debtsHelper} icon={CreditCard} />
        <SummaryCard
          label="Net cash flow"
          value={netCashFlow}
          tone={netCashFlow >= 0 ? "positive" : "negative"}
          helper={netCashHelper}
          icon={Wallet}
        />
        <SummaryCard
          label="Savings rate"
          value={savingsRate}
          format="percent"
          helper="Of after-tax inflows"
          icon={Percent}
        />
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
              AED {monthlyRevenue.toLocaleString()}
            </span>
            <span className="flex items-center gap-2 text-rose-500 mf-light:text-rose-800">
              <ArrowDownRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              AED {monthlyExpenses.toLocaleString()}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="flex h-full">
              <div className="bg-emerald-400/85" style={{ width: `${revenueShare}%` }} />
              <div className="mf-expense-fill h-full" style={{ width: `${expenseShare}%` }} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Bar width reflects relative scale of revenue and expenses.</p>
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
                <Activity className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.5} aria-hidden />
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
        </DashboardCard>

        <DashboardCard
          title="Asset allocation"
          subtitle="Portfolio mix (illustrative)"
          titleIcon={
            <IconBox>
              <PieChart className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <AssetAllocationChart data={SAMPLE_ASSET_ALLOCATION} />
          <p className="mt-4 border-t border-white/10 pt-3 text-center text-xs text-slate-500">
            Sample asset allocation — will connect to Assets data later.
          </p>
        </DashboardCard>
      </section>
    </div>
  );
}
