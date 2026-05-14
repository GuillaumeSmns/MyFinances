import type { ReactNode } from "react";
import { Coins } from "lucide-react";
import { AddItemForm } from "@/components/dashboard/AddItemForm";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { FinanceItemRow } from "@/components/dashboard/FinanceItemRow";
import type { FinanceItem } from "@/components/dashboard/types";

type FinanceSectionProps = {
  title: string;
  subtitle: string;
  sectionIcon?: ReactNode;
  items: FinanceItem[];
  total: number;
  onAmountChange: (id: string, value: number) => void;
  onLabelChange?: (id: string, label: string) => void;
  onDeleteItem?: (id: string) => void;
  onAddItem?: (label: string, amount: number) => void;
  addButtonLabel?: string;
};

export function FinanceSection({
  title,
  subtitle,
  sectionIcon,
  items,
  total,
  onAmountChange,
  onLabelChange,
  onDeleteItem,
  onAddItem,
  addButtonLabel,
}: FinanceSectionProps) {
  return (
    <DashboardCard title={title} subtitle={subtitle} titleIcon={sectionIcon}>
      <div className="space-y-3">
        {items.map((item) => (
          <FinanceItemRow
            key={item.id}
            item={item}
            onAmountChange={onAmountChange}
            onLabelChange={onLabelChange}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
      {onAddItem && <AddItemForm onAddItem={onAddItem} buttonLabel={addButtonLabel} />}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 py-2">
        <span className="flex items-center gap-2 text-sm text-cyan-100">
          <Coins className="h-3.5 w-3.5 shrink-0 text-cyan-300/90" strokeWidth={1.5} aria-hidden />
          Section total
        </span>
        <span className="text-sm font-semibold text-cyan-200">AED {total.toLocaleString()}</span>
      </div>
    </DashboardCard>
  );
}
