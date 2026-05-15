"use client";

import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createClient } from "@/utils/supabase/client";

type SignupConfirmationProps = {
  email: string;
  resendNotice: string | null;
  onResendPlaceholder: () => void;
};

function SignupConfirmation({ email, resendNotice, onResendPlaceholder }: SignupConfirmationProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_32px_rgba(52,211,153,0.12)]">
        <CheckCircle2 className="h-8 w-8 text-emerald-300" strokeWidth={1.5} aria-hidden />
      </div>
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
        <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
        Confirmation sent
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-white mf-light:text-slate-900">
        Check your email to confirm your account.
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400 mf-light:text-slate-600">
        We&apos;ve sent a confirmation link to{" "}
        <span className="font-medium text-slate-200 mf-light:text-slate-800">{email}</span>. Please confirm
        your email before logging in.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          href="/login"
          className="mf-btn-primary inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition hover:opacity-95"
        >
          Back to login
        </Link>
        <button
          type="button"
          onClick={onResendPlaceholder}
          className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100 mf-light:border-slate-200 mf-light:bg-slate-50 mf-light:text-slate-700 mf-light:hover:border-cyan-400/40 mf-light:hover:text-cyan-800"
        >
          Resend confirmation email
        </button>
        {resendNotice ? (
          <p className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-50" role="status">
            {resendNotice}
          </p>
        ) : (
          <p className="text-xs text-slate-500 mf-light:text-slate-500">
            Resend will be available in a future update.
          </p>
        )}
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{ email: string } | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

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
      setResendNotice(null);
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

      setPendingConfirmation({ email });
    },
    [router],
  );

  const handleResendPlaceholder = useCallback(() => {
    setResendNotice("Resend confirmation email is not available yet. Check your inbox and spam folder.");
  }, []);

  return (
    <AuthPageShell>
      <AuthFormCard>
        {pendingConfirmation ? (
          <SignupConfirmation
            email={pendingConfirmation.email}
            resendNotice={resendNotice}
            onResendPlaceholder={handleResendPlaceholder}
          />
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white mf-light:text-slate-900">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate-400 mf-light:text-slate-600">
                Start tracking your finances with MyFinances.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 mf-light:text-slate-500"
                >
                  Full name
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 mf-light:text-slate-500"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 mf-light:text-slate-500"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-confirm"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 mf-light:text-slate-500"
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
                  className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 mf-light:border-slate-200 mf-light:bg-white mf-light:text-slate-900 mf-light:placeholder:text-slate-400"
                />
              </div>

              {error && (
                <p
                  className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mf-btn-primary w-full rounded-xl py-3 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400 mf-light:text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-cyan-300 hover:text-cyan-200 mf-light:text-cyan-700 mf-light:hover:text-cyan-600"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </AuthFormCard>
    </AuthPageShell>
  );
}
