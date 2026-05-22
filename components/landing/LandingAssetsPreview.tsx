"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme } from "@/components/theme/useChartTheme";

const ASSET_SLICES = [
  { name: "Real Estate", value: 227_140, color: "#a78bfa", percent: 41 },
  { name: "ETFs & Stocks", value: 171_740, color: "#f4be7e", percent: 31 },
  { name: "Cash & Bank Accounts", value: 88_640, color: "#39bdf8", percent: 16 },
  { name: "Pension / Retirement", value: 44_320, color: "#34d399", percent: 8 },
  { name: "Crypto", value: 22_160, color: "#fb7185", percent: 4 },
] as const;

const TOTAL = ASSET_SLICES.reduce((sum, s) => sum + s.value, 0);

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function LandingAssetsPreview() {
  const { chart } = useChartTheme();
  const pieData = ASSET_SLICES.map((s) => ({
    name: s.name,
    value: s.value,
    color: s.color,
  }));

  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: chart.tooltipText,
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-5 pb-5 pt-1.5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-6 sm:pb-6 sm:pt-2 lg:px-8 lg:pb-8">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <p className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Assets</p>
        <p className="flex items-center gap-2 tabular-nums">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="text-xl font-semibold text-[#f4be7e]">{formatUsd(TOTAL)}</span>
        </p>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="w-full" style={{ height: 280, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="78%"
                paddingAngle={2}
                stroke={chart.pieStroke}
                strokeWidth={2}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, _name, props) => {
                  const slice = ASSET_SLICES.find((s) => s.name === props.payload?.name);
                  return [
                    `${formatUsd(Number(value ?? 0))} (${slice?.percent ?? 0}%)`,
                    slice?.name ?? "Category",
                  ];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: chart.axis }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-3">
          {ASSET_SLICES.map((slice) => (
            <li
              key={slice.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-slate-950/40 px-3.5 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="truncate text-xs text-secondary">{slice.name}</span>
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                {slice.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
