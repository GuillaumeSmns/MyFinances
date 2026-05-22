"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCompoundChartTheme } from "@/components/theme/useChartTheme";
import {
  getProjectionStartYear,
  yearOffsetToProjectedYear,
  type CompoundInterestYearPoint,
} from "@/lib/compound-interest";
import { formatChartAxisValue, formatUsd } from "@/lib/compound-interest";

type ChartRow = CompoundInterestYearPoint & {
  contributionsStack: number;
  interestStack: number;
  projectedYear: number;
};

type CompoundGrowthChartProps = {
  data: CompoundInterestYearPoint[];
  totalYears: number;
  startYear?: number;
};

function toChartRows(data: CompoundInterestYearPoint[], startYear: number): ChartRow[] {
  return data.map((point) => ({
    ...point,
    contributionsStack: point.cumulativeContributions,
    interestStack: point.interestEarned,
    projectedYear: yearOffsetToProjectedYear(point.year, startYear),
  }));
}

function formatXAxisTick(yearOffset: number, totalYears: number) {
  const offset = Math.round(Number(yearOffset));
  if (offset <= 0) return "Today";
  if (offset >= totalYears) return String(totalYears);
  return "";
}

export function CompoundGrowthChart({
  data,
  totalYears,
  startYear = getProjectionStartYear(),
}: CompoundGrowthChartProps) {
  const theme = useCompoundChartTheme();
  const rows = toChartRows(data, startYear);
  const endYearOffset = Math.max(0, totalYears);
  const xTicks = endYearOffset > 0 ? [0, endYearOffset] : [0];

  return (
    <div className="w-full" style={{ height: 340, minHeight: 280 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="compound-contributions-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.contributionsFillTop} />
              <stop offset="100%" stopColor={theme.contributionsFillBottom} />
            </linearGradient>
            <linearGradient id="compound-interest-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.interestFillTop} />
              <stop offset="100%" stopColor={theme.interestFillBottom} />
            </linearGradient>
            <filter id="compound-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            ticks={xTicks}
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.axisLine }}
            tickFormatter={(y) => formatXAxisTick(y, endYearOffset)}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatChartAxisValue}
            width={52}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: "12px",
              fontSize: "12px",
              color: theme.tooltipText,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            }}
            formatter={(value, name) => [
              formatUsd(Number(value ?? 0)),
              name === "contributionsStack" ? "Contributions" : "Interest earned",
            ]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as ChartRow | undefined;
              if (!row) return "";
              return String(row.projectedYear);
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "14px", color: theme.axis }}
            formatter={(value) =>
              value === "contributionsStack" ? "Total contributions" : "Interest earned"
            }
          />
          <Area
            type="monotone"
            dataKey="contributionsStack"
            name="contributionsStack"
            stackId="growth"
            stroke={theme.contributions}
            strokeWidth={2}
            fill="url(#compound-contributions-fill)"
            filter="url(#compound-glow)"
          />
          <Area
            type="monotone"
            dataKey="interestStack"
            name="interestStack"
            stackId="growth"
            stroke={theme.interest}
            strokeWidth={2}
            fill="url(#compound-interest-fill)"
            filter="url(#compound-glow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
