"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Coins, Sunset } from "lucide-react";
import { CalculatorField, inputClassName } from "@/components/dashboard/projections/CalculatorField";
import { ProjectionResultMetric } from "@/components/dashboard/projections/ProjectionResultMetric";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { formatUsd } from "@/lib/compound-interest";
import {
  buildRetirementSummarySentence,
  computeRetirementPlanning,
  createDefaultRetirementInputs,
  type RetirementPlanningInputs,
} from "@/lib/retirement-planning";

const RetirementGrowthChart = dynamic(
  () =>
    import("@/components/dashboard/projections/RetirementGrowthChart").then(
      (m) => m.RetirementGrowthChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full animate-pulse items-center justify-center rounded-xl bg-white/[0.04] text-xs text-slate-500"
        style={{ height: 360 }}
      >
        Loading chart…
      </div>
    ),
  },
);

function parseNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function RetirementPlanningContent() {
  const [inputs, setInputs] = useState<RetirementPlanningInputs>(createDefaultRetirementInputs);

  const result = useMemo(() => computeRetirementPlanning(inputs), [inputs]);

  const summary = useMemo(
    () => buildRetirementSummarySentence(inputs, result),
    [inputs, result],
  );

  const update = <K extends keyof RetirementPlanningInputs>(
    key: K,
    value: RetirementPlanningInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11 border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
          <Sunset className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f4be7e]/90">
            Projections
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white mf-light:text-slate-900">
            Retirement Planning
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 mf-light:text-slate-600">
            Project capital growth from monthly savings, then estimate when your portfolio can fund
            your target share of current income at retirement yield.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
        <DashboardCard
          title="Planning inputs"
          subtitle="Adjust values — results update instantly"
          className="h-fit xl:sticky xl:top-8"
        >
          <form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Retirement planning calculator"
          >
            <CalculatorField id="current-age" label="Current age">
              <input
                id="current-age"
                type="number"
                min={18}
                max={90}
                step={1}
                className={inputClassName}
                value={inputs.currentAge}
                onChange={(e) =>
                  update("currentAge", Math.max(18, Math.floor(parseNumber(e.target.value, 18))))
                }
              />
            </CalculatorField>

            <CalculatorField id="annual-revenue" label="Current annual revenue" prefix="$">
              <input
                id="annual-revenue"
                type="number"
                min={0}
                step={1000}
                className={inputClassName}
                value={inputs.annualRevenue}
                onChange={(e) => update("annualRevenue", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField id="monthly-savings" label="Monthly savings" prefix="$">
              <input
                id="monthly-savings"
                type="number"
                min={0}
                step={50}
                className={inputClassName}
                value={inputs.monthlySavings}
                onChange={(e) => update("monthlySavings", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField id="current-capital" label="Current capital" prefix="$">
              <input
                id="current-capital"
                type="number"
                min={0}
                step={1000}
                className={inputClassName}
                value={inputs.currentCapital}
                onChange={(e) => update("currentCapital", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField id="capital-rate" label="Interest on capital" suffix="% / yr">
              <input
                id="capital-rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClassName}
                value={inputs.interestOnCapitalPercent}
                onChange={(e) => update("interestOnCapitalPercent", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField
              id="revenue-at-retirement"
              label="Percentage of current revenue at retirement"
              suffix="% / yr"
            >
              <input
                id="revenue-at-retirement"
                type="number"
                min={0}
                max={100}
                step={1}
                className={inputClassName}
                value={inputs.revenuePercentAtRetirement}
                onChange={(e) =>
                  update("revenuePercentAtRetirement", parseNumber(e.target.value, 0))
                }
              />
            </CalculatorField>

            <CalculatorField
              id="interest-at-retirement"
              label="Interests on capital at retirement"
              suffix="% / yr"
            >
              <input
                id="interest-at-retirement"
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClassName}
                value={inputs.interestAtRetirementPercent}
                onChange={(e) =>
                  update("interestAtRetirementPercent", parseNumber(e.target.value, 0))
                }
              />
            </CalculatorField>
          </form>
        </DashboardCard>

        <div className="space-y-6">
          {result.message && (
            <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90 mf-light:border-amber-300/40 mf-light:bg-amber-50 mf-light:text-amber-900">
              {result.message}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ProjectionResultMetric
              label="Estimated retirement age"
              value={result.retirementAge !== null ? String(result.retirementAge) : "—"}
              variant="gold"
            />
            <ProjectionResultMetric
              label="Years until retirement"
              value={
                result.yearsUntilRetirement !== null ? String(result.yearsUntilRetirement) : "—"
              }
            />
            <ProjectionResultMetric
              label="Financial independence target"
              value={formatUsd(result.financialIndependenceTarget)}
            />
            <ProjectionResultMetric
              label="Required income at retirement"
              value={formatUsd(result.requiredAnnualIncomeAtRetirement)}
              variant="blue"
            />
            <ProjectionResultMetric
              label="Monthly savings"
              value={formatUsd(result.monthlySavings)}
              variant="blue"
            />
            <ProjectionResultMetric
              label="Projected capital at retirement"
              value={formatUsd(result.projectedCapitalAtRetirement)}
            />
            <ProjectionResultMetric
              label="Total contributions"
              value={formatUsd(result.totalContributions)}
              variant="blue"
            />
            <ProjectionResultMetric
              label="Estimated investment gains"
              value={formatUsd(result.estimatedInvestmentGains)}
              variant="gold"
            />
          </div>

          <DashboardCard
            title="Capital growth projection"
            subtitle="Path to the capital needed for your retirement income goal"
            titleIcon={
              <IconBox className="border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
                <Sunset className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
          >
            <RetirementGrowthChart
              data={result.yearlySeries}
              targetRetirementCapital={result.financialIndependenceTarget}
              retirementAge={result.retirementAge}
            />
          </DashboardCard>
        </div>
      </div>

      <p className="rounded-2xl border border-[#f4be7e]/15 bg-[#f4be7e]/[0.06] px-5 py-4 text-sm leading-relaxed text-slate-300 mf-light:border-[#d4a46a]/25 mf-light:bg-[#f4be7e]/10 mf-light:text-slate-700">
        <Coins className="mr-2 inline-block h-4 w-4 text-[#f4be7e]" strokeWidth={1.5} aria-hidden />
        {summary}
      </p>
    </div>
  );
}
