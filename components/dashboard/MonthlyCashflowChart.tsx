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
import { useChartTheme } from "@/components/theme/useChartTheme";
import { useCurrency } from "@/components/preferences/CurrencyProvider";
import type { CashflowMonthPoint } from "@/lib/journal-overview";

type MonthlyCashflowChartProps = {
  data: CashflowMonthPoint[];
};

export function MonthlyCashflowChart({ data }: MonthlyCashflowChartProps) {
  const { formatAmount } = useCurrency();
  const { chart: colors } = useChartTheme();
  const formatAxisValue = (value: number) => formatAmount(value, { maximumFractionDigits: 0 });

  return (
    <div className="w-full" style={{ height: 320, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: colors.axisLine }}
          />
          <YAxis
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: "10px",
              fontSize: "12px",
              color: colors.tooltipText,
            }}
            formatter={(value, name) => [
              formatAxisValue(Number(value ?? 0)),
              String(name) === "Revenue" ? "Revenue" : "Expenses",
            ]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as CashflowMonthPoint | undefined;
              return p ? `${p.monthLabel} · ${p.monthKey}` : "";
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", color: colors.axis }} />
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
