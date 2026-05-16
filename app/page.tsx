import Link from "next/link";
import { HeroFinanceVisual } from "@/components/landing/HeroFinanceVisual";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

type Metric = {
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
};

type SpendingPoint = {
  month: string;
  amount: number;
};

const features: Feature[] = [
  {
    title: "Personal Dashboard",
    description: "All your financial essentials in one elegant command center.",
    icon: "PI",
  },
  {
    title: "Expense Tracking",
    description: "Capture and categorize spending in real time with precision.",
    icon: "ET",
  },
  {
    title: "Debt Management",
    description: "Track liabilities and progress toward debt-free milestones.",
    icon: "DM",
  },
  {
    title: "Budget Planning",
    description: "Set smart monthly budgets and stay aligned with your goals.",
    icon: "BP",
  },
  {
    title: "Revenue Tracking",
    description: "Monitor incoming cash flow from salary, business, and side income.",
    icon: "RT",
  },
  {
    title: "Investment Overview",
    description: "Get a concise snapshot of portfolio value and allocations.",
    icon: "IO",
  },
  {
    title: "Monthly Analytics",
    description: "Understand trends with clean and actionable visual insights.",
    icon: "MA",
  },
  {
    title: "Financial Goals",
    description: "Create long-term targets and track your progress automatically.",
    icon: "FG",
  },
];

const metrics: Metric[] = [
  { label: "Total Balance", value: "$58,420", trend: "+4.1% this month", positive: true },
  {
    label: "Monthly Expenses",
    value: "$4,280",
    trend: "-6.4% vs last month",
    positive: true,
  },
  { label: "Savings Rate", value: "32%", trend: "+3.2 pts increase", positive: true },
  { label: "Debts", value: "$12,750", trend: "2 active loans" },
];

const spendingTrend: SpendingPoint[] = [
  { month: "Jan", amount: 3820 },
  { month: "Feb", amount: 4210 },
  { month: "Mar", amount: 3650 },
  { month: "Apr", amount: 4480 },
  { month: "May", amount: 4280 },
  { month: "Jun", amount: 4710 },
  { month: "Jul", amount: 4390 },
  { month: "Aug", amount: 4920 },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition duration-300 hover:border-cyan-300/30 hover:bg-white/10 mf-light:border-slate-200/90 mf-light:bg-white/80 mf-light:hover:border-cyan-400/40 mf-light:hover:bg-white ${className}`}
    >
      {children}
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-xs font-semibold tracking-wide text-cyan-200">
        {feature.icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white mf-light:text-slate-900">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">{feature.description}</p>
    </GlassCard>
  );
}

function DashboardMockup() {
  const maxAmount = Math.max(...spendingTrend.map((point) => point.amount));

  return (
    <GlassCard className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mf-light:text-slate-600">Financial Snapshot</p>
          <p className="mt-1 text-lg font-semibold text-white mf-light:text-slate-900">MyFinances Dashboard</p>
        </div>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          Live
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-cyan-300/30 mf-light:border-slate-200 mf-light:bg-slate-50"
          >
            <p className="text-xs text-slate-400 mf-light:text-slate-600">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white mf-light:text-slate-900">{item.value}</p>
            <p className={`mt-1 text-xs ${item.positive ? "text-emerald-300" : "text-slate-400"}`}>
              {item.trend}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="landing-spending-trend rounded-xl border border-white/10 bg-slate-950/40 p-4 mf-light:border-slate-200 mf-light:bg-slate-50">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-white mf-light:text-slate-900">Spending Trend</p>
            <p className="text-xs text-slate-400 mf-light:text-slate-600">Year to date: $34,460</p>
          </div>
          <div className="relative h-40">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <span className="border-t border-white/10" />
              <span className="border-t border-white/10" />
              <span className="border-t border-white/10" />
              <span className="border-t border-white/10" />
            </div>
            <div className="relative flex h-full items-end gap-2">
            {spendingTrend.map((point) => (
              <div key={point.month} className="group relative flex h-full flex-1 items-end">
                <div
                  className="mf-chart-bar w-full rounded-t-md"
                  style={{ height: `${Math.round((point.amount / maxAmount) * 100)}%` }}
                />
                <span className="landing-spending-trend-tooltip pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded-md border bg-slate-900/95 px-2 py-1 text-[10px] text-slate-200 group-hover:block mf-light:bg-white mf-light:text-slate-800">
                  ${point.amount.toLocaleString()}
                </span>
              </div>
            ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400 mf-light:text-slate-600">
            {spendingTrend.map((point) => (
              <span key={point.month}>{point.month}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 mf-light:border-slate-200 mf-light:bg-slate-50">
          <p className="mb-3 text-sm font-medium text-white mf-light:text-slate-900">Monthly Input Summary</p>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 mf-light:border-slate-200 mf-light:bg-slate-100">
              <p className="text-xs text-slate-400 mf-light:text-slate-600">Revenue</p>
              <p className="mt-1 text-base font-medium text-emerald-300">$7,400</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 mf-light:border-slate-200 mf-light:bg-slate-100">
              <p className="text-xs text-slate-400 mf-light:text-slate-600">Expenses</p>
              <p className="mt-1 text-base font-medium mf-text-expense mf-light:text-rose-800">$4,280</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 mf-light:border-slate-200 mf-light:bg-slate-100">
              <p className="text-xs text-slate-400 mf-light:text-slate-600">Net Monthly Result</p>
              <p className="mt-1 text-base font-medium text-cyan-200">$3,120</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 mf-light:bg-slate-100 mf-light:text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition hover:text-cyan-200 mf-light:text-slate-900 mf-light:hover:text-cyan-700"
        >
          MyFinances
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200 mf-light:border-slate-300 mf-light:text-slate-700 mf-light:hover:border-cyan-500/50 mf-light:hover:text-cyan-700"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="mf-btn-primary rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 lg:px-8">
        <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <HeroFinanceVisual className="mb-4 sm:mb-5" />
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1 text-xs tracking-[0.18em] text-cyan-200">
              PREMIUM PERSONAL FINANCE
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl mf-light:text-slate-900">
              Take Control of Your Financial Life
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg mf-light:text-slate-600">
              A modern personal finance manager to track income, expenses, debts, savings,
              investments, and financial goals in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="mf-btn-primary rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-[1.01] hover:opacity-95"
              >
                Get Started
              </Link>
            </div>
          </div>
          <DashboardMockup />
        </section>

        <section className="py-12 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold text-white mf-light:text-slate-900">Everything You Need to Master Money</h2>
            <p className="mt-3 text-slate-300 mf-light:text-slate-600">
              Purpose-built tools designed to simplify financial operations and improve clarity.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <h2 className="mb-8 text-3xl font-semibold text-white mf-light:text-slate-900">Dashboard Preview</h2>
          <DashboardMockup />
        </section>

        <section className="py-12 lg:py-16">
          <GlassCard className="p-8 lg:p-10">
            <h2 className="text-3xl font-semibold text-white mf-light:text-slate-900">Why MyFinances Works Better</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-cyan-200 mf-light:text-cyan-800">Centralized finance management</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">
                  Unify accounts, debts, budgets, and investments under one secure workspace.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-cyan-200 mf-light:text-cyan-800">Better visibility</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">
                  See your full financial picture instantly with live summaries and trends.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-cyan-200 mf-light:text-cyan-800">Financial discipline</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">
                  Build healthier habits through budget alerts and measurable monthly targets.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-cyan-200 mf-light:text-cyan-800">Decision making</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">
                  Make informed choices with contextual indicators and scenario-based insights.
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-base font-semibold text-cyan-200 mf-light:text-cyan-800">Clean analytics</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 mf-light:text-slate-600">
                  Interpret performance quickly using elegant visual reports and concise metrics.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="border-t border-white/10 mf-light:border-slate-200">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-slate-400 mf-light:text-slate-600 lg:px-8">
          <p>© {new Date().getFullYear()} MyFinances. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
