"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/components/theme/useChartTheme";
import { CURRENCY_CHART_COLORS, type CurrencyBucket } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";
import { formatAssetCurrencyAmount } from "@/lib/currency-conversion";

type CurrencyExposureChartProps = {
  buckets: CurrencyBucket[];
  displayCurrency: PreferredCurrency;
};

type TooltipPayload = {
  currency: PreferredCurrency;
  total: number;
  percent: number;
};

function ExposureTooltip({
  active,
  payload,
  displayCurrency,
  chart,
}: {
  active?: boolean;
  payload?: Array<{ payload: TooltipPayload }>;
  displayCurrency: PreferredCurrency;
  chart: ReturnType<typeof useChartTheme>["chart"];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-xs shadow-lg"
      style={{
        backgroundColor: chart.tooltipBg,
        borderColor: chart.tooltipBorder,
        color: chart.tooltipText,
      }}
    >
      <p className="font-semibold">{row.currency}</p>
      <p className="mt-1.5 tabular-nums">{row.percent.toFixed(1)}% exposure</p>
      <p className="mt-1 tabular-nums text-faint">
        {formatAssetCurrencyAmount(row.total, displayCurrency, { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export function CurrencyExposureChart({ buckets, displayCurrency }: CurrencyExposureChartProps) {
  const { chart } = useChartTheme();

  if (buckets.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No currency exposure yet.
      </p>
    );
  }

  const data = buckets.map((b) => ({
    currency: b.currency,
    total: b.total,
    percent: b.percent,
  }));

  return (
    <div className="w-full" style={{ height: 300, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chart.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="currency"
            tick={{ fill: chart.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: chart.axisLine }}
          />
          <YAxis
            tick={{ fill: chart.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip
            content={
              <ExposureTooltip displayCurrency={displayCurrency} chart={chart} />
            }
            cursor={false}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={72}>
            {data.map((entry) => (
              <Cell key={entry.currency} fill={CURRENCY_CHART_COLORS[entry.currency]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
