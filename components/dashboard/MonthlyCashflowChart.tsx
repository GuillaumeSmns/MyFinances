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
import type { CashflowMonthPoint } from "@/lib/journal-overview";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#e2e8f0",
};

const axisTick = { fill: "#94a3b8", fontSize: 11 };
const gridStroke = "rgba(255,255,255,0.06)";

type MonthlyCashflowChartProps = {
  data: CashflowMonthPoint[];
};

function formatAed(value: number) {
  return `AED ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function MonthlyCashflowChart({ data }: MonthlyCashflowChartProps) {
  return (
    <div className="w-full" style={{ height: 320, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="monthLabel"
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              formatAed(Number(value ?? 0)),
              String(name) === "Revenue" ? "Revenue" : "Expenses",
            ]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as CashflowMonthPoint | undefined;
              return p ? `${p.monthLabel} · ${p.monthKey}` : "";
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", color: "#94a3b8" }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#fb7185"
            strokeWidth={2}
            dot={{ r: 3, fill: "#fb7185", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
