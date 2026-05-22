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
      className={`group mf-card-shadow rounded-2xl border border-border bg-card p-5 backdrop-blur ${className}`}
    >
      {(title || subtitle || titleIcon) && (
        <header className="mb-4 flex items-start gap-3">
          {titleIcon && <div className="shrink-0 pt-0.5">{titleIcon}</div>}
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
