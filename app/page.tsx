import Link from "next/link";
import { LineChart, NotebookPen, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeroFinanceVisual } from "@/components/landing/HeroFinanceVisual";
import { LandingAssetsPreview } from "@/components/landing/LandingAssetsPreview";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: "Budget Tracking",
    description: "Revenues, investments, and expenses in one monthly view.",
    icon: NotebookPen,
  },
  {
    title: "Asset Management",
    description: "Patrimony, allocation, and currency exposure at a glance.",
    icon: Wallet,
  },
  {
    title: "Financial Projections",
    description: "Compound growth and retirement scenarios, clearly modeled.",
    icon: LineChart,
  },
];

const PREVIEW_METRICS = [
  { label: "Monthly Revenue", value: "$8,240", accent: "text-emerald-300/95" },
  { label: "Monthly Expenses", value: "$5,120", accent: "text-rose-300/90" },
  { label: "Cashflow", value: "+$2,760", accent: "text-foreground" },
  { label: "Total Assets", value: "$186,400", accent: "text-foreground" },
] as const;

const SUPPLEMENTAL_METRICS = [
  { label: "Savings Rate", value: "32%", accent: "text-foreground" },
  { label: "Diversification Score", value: "78", accent: "text-foreground" },
  { label: "Currency Exposure", value: "Moderate", accent: "text-foreground" },
  { label: "Investment Allocation", value: "Balanced", accent: "text-foreground" },
] as const;

const CASHFLOW_MONTHS = [
  { month: "Jan", height: 62 },
  { month: "Feb", height: 71 },
  { month: "Mar", height: 58 },
  { month: "Apr", height: 78 },
  { month: "May", height: 74 },
  { month: "Jun", height: 82 },
  { month: "Jul", height: 76 },
  { month: "Aug", height: 85 },
] as const;

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-white/[0.04] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 hover:border-white/[0.12] hover:bg-white/[0.055] ${className}`}
    >
      {children}
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <GlassCard className="p-6 sm:p-7">
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </GlassCard>
  );
}

function DashboardPreview() {
  const maxH = Math.max(...CASHFLOW_MONTHS.map((p) => p.height));

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Financial Snapshot
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">MyFinances Dashboard</p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {PREVIEW_METRICS.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.06] bg-slate-950/50 px-3.5 py-3 transition hover:border-[#39bdf8]/20"
          >
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className={`mt-1.5 text-lg font-semibold tabular-nums tracking-tight ${item.accent}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <div className="landing-spending-trend mt-4 rounded-xl border border-white/[0.06] bg-slate-950/40 p-3.5">
        <p className="mb-3 text-xs font-medium text-secondary">Monthly cashflow</p>
        <div className="flex h-24 items-end gap-1.5">
          {CASHFLOW_MONTHS.map((point) => (
            <div key={point.month} className="flex h-full flex-1 flex-col items-stretch">
              <div className="flex flex-1 items-end">
                <div
                  className="mf-chart-bar w-full min-h-[4px] rounded-t-sm"
                  style={{ height: `${Math.round((point.height / maxH) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-1 text-[10px] text-muted-foreground">
          {CASHFLOW_MONTHS.map((point) => (
            <span key={point.month} className="flex-1 text-center">
              {point.month}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {SUPPLEMENTAL_METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-white/[0.06] bg-slate-950/50 px-3 py-2.5"
          >
            <p className="text-[10px] leading-snug text-muted-foreground">{metric.label}</p>
            <p
              className={`mt-0.5 text-sm font-semibold tabular-nums tracking-tight ${metric.accent}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-20 top-0 h-[22rem] w-[22rem] rounded-full bg-[#39bdf8]/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-[#f4be7e]/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground transition hover:text-[#f4be7e]"
        >
          MyFinances
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-secondary transition hover:border-[#39bdf8]/35 hover:text-[#39bdf8]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="mf-btn-primary rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-95"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 lg:px-8">
        {/* Hero */}
        <section className="grid items-start gap-10 pb-16 pt-6 sm:gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:pb-20 lg:pt-10 xl:gap-14">
          <div className="min-w-0 lg:pr-4 xl:pr-8">
            <HeroFinanceVisual className="mb-8 w-full max-w-[min(100%,440px)] sm:mb-10 lg:mb-11 lg:max-w-[min(100%,480px)] xl:max-w-[500px]" />
            <p className="inline-flex rounded-full border border-[#39bdf8]/25 bg-[#39bdf8]/10 px-4 py-1.5 text-xs tracking-[0.18em] text-[#39bdf8]">
              PREMIUM PERSONAL FINANCE
            </p>
            <h1 className="mt-6 max-w-2xl text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:mt-7 sm:text-5xl lg:mt-8 lg:text-[3.2rem] lg:leading-[1.05] xl:text-[3.35rem]">
              Take Control of Your Financial Life
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              A modern personal finance manager to track income, expenses, debts, savings,
              investments, and financial goals in one place.
            </p>
            <div className="mt-9 sm:mt-10">
              <Link
                href="/signup"
                className="mf-btn-primary inline-flex rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-95"
              >
                Get Started
              </Link>
            </div>
          </div>
          <DashboardPreview />
        </section>

        {/* Features */}
        <section className="border-t border-white/[0.06] py-14 sm:py-16">
          <div className="mb-8 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built for clarity
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Three focused modules. One calm workspace.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        {/* Assets preview */}
        <section className="py-14 sm:py-16">
          <LandingAssetsPreview />
        </section>

        <section className="py-14 sm:py-16">
          <GlassCard className="p-8 lg:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why MyFinances Works Better
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-[#39bdf8]">Centralized finance management</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Unify accounts, debts, budgets, and investments under one secure workspace.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#39bdf8]">Better visibility</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  See your full financial picture instantly with live summaries and trends.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#39bdf8]">Financial discipline</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Build healthier habits through budget alerts and measurable monthly targets.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#39bdf8]">Decision making</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Make informed choices with contextual indicators and scenario-based insights.
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-base font-semibold text-[#39bdf8]">Clean analytics</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Interpret performance quickly using elegant visual reports and concise metrics.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-6xl px-6 py-5 text-center text-xs text-faint lg:px-8">
          © {new Date().getFullYear()} MyFinances
        </div>
      </footer>
    </div>
  );
}
