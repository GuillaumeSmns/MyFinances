import type { Metadata } from "next";
import { JournalPageContent } from "@/components/dashboard/JournalPageContent";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Budget | MyFinances",
  description: "Monthly budget and finance recording.",
};

export default async function BudgetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <JournalPageContent userId={user?.id ?? null} />;
}
