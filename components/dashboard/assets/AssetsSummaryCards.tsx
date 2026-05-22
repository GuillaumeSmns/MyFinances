"use client";

import { Building2, Droplets, Globe2, Landmark, Layers, Wallet } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatAssetCurrencyAmount } from "@/lib/currency-conversion";
import type { AssetsAnalytics } from "@/lib/assets-model";

type AssetsSummaryCardsProps = {
  analytics: AssetsAnalytics;
};

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  valueClassName = "text-foreground",
}: {
  label: string;
  value: string;
  helper?: string;
  icon: typeof Wallet;
  valueClassName?: string;
}) {
  return (
    <DashboardCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-overlay text-[#f4be7e]">
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClassName}`}>{value}</p>
      {helper && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{helper}</p>}
    </DashboardCard>
  );
}

function riskLabel(score: number, invert = false): string {
  const s = invert ? 100 - score : score;
  if (s < 34) return "Low";
  if (s < 67) return "Moderate";
  return "High";
}

export function AssetsSummaryCards({ analytics }: AssetsSummaryCardsProps) {
  const { displayCurrency } = analytics;
  const fmt = (n: number) =>
    formatAssetCurrencyAmount(n, displayCurrency, { maximumFractionDigits: 0 });

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        label="Total Assets"
        value={fmt(analytics.totalConverted)}
        helper="All holdings converted to your Assets default currency (static FX rates)."
        icon={Wallet}
        valueClassName="text-white mf-light:text-slate-900"
      />
      <MetricCard
        label="Liquid Assets"
        value={fmt(analytics.liquidTotal)}
        helper="Cash, ETFs, stocks, and crypto"
        icon={Droplets}
      />
      <MetricCard
        label="Real Estate"
        value={fmt(analytics.realEstateTotal)}
        helper="Property holdings"
        icon={Building2}
      />
      <MetricCard
        label="Investments"
        value={fmt(analytics.investmentsTotal)}
        helper="ETFs, stocks, and pension accounts"
        icon={Landmark}
      />
      <MetricCard
        label="Currency Risk Score"
        value={`${analytics.currencyRiskScore}`}
        helper={`${riskLabel(analytics.currencyRiskScore)} exposure · /100 (higher = more concentration risk)`}
        icon={Globe2}
        valueClassName={
          analytics.currencyRiskScore >= 67
            ? "text-accent-danger"
            : analytics.currencyRiskScore >= 34
              ? "text-[#f4be7e]"
              : "text-accent-success"
        }
      />
      <MetricCard
        label="Diversification Score"
        value={`${analytics.diversificationScore}`}
        helper={`${riskLabel(analytics.diversificationScore, true)} spread · /100 (higher = better)`}
        icon={Layers}
        valueClassName="text-accent-success"
      />
    </section>
  );
}
