"use client";

import type { LiquidityBreakdown as LiquidityData } from "@/lib/assets-model";
import type { PreferredCurrency } from "@/lib/currency";
import { formatAssetCurrencyAmount } from "@/lib/currency-conversion";

const SEGMENTS = [
  { key: "liquid" as const, label: "Liquid", color: "#39bdf8", field: "liquid" as const, pct: "liquidPercent" as const },
  { key: "semi" as const, label: "Semi-liquid", color: "#f4be7e", field: "semiLiquid" as const, pct: "semiLiquidPercent" as const },
  { key: "illiquid" as const, label: "Illiquid", color: "#fb923c", field: "illiquid" as const, pct: "illiquidPercent" as const },
];

type LiquidityBreakdownProps = {
  data: LiquidityData;
  displayCurrency: PreferredCurrency;
};

export function LiquidityBreakdown({ data, displayCurrency }: LiquidityBreakdownProps) {
  const total = data.liquid + data.semiLiquid + data.illiquid;

  if (total <= 0) {
    return (
      <p className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
        No liquidity data yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-overlay">
        {SEGMENTS.map((seg) => {
          const width = data[seg.pct];
          if (width <= 0) return null;
          return (
            <div
              key={seg.key}
              className="h-full transition-all"
              style={{ width: `${width}%`, backgroundColor: seg.color }}
              title={`${seg.label} ${width.toFixed(0)}%`}
            />
          );
        })}
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {SEGMENTS.map((seg) => (
          <li
            key={seg.key}
            className="rounded-xl border border-border bg-overlay/40 px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {seg.label}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {data[seg.pct].toFixed(0)}%
            </p>
            <p className="mt-0.5 text-xs text-faint">
              {formatAssetCurrencyAmount(data[seg.field], displayCurrency, { maximumFractionDigits: 0 })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
