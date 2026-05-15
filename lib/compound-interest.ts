export type CompoundFrequencyId =
  | "annually"
  | "semi-annually"
  | "quarterly"
  | "monthly"
  | "daily";

export type CompoundFrequencyOption = {
  id: CompoundFrequencyId;
  label: string;
  periodsPerYear: number;
};

export const COMPOUND_FREQUENCY_OPTIONS: readonly CompoundFrequencyOption[] = [
  { id: "annually", label: "Annually", periodsPerYear: 1 },
  { id: "semi-annually", label: "Semi-annually", periodsPerYear: 2 },
  { id: "quarterly", label: "Quarterly", periodsPerYear: 4 },
  { id: "monthly", label: "Monthly", periodsPerYear: 12 },
  { id: "daily", label: "Daily", periodsPerYear: 365 },
] as const;

export type CompoundInterestInputs = {
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  annualRatePercent: number;
  compoundsPerYear: number;
};

export type CompoundInterestYearPoint = {
  year: number;
  balance: number;
  cumulativeContributions: number;
  interestEarned: number;
};

export type CompoundInterestResult = {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  yearlySeries: CompoundInterestYearPoint[];
};

export const DEFAULT_COMPOUND_INPUTS: CompoundInterestInputs = {
  initialCapital: 10_000,
  monthlyContribution: 500,
  years: 20,
  annualRatePercent: 7,
  compoundsPerYear: 12,
};

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Month-by-month simulation: contributions at month-end, compounding at the chosen frequency.
 * Interest per compound period = annualRate / compoundsPerYear.
 */
export function computeCompoundInterest(
  raw: CompoundInterestInputs,
): CompoundInterestResult {
  const initialCapital = clampNonNegative(raw.initialCapital);
  const monthlyContribution = clampNonNegative(raw.monthlyContribution);
  const years = Math.max(0, Math.floor(raw.years));
  const annualRatePercent = clampNonNegative(raw.annualRatePercent);
  const compoundsPerYear = Math.max(1, Math.floor(raw.compoundsPerYear));

  const totalMonths = years * 12;
  const monthsPerCompound = 12 / compoundsPerYear;
  const periodRate = annualRatePercent / 100 / compoundsPerYear;

  let balance = initialCapital;
  let cumulativeContributions = initialCapital;

  const yearlySeries: CompoundInterestYearPoint[] = [
    {
      year: 0,
      balance: initialCapital,
      cumulativeContributions: initialCapital,
      interestEarned: 0,
    },
  ];

  let monthsSinceCompound = 0;

  for (let month = 1; month <= totalMonths; month++) {
    balance += monthlyContribution;
    cumulativeContributions += monthlyContribution;
    monthsSinceCompound += 1;

    if (monthsSinceCompound >= monthsPerCompound - 1e-9) {
      balance *= 1 + periodRate;
      monthsSinceCompound = 0;
    }

    if (month % 12 === 0) {
      yearlySeries.push({
        year: month / 12,
        balance,
        cumulativeContributions,
        interestEarned: Math.max(0, balance - cumulativeContributions),
      });
    }
  }

  if (totalMonths > 0 && totalMonths % 12 !== 0) {
    yearlySeries.push({
      year: totalMonths / 12,
      balance,
      cumulativeContributions,
      interestEarned: Math.max(0, balance - cumulativeContributions),
    });
  }

  const futureValue = balance;
  const totalContributions = cumulativeContributions;
  const totalInterest = Math.max(0, futureValue - totalContributions);

  return {
    futureValue,
    totalContributions,
    totalInterest,
    yearlySeries,
  };
}

export function getProjectionStartYear(referenceDate: Date = new Date()) {
  return referenceDate.getFullYear();
}

/** Calendar year at a given offset from today (year 0 → start year). */
export function yearOffsetToProjectedYear(
  yearOffset: number,
  startYear: number = getProjectionStartYear(),
) {
  return startYear + Math.round(yearOffset);
}

/** Compact Y-axis labels: hide zero; use M above 999k, otherwise k. */
export function formatChartAxisValue(value: number): string {
  const v = Number(value);
  if (!Number.isFinite(v) || Math.abs(v) < 1) return "";

  if (v > 999_000) {
    const millions = v / 1_000_000;
    const rounded = Math.round(millions * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}M` : `${rounded.toFixed(1)}M`;
  }

  const thousands = v / 1000;
  if (thousands < 1) return "";

  const roundedK = Math.round(thousands * 10) / 10;
  return Number.isInteger(roundedK) ? `${roundedK}k` : `${roundedK.toFixed(1)}k`;
}

export function formatUsd(value: number, maximumFractionDigits = 0) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}`;
}

export function buildCompoundSummarySentence(
  inputs: CompoundInterestInputs,
  result: CompoundInterestResult,
): string {
  const frequency =
    COMPOUND_FREQUENCY_OPTIONS.find((o) => o.periodsPerYear === inputs.compoundsPerYear)?.label ??
    "the selected frequency";

  return `With an initial capital of ${formatUsd(inputs.initialCapital)} and monthly contributions of ${formatUsd(inputs.monthlyContribution)} during ${inputs.years} years at an interest rate of ${inputs.annualRatePercent.toLocaleString()}% (compounded ${frequency.toLowerCase()}), your investment could grow to ${formatUsd(result.futureValue)}.`;
}
