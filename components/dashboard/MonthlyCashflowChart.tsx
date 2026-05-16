"use client";

import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/components/preferences/CurrencyProvider";
import { MF_THEME, MF_THEME_LEGACY, type MfPaletteId } from "@/lib/theme-colors";
import type { CashflowMonthPoint } from "@/lib/journal-overview";

function chartColors(palette: MfPaletteId) {
  const t = palette === "legacy" ? MF_THEME_LEGACY : MF_THEME;
  return {
    tooltip: {
      backgroundColor: t.chart.tooltipBg,
      border: `1px solid ${t.chart.tooltipBorder}`,
      borderRadius: "10px",
      fontSize: "12px",
      color: t.chart.tooltipText,
    },
    axisTick: { fill: t.chart.axis, fontSize: 11 },
    gridStroke: t.chart.grid,
    revenue: t.chart.revenue,
    expense: t.chart.expense,
  };
}

function readPalette(): MfPaletteId {
  if (typeof document === "undefined") return "legacy";
  return document.documentElement.getAttribute("data-mf-palette") === "luxury" ? "luxury" : "legacy";
}

type MonthlyCashflowChartProps = {
  data: CashflowMonthPoint[];
};

export function MonthlyCashflowChart({ data }: MonthlyCashflowChartProps) {
  const { formatAmount } = useCurrency();
  const colors = chartColors(readPalette());
  const formatAxisValue = (value: number) => formatAmount(value, { maximumFractionDigits: 0 });

  return (
    <div className="w-full" style={{ height: 320, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.gridStroke} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="monthLabel"
            tick={colors.axisTick}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          />
          <YAxis
            tick={colors.axisTick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip
            contentStyle={colors.tooltip}
            formatter={(value, name) => [
              formatAxisValue(Number(value ?? 0)),
              String(name) === "Revenue" ? "Revenue" : "Expenses",
            ]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as CashflowMonthPoint | undefined;
              return p ? `${p.monthLabel} · ${p.monthKey}` : "";
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", color: colors.axisTick.fill }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={colors.revenue}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.revenue, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={colors.expense}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.expense, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
