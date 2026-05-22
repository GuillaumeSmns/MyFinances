"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme } from "@/components/theme/useChartTheme";
import { MF_THEME, MF_THEME_LEGACY, type MfPaletteId } from "@/lib/theme-colors";

export type AssetSlice = {
  name: string;
  value: number;
  color: string;
};

const ALLOCATION_NAMES = ["ETFs", "Cash", "Real Estate", "Crypto", "Pension"] as const;

function buildSampleAllocation(palette: MfPaletteId): AssetSlice[] {
  const colors = palette === "legacy" ? MF_THEME_LEGACY.allocation : MF_THEME.allocation;
  return ALLOCATION_NAMES.map((name, i) => ({
    name,
    value: [34, 18, 28, 8, 12][i]!,
    color: colors[i] ?? colors[0]!,
  }));
}

/** Sample slices — colors follow active palette */
export const SAMPLE_ASSET_ALLOCATION: AssetSlice[] = buildSampleAllocation("legacy");

type AssetAllocationChartProps = {
  data: AssetSlice[];
  /** Sample data uses percentages; Assets page uses nominal values. */
  valueMode?: "percent" | "nominal";
};

export function AssetAllocationChart({ data, valueMode = "percent" }: AssetAllocationChartProps) {
  const { chart, allocation } = useChartTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: chart.tooltipText,
  };

  return (
    <div className="mx-auto w-full max-w-md" style={{ height: 320, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke={chart.pieStroke}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color ?? allocation[index % allocation.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              if (valueMode === "percent") return [`${v}%`, "Allocation"];
              const pct = total > 0 ? (v / total) * 100 : 0;
              return [`${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${pct.toFixed(1)}%)`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", color: chart.axis }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
