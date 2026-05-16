"use client";

import { CurrencyProvider } from "@/components/preferences/CurrencyProvider";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
