"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { hasMockAuthCookie, setMockAuthCookie } from "@/lib/mock-auth-cookie";

export function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    if (hasMockAuthCookie()) {
      router.replace("/dashboard/overview");
    }
  }, [router]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setMockAuthCookie();
      router.push("/dashboard/overview");
      router.refresh();
    },
    [router],
  );

  return (
    <AuthPageShell>
      <AuthFormCard>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to open your MyFinances workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Password
              </label>
              <span
                className="cursor-default text-xs text-slate-500 underline decoration-slate-600 decoration-dotted underline-offset-2"
                title="Coming soon"
              >
                Forgot password?
              </span>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Log in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
            Create one
          </Link>
        </p>
      </AuthFormCard>
    </AuthPageShell>
  );
}
