"use client";

import { Palette, UserCircle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { ThemeToggleControl } from "@/components/theme/ThemeToggleControl";

export type ProfilePageModel = {
  displayName: string;
  email: string;
  accountStatus: string;
  memberSince: string;
  preferredCurrency: string;
  defaultMonthView: string;
};

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] py-3 last:border-b-0 mf-light:border-slate-200/80">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 mf-light:text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-200 mf-light:text-slate-800">{value}</dd>
    </div>
  );
}

export function ProfilePageContent({ profile }: { profile: ProfilePageModel }) {
  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11">
          <UserCircle className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mf-light:text-slate-900">Profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400 mf-light:text-slate-600">
            Manage your account and workspace preferences. Review identity details, defaults, and security in one
            place.
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Account" subtitle="Identity and plan status">
          <dl>
            <ProfileRow label="Name" value={profile.displayName} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Account status" value={profile.accountStatus} />
            <ProfileRow label="Member since" value={profile.memberSince} />
          </dl>
        </DashboardCard>

        <DashboardCard title="Preferences" subtitle="Display and workspace defaults">
          <dl>
            <ProfileRow label="Preferred currency" value={profile.preferredCurrency} />
            <ProfileRow label="Default month view" value={profile.defaultMonthView} />
          </dl>
        </DashboardCard>

        <DashboardCard title="Security" subtitle="Authentication and access">
          <p className="text-sm leading-relaxed text-slate-400 mf-light:text-slate-600">
            Security and authentication settings for your account. Manage your password, two-factor authentication,
            and active sessions to keep your financial workspace protected.
          </p>
        </DashboardCard>

        <DashboardCard title="App preferences" subtitle="Experience and notifications">
          <p className="text-sm leading-relaxed text-slate-400 mf-light:text-slate-600">
            Customize how MyFinances works for you—notification delivery, number formatting, and calendar defaults
            for budgets and reports.
          </p>
        </DashboardCard>

        <DashboardCard
          title="Appearance"
          subtitle="Dark mode is the default MyFinances look"
          className="lg:col-span-2"
          titleIcon={
            <IconBox>
              <Palette className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <ThemeToggleControl />
        </DashboardCard>
      </div>
    </div>
  );
}
