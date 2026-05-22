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
        : "text-foreground";

  const hoverClass =
    variant === "blue"
      ? "hover:border-sky-400/30"
      : variant === "gold"
        ? "hover:border-[#f4be7e]/25"
        : "hover:border-border-strong";

  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 transition ${hoverClass}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClass}`}>{value}</p>
    </div>
  );
}
