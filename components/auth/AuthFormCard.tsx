import type { ReactNode } from "react";

type AuthFormCardProps = {
  children: ReactNode;
};

export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <div className="mf-card-shadow rounded-2xl border border-white/10 bg-slate-900/70 p-8 backdrop-blur-xl sm:p-10 mf-light:border-slate-200 mf-light:bg-white mf-light:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      {children}
    </div>
  );
}
