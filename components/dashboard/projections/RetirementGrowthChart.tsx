"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartAxisValue, formatUsd } from "@/lib/compound-interest";
import { useCompoundChartTheme } from "@/components/theme/useChartTheme";
import type { RetirementYearPoint } from "@/lib/retirement-planning";

type RetirementGrowthChartProps = {
  data: RetirementYearPoint[];
  targetRetirementCapital: number;
  retirementAge: number | null;
};

export function RetirementGrowthChart({
  data,
  targetRetirementCapital,
  retirementAge,
}: RetirementGrowthChartProps) {
  const theme = useCompoundChartTheme();
  if (data.length === 0) return null;

  const minAge = data[0].age;
  const endAge = retirementAge ?? data[data.length - 1].age;
  const chartData =
    retirementAge !== null ? data.filter((point) => point.age <= retirementAge) : data;
  const xTicks = endAge > minAge ? [minAge, endAge] : [minAge];

  return (
    <div className="w-full" style={{ height: 360, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="retirement-contributions-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.contributionsFillTop} />
              <stop offset="100%" stopColor={theme.contributionsFillBottom} />
            </linearGradient>
            <linearGradient id="retirement-gains-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.interestFillTop} />
              <stop offset="100%" stopColor={theme.interestFillBottom} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="age"
            type="number"
            domain={[minAge, endAge]}
            ticks={xTicks}
            allowDataOverflow={false}
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.axisLine }}
            tickFormatter={(age) => {
              const a = Number(age);
              if (a === minAge) return "Today";
              if (a === endAge) return String(endAge);
              return "";
            }}
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
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                cumulativeContributions: "Total contributions",
                investmentGains: "Investment gains",
                totalCapital: "Total capital",
              };
              return [formatUsd(Number(value ?? 0)), labels[String(name)] ?? String(name)];
            }}
            labelFormatter={(age) => `Age ${age}`}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "14px", color: theme.axis }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                cumulativeContributions: "Total contributions",
                investmentGains: "Investment gains",
                totalCapital: "Total capital",
              };
              return labels[value] ?? value;
            }}
          />
          {targetRetirementCapital > 0 && (
            <ReferenceLine
              y={targetRetirementCapital}
              stroke="#f4be7e"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Retirement target",
                position: "insideTopRight",
                fill: "#f4be7e",
                fontSize: 11,
              }}
            />
          )}
          {retirementAge !== null && (
            <ReferenceLine
              x={retirementAge}
              stroke="rgba(244, 190, 126, 0.45)"
              strokeDasharray="4 4"
            />
          )}
          <Area
            type="monotone"
            dataKey="cumulativeContributions"
            name="cumulativeContributions"
            stackId="stack"
            stroke={theme.contributions}
            strokeWidth={1.5}
            fill="url(#retirement-contributions-fill)"
          />
          <Area
            type="monotone"
            dataKey="investmentGains"
            name="investmentGains"
            stackId="stack"
            stroke={theme.interest}
            strokeWidth={1.5}
            fill="url(#retirement-gains-fill)"
          />
          <Line
            type="monotone"
            dataKey="totalCapital"
            name="totalCapital"
            stroke="#f5f0e8"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#f4be7e" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
