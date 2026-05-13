import { Banknote, Building2, Car, Package, Wallet } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";

const ASSET_CARDS = [
  { title: "Real estate", subtitle: "Coming soon", Icon: Building2 },
  { title: "Investment accounts", subtitle: "Coming soon", Icon: Wallet },
  { title: "Bank & cash", subtitle: "Coming soon", Icon: Banknote },
  { title: "Vehicles & valuables", subtitle: "Coming soon", Icon: Car },
  { title: "Other assets", subtitle: "Coming soon", Icon: Package },
] as const;

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <Wallet className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Assets</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Track real estate, investments, bank accounts, and other assets. This area will connect to your
            portfolio and accounts in a future release.
          </p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ASSET_CARDS.map(({ title, subtitle, Icon }) => (
          <DashboardCard
            key={title}
            title={title}
            subtitle={subtitle}
            titleIcon={
              <IconBox>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
          >
            <p className="text-sm text-slate-400">
              Placeholder for balances, valuations, and linked documentation.
            </p>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
