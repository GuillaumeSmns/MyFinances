type ProjectionResultMetricProps = {
  label: string;
  value: string;
  variant?: "default" | "blue" | "gold";
};

export function ProjectionResultMetric({
  label,
  value,
  variant = "default",
}: ProjectionResultMetricProps) {
  const valueClass =
    variant === "blue"
      ? "text-[#38bdf8] mf-light:text-sky-600"
      : variant === "gold"
        ? "text-[#f4be7e]"
        : "text-white mf-light:text-slate-900";

  const hoverClass =
    variant === "blue"
      ? "hover:border-sky-400/30"
      : variant === "gold"
        ? "hover:border-[#f4be7e]/25"
        : "hover:border-white/20";

  return (
    <div
      className={`rounded-xl border border-white/10 bg-slate-950/40 p-4 transition mf-light:border-slate-200 mf-light:bg-slate-50/80 ${hoverClass}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mf-light:text-slate-600">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClass}`}>{value}</p>
    </div>
  );
}
