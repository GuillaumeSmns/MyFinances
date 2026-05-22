"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clearProfilePreferencesCache } from "@/lib/profile-preferences";
import { createClient } from "@/utils/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard/overview");
      }
    });
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      clearProfilePreferencesCache();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/dashboard/overview");
      router.refresh();
    },
    [router],
  );

  return (
    <AuthPageShell>
      <AuthFormCard>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to open your MyFinances workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-faint">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wide text-faint">
                Password
              </label>
              <span
                className="cursor-default text-xs text-faint underline decoration-slate-600 decoration-dotted underline-offset-2"
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
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-faint focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mf-btn-primary w-full rounded-xl py-3 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-400 mf-light:hover:text-cyan-600">
            Create one
          </Link>
        </p>
      </AuthFormCard>
    </AuthPageShell>
  );
}
