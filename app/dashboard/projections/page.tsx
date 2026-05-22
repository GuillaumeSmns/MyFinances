import Link from "next/link";
import { CreditCard, Landmark, LineChart, Percent, Sparkles, Sunset, TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";

const PROJECTION_CARDS = [
  { title: "Cash flow forecast", subtitle: "Coming soon", Icon: LineChart },
  { title: "Savings trajectory", subtitle: "Coming soon", Icon: TrendingUp },
  { title: "Debt payoff", subtitle: "Coming soon", Icon: CreditCard },
  {
    title: "Compound Interest Calculator",
    subtitle: "Model long-term growth with contributions",
    Icon: Percent,
    href: "/dashboard/projections/compound-interest",
  },
  {
    title: "Retirement Planning",
    subtitle: "Estimate your path to financial independence",
    Icon: Sunset,
    href: "/dashboard/projections/retirement",
  },
  { title: "Investment growth", subtitle: "Coming soon", Icon: Landmark },
  { title: "What-if scenarios", subtitle: "Coming soon", Icon: Sparkles },
] as const;

export default function ProjectionsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Projections</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Model future cash flow, savings growth, debt repayment, and investment scenarios. Scenario tools will
            live here.
          </p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PROJECTION_CARDS.map(({ title, subtitle, Icon, ...rest }) => {
          const href = "href" in rest ? rest.href : undefined;
          const body = (
            <p className="text-sm text-muted-foreground">
              {href ? "Open calculator →" : "Placeholder for calculators and charts."}
            </p>
          );
          return (
            <DashboardCard
              key={title}
              title={title}
              subtitle={subtitle}
              titleIcon={
                <IconBox>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </IconBox>
              }
              className={href ? "transition hover:border-[#f4be7e]/30" : undefined}
            >
              {href ? (
                <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-[#f4be7e]/50">
                  {body}
                </Link>
              ) : (
                body
              )}
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
