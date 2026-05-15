import {
  computeJournalOverviewMetrics,
  getLatestSavedJournalFromStorage,
} from "@/lib/journal-overview";
import { formatMonthLabel } from "@/lib/journal-storage";
import { formatUsd } from "@/lib/compound-interest";

export type RetirementPlanningInputs = {
  currentAge: number;
  annualRevenue: number;
  monthlySavings: number;
  currentCapital: number;
  /** Expected annual return while accumulating (pre-retirement). */
  interestOnCapitalPercent: number;
  /** Share of current revenue you want covered at retirement (e.g. 80). */
  revenuePercentAtRetirement: number;
  /** Expected annual yield on capital during retirement (e.g. 4). */
  interestAtRetirementPercent: number;
};

export type RetirementYearPoint = {
  age: number;
  yearsFromNow: number;
  totalCapital: number;
  cumulativeContributions: number;
  investmentGains: number;
};

export type RetirementPlanningResult = {
  retirementAge: number | null;
  yearsUntilRetirement: number | null;
  financialIndependenceTarget: number;
  requiredAnnualIncomeAtRetirement: number;
  projectedCapitalAtRetirement: number;
  monthlySavings: number;
  annualSavings: number;
  totalContributions: number;
  estimatedInvestmentGains: number;
  reachable: boolean;
  yearlySeries: RetirementYearPoint[];
  message: string | null;
};

export const DEFAULT_RETIREMENT_INPUTS: RetirementPlanningInputs = {
  currentAge: 35,
  annualRevenue: 100_000,
  monthlySavings: 2_000,
  currentCapital: 500_000,
  interestOnCapitalPercent: 7,
  revenuePercentAtRetirement: 80,
  interestAtRetirementPercent: 4,
};

/** Fresh copy of standard defaults (use on each page visit). */
export function createDefaultRetirementInputs(): RetirementPlanningInputs {
  return { ...DEFAULT_RETIREMENT_INPUTS };
}

const MAX_HORIZON_YEARS = 60;
const MAX_AGE = 100;

export type BudgetAnnualRevenue = {
  annualRevenue: number;
  monthKey: string;
  monthLabel: string;
};

export type BudgetMonthlySavings = {
  monthlySavings: number;
  savingsRatePercent: number;
  monthKey: string;
  monthLabel: string;
};

export function getLatestBudgetAnnualRevenue(): BudgetAnnualRevenue | null {
  if (typeof window === "undefined") return null;
  const latest = getLatestSavedJournalFromStorage();
  if (!latest) return null;
  const metrics = computeJournalOverviewMetrics(latest.snapshot);
  return {
    annualRevenue: metrics.monthlyRevenue * 12,
    monthKey: latest.monthKey,
    monthLabel: formatMonthLabel(latest.monthKey),
  };
}

/** Latest Budget month surplus = monthly amount available to save. */
export function getLatestBudgetMonthlySavings(): BudgetMonthlySavings | null {
  if (typeof window === "undefined") return null;
  const latest = getLatestSavedJournalFromStorage();
  if (!latest) return null;
  const metrics = computeJournalOverviewMetrics(latest.snapshot);
  return {
    monthlySavings: Math.max(0, metrics.surplus),
    savingsRatePercent: metrics.savingsRate,
    monthKey: latest.monthKey,
    monthLabel: formatMonthLabel(latest.monthKey),
  };
}

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Capital required so that interest at retirement covers the desired share of current revenue.
 * target = (annualRevenue × income%) / retirementYield%
 */
export function computeFinancialIndependenceTarget(
  annualRevenue: number,
  revenuePercentAtRetirement: number,
  interestAtRetirementPercent: number,
): { target: number; requiredAnnualIncome: number; valid: boolean } {
  const requiredAnnualIncome =
    clampNonNegative(annualRevenue) * (clampNonNegative(revenuePercentAtRetirement) / 100);
  const retirementYield = clampNonNegative(interestAtRetirementPercent) / 100;

  if (retirementYield <= 0) {
    return { target: 0, requiredAnnualIncome, valid: false };
  }

  return {
    target: requiredAnnualIncome / retirementYield,
    requiredAnnualIncome,
    valid: true,
  };
}

/**
 * Year-by-year accumulation until capital reaches the FI target.
 */
export function computeRetirementPlanning(
  raw: RetirementPlanningInputs,
): RetirementPlanningResult {
  const currentAge = Math.max(18, Math.floor(raw.currentAge));
  const annualRevenue = clampNonNegative(raw.annualRevenue);
  const monthlySavings = clampNonNegative(raw.monthlySavings);
  const currentCapital = clampNonNegative(raw.currentCapital);
  const accumulationRate = clampNonNegative(raw.interestOnCapitalPercent) / 100;
  const annualSavings = monthlySavings * 12;

  const { target, requiredAnnualIncome, valid } = computeFinancialIndependenceTarget(
    annualRevenue,
    raw.revenuePercentAtRetirement,
    raw.interestAtRetirementPercent,
  );

  const maxYears = Math.min(MAX_HORIZON_YEARS, Math.max(0, MAX_AGE - currentAge));

  if (!valid || target <= 0) {
    return {
      retirementAge: null,
      yearsUntilRetirement: null,
      financialIndependenceTarget: 0,
      requiredAnnualIncomeAtRetirement: requiredAnnualIncome,
      projectedCapitalAtRetirement: currentCapital,
      monthlySavings,
      annualSavings,
      totalContributions: currentCapital,
      estimatedInvestmentGains: 0,
      reachable: false,
      yearlySeries: [
        {
          age: currentAge,
          yearsFromNow: 0,
          totalCapital: currentCapital,
          cumulativeContributions: currentCapital,
          investmentGains: 0,
        },
      ],
      message:
        "Set a retirement yield above 0% and an income replacement percentage to calculate your financial independence target.",
    };
  }

  let balance = currentCapital;
  let cumulativeContributions = currentCapital;
  let retirementAge: number | null = null;

  const yearlySeries: RetirementYearPoint[] = [
    {
      age: currentAge,
      yearsFromNow: 0,
      totalCapital: balance,
      cumulativeContributions,
      investmentGains: 0,
    },
  ];

  if (currentCapital >= target) {
    retirementAge = currentAge;
  }

  for (let y = 1; y <= maxYears; y++) {
    balance = balance * (1 + accumulationRate) + annualSavings;
    cumulativeContributions += annualSavings;
    const age = currentAge + y;

    yearlySeries.push({
      age,
      yearsFromNow: y,
      totalCapital: balance,
      cumulativeContributions,
      investmentGains: Math.max(0, balance - cumulativeContributions),
    });

    if (retirementAge === null && balance >= target) {
      retirementAge = age;
    }
  }

  const last = yearlySeries[yearlySeries.length - 1];
  const reachable = retirementAge !== null;
  const yearsUntilRetirement =
    retirementAge !== null ? retirementAge - currentAge : null;

  const pointAtRetirement =
    retirementAge !== null
      ? yearlySeries.find((p) => p.age === retirementAge) ?? last
      : last;

  let message: string | null = null;
  if (!reachable) {
    if (annualSavings <= 0 && accumulationRate <= 0) {
      message =
        "Increase monthly savings or expected return on capital to grow toward your independence target.";
    } else {
      message = `Your target of ${formatUsd(target)} (enough to fund ${raw.revenuePercentAtRetirement}% of current revenue at ${raw.interestAtRetirementPercent}% yield) is not reached within ${maxYears} years. Raise savings, returns, or adjust retirement assumptions.`;
    }
  }

  return {
    retirementAge,
    yearsUntilRetirement,
    financialIndependenceTarget: target,
    requiredAnnualIncomeAtRetirement: requiredAnnualIncome,
    projectedCapitalAtRetirement: reachable
      ? pointAtRetirement?.totalCapital ?? target
      : last?.totalCapital ?? currentCapital,
    monthlySavings,
    annualSavings,
    totalContributions: pointAtRetirement?.cumulativeContributions ?? cumulativeContributions,
    estimatedInvestmentGains: pointAtRetirement?.investmentGains ?? 0,
    reachable,
    yearlySeries,
    message,
  };
}

export function buildRetirementSummarySentence(
  inputs: RetirementPlanningInputs,
  result: RetirementPlanningResult,
): string {
  if (!result.reachable || result.retirementAge === null) {
    return "Adjust your savings, returns, or retirement income assumptions to model when you could reach financial independence.";
  }

  return `Based on your current age, revenue, monthly savings, capital growth, and needing ${inputs.revenuePercentAtRetirement}% of current revenue funded at ${inputs.interestAtRetirementPercent}% retirement yield, you could reach your target at age ${result.retirementAge}.`;
}
