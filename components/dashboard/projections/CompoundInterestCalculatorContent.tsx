"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Coins, Percent, TrendingUp } from "lucide-react";
import { CalculatorField, inputClassName } from "@/components/dashboard/projections/CalculatorField";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import {
  buildCompoundSummarySentence,
  computeCompoundInterest,
  DEFAULT_COMPOUND_INPUTS,
  formatUsd,
  type CompoundInterestInputs,
} from "@/lib/compound-interest";
const CompoundGrowthChart = dynamic(
  () =>
    import("@/components/dashboard/projections/CompoundGrowthChart").then(
      (m) => m.CompoundGrowthChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full animate-pulse items-center justify-center rounded-xl bg-white/[0.04] text-xs text-slate-500"
        style={{ height: 340 }}
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

type ResultMetricProps = {
  label: string;
  value: string;
  variant?: "default" | "blue" | "gold";
};

function ResultMetric({ label, value, variant = "default" }: ResultMetricProps) {
  const valueClass =
    variant === "blue"
      ? "text-[#38bdf8] mf-light:text-sky-600"
      : variant === "gold"
        ? "text-[#f4be7e]"
        : "text-white mf-light:text-slate-900";

  const hoverClass =
    variant === "blue"
      ? "hover:border-sky-400/30"
      : variant === "gold"
        ? "hover:border-[#f4be7e]/25"
        : "hover:border-white/20";

  return (
    <div
      className={`rounded-xl border border-white/10 bg-slate-950/40 p-4 transition mf-light:border-slate-200 mf-light:bg-slate-50/80 ${hoverClass}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mf-light:text-slate-600">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClass}`}>{value}</p>
    </div>
  );
}

export function CompoundInterestCalculatorContent() {
  const [inputs, setInputs] = useState<CompoundInterestInputs>(DEFAULT_COMPOUND_INPUTS);

  const result = useMemo(() => computeCompoundInterest(inputs), [inputs]);

  const summary = useMemo(
    () => buildCompoundSummarySentence(inputs, result),
    [inputs, result],
  );

  const update = <K extends keyof CompoundInterestInputs>(key: K, value: CompoundInterestInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11 border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
          <Percent className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f4be7e]/90">
            Projections
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white mf-light:text-slate-900">
            Compound Interest Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 mf-light:text-slate-600">
            Model long-term wealth growth with recurring contributions and compounding returns.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
        <DashboardCard
          title="Calculator inputs"
          subtitle="Adjust values — results update instantly"
          className="h-fit xl:sticky xl:top-8"
        >
          <form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Compound interest calculator"
          >
            <CalculatorField id="initial-capital" label="Initial capital" prefix="$">
              <input
                id="initial-capital"
                type="number"
                min={0}
                step={100}
                className={inputClassName}
                value={inputs.initialCapital}
                onChange={(e) => update("initialCapital", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField id="monthly-contribution" label="Monthly contribution" prefix="$">
              <input
                id="monthly-contribution"
                type="number"
                min={0}
                step={50}
                className={inputClassName}
                value={inputs.monthlyContribution}
                onChange={(e) => update("monthlyContribution", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>

            <CalculatorField id="years" label="Years of growth">
              <input
                id="years"
                type="number"
                min={0}
                max={80}
                step={1}
                className={inputClassName}
                value={inputs.years}
                onChange={(e) => update("years", Math.max(0, Math.floor(parseNumber(e.target.value, 0))))}
              />
            </CalculatorField>

            <CalculatorField id="rate" label="Yearly interest rate">
              <input
                id="rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClassName}
                value={inputs.annualRatePercent}
                onChange={(e) => update("annualRatePercent", parseNumber(e.target.value, 0))}
              />
            </CalculatorField>
          </form>
        </DashboardCard>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultMetric label="Future investment value" value={formatUsd(result.futureValue)} />
            <ResultMetric
              label="Total contributions"
              value={formatUsd(result.totalContributions)}
              variant="blue"
            />
            <ResultMetric
              label="Total interest earned"
              value={formatUsd(result.totalInterest)}
              variant="gold"
            />
          </div>

          <DashboardCard
            title="Growth projection"
            subtitle="Contributions vs compound interest over time"
            titleIcon={
              <IconBox className="border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
                <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
          >
            <CompoundGrowthChart data={result.yearlySeries} totalYears={inputs.years} />
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
