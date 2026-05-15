import type { ReactNode } from "react";

type CalculatorFieldProps = {
  id: string;
  label: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  children: ReactNode;
  hint?: string;
};

const inputClassName =
  "no-spinner w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 mf-light:text-slate-900 mf-light:placeholder:text-slate-400";

export function CalculatorField({
  id,
  label,
  suffix,
  prefix,
  children,
  hint,
}: CalculatorFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mf-light:text-slate-700">
        {label}
      </label>
      <div className="group relative flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-slate-950/50 transition focus-within:border-[#f4be7e]/45 focus-within:shadow-[0_0_0_3px_rgba(244,190,126,0.12)] mf-light:border-slate-200 mf-light:bg-slate-50 mf-light:focus-within:border-[#d4a46a]/50">
        {prefix && (
          <span className="flex shrink-0 items-center border-r border-white/10 bg-white/[0.03] px-3 text-sm text-[#f4be7e] mf-light:border-slate-200 mf-light:bg-slate-100/80">
            {prefix}
          </span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
        {suffix && (
          <span className="flex shrink-0 items-center border-l border-white/10 bg-white/[0.03] px-3 text-xs font-medium tracking-wide text-slate-400 mf-light:border-slate-200 mf-light:bg-slate-100/80 mf-light:text-slate-600">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mf-light:text-slate-500">{hint}</p>}
    </div>
  );
}

export { inputClassName };
