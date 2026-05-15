import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100 mf-light:bg-slate-100 mf-light:text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-md items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition hover:text-cyan-200 mf-light:text-slate-900 mf-light:hover:text-cyan-700"
        >
          MyFinances
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-cyan-200 mf-light:text-slate-600 mf-light:hover:text-cyan-700"
        >
          Back to home
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16 sm:px-8">{children}</main>
    </div>
  );
}
