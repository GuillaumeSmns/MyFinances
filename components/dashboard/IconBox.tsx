import type { ReactNode } from "react";

type IconBoxProps = {
  children: ReactNode;
  className?: string;
};

/** Subtle container for Lucide icons in cards and headers */
export function IconBox({ children, className = "" }: IconBoxProps) {
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-300 transition group-hover:border-cyan-300/25 group-hover:bg-cyan-500/10 group-hover:text-cyan-200 mf-light:border-slate-200 mf-light:bg-slate-100 mf-light:text-slate-600 mf-light:group-hover:border-cyan-400/40 mf-light:group-hover:bg-cyan-50 mf-light:group-hover:text-cyan-800 ${className}`}
    >
      {children}
    </span>
  );
}
