import type { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ title, subtitle, titleIcon, children, className = "" }: DashboardCardProps) {
  return (
    <section
      className={`group rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.35)] backdrop-blur mf-light:border-slate-200/90 mf-light:bg-white mf-light:shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${className}`}
    >
      {(title || subtitle || titleIcon) && (
        <header className="mb-4 flex items-start gap-3">
          {titleIcon && <div className="shrink-0 pt-0.5">{titleIcon}</div>}
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold text-white mf-light:text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400 mf-light:text-slate-600">{subtitle}</p>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
