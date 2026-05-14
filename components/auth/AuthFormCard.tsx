import type { ReactNode } from "react";

type AuthFormCardProps = {
  children: ReactNode;
};

export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
      {children}
    </div>
  );
}
