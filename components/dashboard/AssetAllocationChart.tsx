"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type AssetSlice = {
  name: string;
  value: number;
  color: string;
};

export const SAMPLE_ASSET_ALLOCATION: AssetSlice[] = [
  { name: "ETFs", value: 34, color: "#22d3ee" },
  { name: "Cash", value: 18, color: "#a78bfa" },
  { name: "Real Estate", value: 28, color: "#34d399" },
  { name: "Crypto", value: 8, color: "#f472b6" },
  { name: "Pension", value: 12, color: "#fbbf24" },
];

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#e2e8f0",
};

type AssetAllocationChartProps = {
  data: AssetSlice[];
};

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
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
            stroke="rgba(15,23,42,0.9)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${Number(value ?? 0)}%`, "Share"]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
