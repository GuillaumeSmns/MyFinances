"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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

function readPalette(): MfPaletteId {
  if (typeof document === "undefined") return "legacy";
  return document.documentElement.getAttribute("data-mf-palette") === "luxury" ? "luxury" : "legacy";
}

/** Sample slices — colors follow active palette */
export const SAMPLE_ASSET_ALLOCATION: AssetSlice[] = buildSampleAllocation("legacy");

function chartTooltipStyle(palette: MfPaletteId) {
  const t = palette === "legacy" ? MF_THEME_LEGACY : MF_THEME;
  return {
    backgroundColor: t.chart.tooltipBg,
    border: `1px solid ${t.chart.tooltipBorder}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: t.chart.tooltipText,
  };
}

type AssetAllocationChartProps = {
  data: AssetSlice[];
};

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  const palette = readPalette();
  const tooltipStyle = chartTooltipStyle(palette);
  const pieStroke = palette === "legacy" ? MF_THEME_LEGACY.chart.pieStroke : MF_THEME.chart.pieStroke;
  const legendColor = palette === "legacy" ? MF_THEME_LEGACY.chart.axis : MF_THEME.chart.axis;

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
            stroke={pieStroke}
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value ?? 0)}%`, "Share"]} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "11px", color: legendColor, paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
