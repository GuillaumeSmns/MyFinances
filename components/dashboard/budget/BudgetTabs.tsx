"use client";

import { BUDGET_TABS, type BudgetTabId } from "@/lib/budget-model";

type BudgetTabsProps = {
  activeTab: BudgetTabId;
  onTabChange: (tab: BudgetTabId) => void;
};

export function BudgetTabs({ activeTab, onTabChange }: BudgetTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Budget sections"
      className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/50 p-1.5 mf-light:border-slate-200 mf-light:bg-white/90"
    >
      {BUDGET_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-400/15 text-amber-100 shadow-[inset_0_0_0_1px_rgba(244,190,126,0.35)] mf-light:bg-amber-50 mf-light:text-amber-900"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 mf-light:text-slate-600 mf-light:hover:bg-slate-100 mf-light:hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
