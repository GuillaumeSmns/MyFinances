import type { Metadata } from "next";
import { JournalPageContent } from "@/components/dashboard/JournalPageContent";

export const metadata: Metadata = {
  title: "Budget | MyFinances",
  description: "Monthly budget and finance recording.",
};

export default function BudgetPage() {
  return <JournalPageContent />;
}
