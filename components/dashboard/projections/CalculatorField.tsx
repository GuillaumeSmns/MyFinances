import type { ReactNode } from "react";
import { Info } from "lucide-react";

type CalculatorFieldProps = {
  id: string;
  label: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  children: ReactNode;
  hint?: string;
  labelTooltip?: string;
};

const inputClassName =
  "no-spinner w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-faint";

export function CalculatorField({
  id,
  label,
  suffix,
  prefix,
  children,
  hint,
  labelTooltip,
}: CalculatorFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-secondary">
          {label}
        </label>
        {labelTooltip && (
          <button
            type="button"
            className="group/info relative inline-flex shrink-0 rounded-sm p-0.5 text-faint transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-investment/40"
            aria-label={labelTooltip}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-52 -translate-x-1/2 rounded-lg border border-border bg-card-solid px-3 py-2 text-center text-[11px] leading-snug text-secondary opacity-0 shadow-lg transition-opacity duration-150 group-hover/info:opacity-100 group-focus-visible/info:opacity-100"
            >
              {labelTooltip}
            </span>
          </button>
        )}
      </div>
      <div className="relative flex items-stretch overflow-hidden rounded-xl border border-border bg-input transition focus-within:border-accent-investment/45 focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-accent-investment)_12%,transparent)]">
        {prefix && (
          <span className="flex shrink-0 items-center border-r border-border bg-overlay px-3 text-sm text-accent-investment">
            {prefix}
          </span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
        {suffix && (
          <span className="flex shrink-0 items-center border-l border-border bg-overlay px-3 text-xs font-medium tracking-wide text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

export { inputClassName };
