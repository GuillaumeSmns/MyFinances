"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createClient } from "@/utils/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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
      setInfo(null);
      const form = e.currentTarget;
      const fd = new FormData(form);
      const password = String(fd.get("password") ?? "");
      const confirm = String(fd.get("confirmPassword") ?? "");
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      const email = String(fd.get("email") ?? "").trim();
      const name = String(fd.get("name") ?? "").trim();

      setLoading(true);
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard/overview");
        router.refresh();
        return;
      }

      setInfo("Check your email to confirm your account before signing in.");
    },
    [router],
  );

  return (
    <AuthPageShell>
      <AuthFormCard>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Start tracking your finances with MyFinances.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Full name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label
              htmlFor="signup-confirm"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100" role="alert">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-50" role="status">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>
        </p>
      </AuthFormCard>
    </AuthPageShell>
  );
}
