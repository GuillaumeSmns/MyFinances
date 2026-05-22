"use client";

import { Shield } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import type { RiskMetric } from "@/lib/assets-model";

type AssetRiskMetricsProps = {
  metrics: RiskMetric[];
};

function levelColor(level: RiskMetric["level"], invert = false): string {
  const effective =
    invert
      ? level === "Low"
        ? "High"
        : level === "High"
          ? "Low"
          : "Moderate"
      : level;
  if (effective === "Low") return "text-accent-success";
  if (effective === "High") return "text-accent-danger";
  return "text-[#f4be7e]";
}

export function AssetRiskMetrics({ metrics }: AssetRiskMetricsProps) {
  return (
    <DashboardCard
      title="Risk & Exposure"
      subtitle="Transparent scores based on converted patrimony values"
      titleIcon={
        <IconBox className="border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
          <Shield className="h-4 w-4" strokeWidth={1.5} />
        </IconBox>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => {
          const invert = metric.id === "diversification";
          return (
            <div
              key={metric.id}
              className="rounded-xl border border-border bg-overlay/30 px-4 py-3 transition hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-secondary">{metric.label}</p>
                <span className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${levelColor(metric.level, invert)}`}>
                  {metric.level}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {metric.score}
                <span className="ml-1 text-sm font-normal text-faint">/100</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.explanation}</p>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
