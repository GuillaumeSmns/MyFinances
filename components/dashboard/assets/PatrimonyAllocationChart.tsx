"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme } from "@/components/theme/useChartTheme";
import type { CategoryAllocationSlice } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";
import { formatAssetCurrencyAmount } from "@/lib/currency-conversion";

/** Vivid, distinguishable slice colors for the Assets allocation chart */
const CATEGORY_SLICE_COLORS = [
  "#39bdf8",
  "#f4be7e",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#fbbf24",
  "#22d3ee",
  "#f472b6",
  "#4ade80",
  "#818cf8",
  "#fb923c",
  "#2dd4bf",
  "#e879f9",
  "#38bdf8",
] as const;

type PatrimonyAllocationChartProps = {
  slices: CategoryAllocationSlice[];
  displayCurrency: PreferredCurrency;
};

export function PatrimonyAllocationChart({ slices, displayCurrency }: PatrimonyAllocationChartProps) {
  const { chart } = useChartTheme();
  const data = slices.map((slice, index) => ({
    name: slice.name,
    value: slice.value,
    color: CATEGORY_SLICE_COLORS[index % CATEGORY_SLICE_COLORS.length]!,
  }));

  if (data.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Add assets to see allocation.
      </p>
    );
  }

  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: chart.tooltipText,
  };

  return (
    <div className="mx-auto w-full" style={{ height: 300, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="56%"
            outerRadius="80%"
            paddingAngle={2}
            stroke={chart.pieStroke}
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, _name, props) => {
              const slice = slices.find((s) => s.name === props.payload?.name);
              const pct = slice?.percent ?? 0;
              return [
                `${formatAssetCurrencyAmount(Number(value ?? 0), displayCurrency, { maximumFractionDigits: 0 })} (${pct.toFixed(1)}%)`,
                slice?.name ?? "Category",
              ];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: chart.axis }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
