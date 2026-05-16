import type { Metadata } from "next";
import { ProfilePageContent, type ProfilePageAccount } from "@/components/dashboard/ProfilePageContent";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Profile | MyFinances",
  description: "Account settings and preferences.",
};

function formatMemberSince(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "—";
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof meta?.full_name === "string" && meta.full_name.trim() ? meta.full_name.trim() : null;
  const displayName = fullName ?? (email !== "—" ? (email.split("@")[0] ?? "Guest") : "Guest");

  const account: ProfilePageAccount = {
    fallbackDisplayName: displayName,
    email,
    accountStatus: user ? "Active" : "Not signed in",
    memberSince: user ? formatMemberSince(user.created_at) : "—",
  };

  return <ProfilePageContent account={account} />;
}
