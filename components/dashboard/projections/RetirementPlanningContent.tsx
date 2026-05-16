"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Coins, Sunset } from "lucide-react";
import { StringNumericInput } from "@/components/dashboard/NumericInput";
import { useNumericFields } from "@/components/dashboard/useNumericFields";
import { CalculatorField, inputClassName } from "@/components/dashboard/projections/CalculatorField";
import { ProjectionResultMetric } from "@/components/dashboard/projections/ProjectionResultMetric";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { formatUsd } from "@/lib/compound-interest";
import {
  buildRetirementSummarySentence,
  computeRetirementPlanning,
  DEFAULT_RETIREMENT_INPUTS,
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

export function RetirementPlanningContent() {
  const { fields, setField, values: rawValues } = useNumericFields(DEFAULT_RETIREMENT_INPUTS);

  const inputs = useMemo(
    () => ({
      ...rawValues,
      currentAge: Math.max(18, Math.floor(rawValues.currentAge)),
    }),
    [rawValues],
  );

  const result = useMemo(() => computeRetirementPlanning(inputs), [inputs]);

  const summary = useMemo(
    () => buildRetirementSummarySentence(inputs, result),
    [inputs, result],
  );

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
              <StringNumericInput
                id="current-age"
                className={inputClassName}
                value={fields.currentAge}
                onValueChange={(value) => setField("currentAge", value)}
              />
            </CalculatorField>

            <CalculatorField id="annual-revenue" label="Current annual revenue" prefix="$">
              <StringNumericInput
                id="annual-revenue"
                className={inputClassName}
                value={fields.annualRevenue}
                onValueChange={(value) => setField("annualRevenue", value)}
              />
            </CalculatorField>

            <CalculatorField id="monthly-savings" label="Monthly savings" prefix="$">
              <StringNumericInput
                id="monthly-savings"
                className={inputClassName}
                value={fields.monthlySavings}
                onValueChange={(value) => setField("monthlySavings", value)}
              />
            </CalculatorField>

            <CalculatorField id="current-capital" label="Current capital" prefix="$">
              <StringNumericInput
                id="current-capital"
                className={inputClassName}
                value={fields.currentCapital}
                onValueChange={(value) => setField("currentCapital", value)}
              />
            </CalculatorField>

            <CalculatorField id="capital-rate" label="Interest on capital" suffix="% / yr">
              <StringNumericInput
                id="capital-rate"
                className={inputClassName}
                value={fields.interestOnCapitalPercent}
                onValueChange={(value) => setField("interestOnCapitalPercent", value)}
              />
            </CalculatorField>

            <CalculatorField
              id="revenue-at-retirement"
              label="Percentage of current revenue at retirement"
              suffix="% / yr"
            >
              <StringNumericInput
                id="revenue-at-retirement"
                className={inputClassName}
                value={fields.revenuePercentAtRetirement}
                onValueChange={(value) => setField("revenuePercentAtRetirement", value)}
              />
            </CalculatorField>

            <CalculatorField
              id="interest-at-retirement"
              label="Interests on capital at retirement"
              suffix="% / yr"
            >
              <StringNumericInput
                id="interest-at-retirement"
                className={inputClassName}
                value={fields.interestAtRetirementPercent}
                onValueChange={(value) => setField("interestAtRetirementPercent", value)}
              />
            </CalculatorField>

            <CalculatorField
              id="inflation"
              label="Inflation"
              suffix="% / yr"
              labelTooltip="Calculation of inflation calculated up to retirement age"
            >
              <StringNumericInput
                id="inflation"
                className={inputClassName}
                value={fields.inflationPercentPerYear}
                onValueChange={(value) => setField("inflationPercentPerYear", value)}
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
