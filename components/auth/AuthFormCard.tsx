import type { ReactNode } from "react";

type AuthFormCardProps = {
  children: ReactNode;
};

export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <div className="mf-card-shadow rounded-2xl border border-border bg-card p-8 backdrop-blur-xl sm:p-10 mf-card-shadow">
      {children}
    </div>
  );
}
