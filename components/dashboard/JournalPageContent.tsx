"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { AddCategoryCard } from "@/components/dashboard/budget/AddCategoryCard";
import { BudgetSortableCategoryList } from "@/components/dashboard/budget/BudgetSortableCategoryList";
import { BudgetTabs } from "@/components/dashboard/budget/BudgetTabs";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { useCurrency } from "@/components/preferences/CurrencyProvider";
import { VisualizationPanel } from "@/components/dashboard/VisualizationPanel";
import {
  addItem,
  computeBudgetTotals,
  createCategory,
  deleteCategoryFromList,
  deleteItem,
  getTabCategories,
  insertCategory,
  setTabCategories,
  updateCategoryInList,
  updateItemAmount,
  updateItemLabel,
  type BudgetCategory,
  type BudgetTabId,
  type JournalMonthSnapshot,
} from "@/lib/budget-model";
import {
  createJournalSnapshotForNewMonth,
  deleteJournalMonth,
  formatMonthLabel,
  getDefaultJournalSnapshot,
  listSavedMonthKeys,
  listSavedMonthKeysChronological,
  loadJournalMonth,
  monthKeyFromDate,
  parseMonthKey,
  saveJournalMonth,
} from "@/lib/journal-storage";
import { buildCategoryBreakdown, computeJournalOverviewMetrics } from "@/lib/journal-overview";
import { ArchiveMonthCard } from "@/components/dashboard/ArchiveMonthCard";
import { JournalMonthPickerModal } from "@/components/dashboard/JournalMonthPickerModal";
import { JournalMonthSelectorCenter } from "@/components/dashboard/JournalMonthSelectorCenter";
import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Landmark,
  NotebookPen,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { IconBox } from "@/components/dashboard/IconBox";

function isCurrentMonth(key: string): boolean {
  return key === monthKeyFromDate(new Date());
}

function tryChangeMonth(
  nextKey: string,
  dirty: boolean,
  setMonthKey: (k: string) => void,
): boolean {
  if (dirty && !window.confirm("You have unsaved changes. Switch months without saving?")) {
    return false;
  }
  setMonthKey(nextKey);
  return true;
}

function confirmDeleteCategory(title: string): boolean {
  return window.confirm(
    `Delete category "${title}" and all its lines? This cannot be undone.`,
  );
}

export function JournalPageContent() {
  const [monthKey, setMonthKey] = useState(() => monthKeyFromDate(new Date()));
  const [snap, setSnap] = useState<JournalMonthSnapshot>(() => getDefaultJournalSnapshot());
  const [activeTab, setActiveTab] = useState<BudgetTabId>("revenues");
  const [lastPersistedSerialized, setLastPersistedSerialized] = useState(
    () => JSON.stringify(getDefaultJournalSnapshot()),
  );
  const [hasSavedCopyOnDisk, setHasSavedCopyOnDisk] = useState(false);
  const [localStorageHydrated, setLocalStorageHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [storageRevision, setStorageRevision] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    startTransition(() => {
      const fromDisk = loadJournalMonth(monthKey);
      const initial = fromDisk ?? createJournalSnapshotForNewMonth(monthKey);
      setSnap(initial);
      setLastPersistedSerialized(fromDisk ? JSON.stringify(fromDisk) : JSON.stringify(initial));
      setHasSavedCopyOnDisk(!!fromDisk);
      setLocalStorageHydrated(true);
    });
  }, [monthKey]);

  const currentSerialized = JSON.stringify(snap);
  const dirty = currentSerialized !== lastPersistedSerialized;

  const { formatSignedAmount } = useCurrency();

  const { totalRevenues, totalInvestments, totalExpenses, surplus } = useMemo(
    () => computeBudgetTotals(snap),
    [snap],
  );

  const activeCategories = snap[activeTab];

  const revenueBreakdown = useMemo(() => buildCategoryBreakdown(snap.revenues), [snap.revenues]);
  const investmentBreakdown = useMemo(() => buildCategoryBreakdown(snap.investments), [snap.investments]);
  const expenseBreakdown = useMemo(() => buildCategoryBreakdown(snap.expenses), [snap.expenses]);

  const savedSummaries = useMemo(() => {
    if (!localStorageHydrated) return [];
    void storageRevision;
    return listSavedMonthKeysChronological()
      .map((key) => {
        const snapshot = loadJournalMonth(key);
        if (!snapshot) return null;
        const m = computeJournalOverviewMetrics(snapshot);
        return {
          key,
          revenue: m.monthlyRevenue,
          expenses: m.monthlyExpenses,
          surplus: m.surplus,
        };
      })
      .filter((row): row is { key: string; revenue: number; expenses: number; surplus: number } => row !== null);
  }, [storageRevision, localStorageHydrated]);

  const patchCategory = useCallback(
    (categoryId: string, updater: (cat: BudgetCategory) => BudgetCategory) => {
      setSnap((s) =>
        setTabCategories(s, activeTab, updateCategoryInList(s[activeTab], categoryId, updater)),
      );
    },
    [activeTab],
  );

  const handleAddCategory = useCallback(
    (afterIndex?: number) => {
      setSnap((s) => {
        const current = getTabCategories(s, activeTab);
        return setTabCategories(s, activeTab, insertCategory(current, createCategory(), afterIndex));
      });
    },
    [activeTab],
  );

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      const cat = snap[activeTab].find((c) => c.id === categoryId);
      if (!cat || !confirmDeleteCategory(cat.title)) return;
      setSnap((s) =>
        setTabCategories(s, activeTab, deleteCategoryFromList(s[activeTab], categoryId)),
      );
    },
    [activeTab, snap],
  );

  const handleSave = useCallback(() => {
    saveJournalMonth(monthKey, snap);
    setLastPersistedSerialized(JSON.stringify(snap));
    setHasSavedCopyOnDisk(true);
    setStorageRevision((r) => r + 1);
    setSaveMessage("Budget saved for " + formatMonthLabel(monthKey));
    window.setTimeout(() => setSaveMessage(null), 3500);
  }, [monthKey, snap]);

  const handleDeleteSavedMonth = useCallback(
    (key: string) => {
      if (
        !window.confirm(
          `Are you sure you want to delete the saved data for ${formatMonthLabel(key)}? This cannot be undone.`,
        )
      ) {
        return;
      }
      deleteJournalMonth(key);
      setStorageRevision((r) => r + 1);

      if (key !== monthKey) return;

      const remaining = listSavedMonthKeys();
      const today = monthKeyFromDate(new Date());

      if (remaining.includes(today)) {
        tryChangeMonth(today, false, setMonthKey);
      } else if (remaining.length > 0) {
        tryChangeMonth(remaining[0], false, setMonthKey);
      } else {
        setMonthKey(today);
      }
    },
    [monthKey],
  );

  const goPrevMonth = () => {
    const parsed = parseMonthKey(monthKey);
    if (!parsed) return;
    const d = new Date(parsed.year, parsed.month - 2, 1);
    tryChangeMonth(monthKeyFromDate(d), dirty, setMonthKey);
  };

  const goNextMonth = () => {
    const parsed = parseMonthKey(monthKey);
    if (!parsed) return;
    const d = new Date(parsed.year, parsed.month, 1);
    const next = monthKeyFromDate(d);
    const todayKey = monthKeyFromDate(new Date());
    if (next > todayKey) return;
    tryChangeMonth(next, dirty, setMonthKey);
  };

  return (
    <div>
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconBox className="h-10 w-10">
              <NotebookPen className="h-5 w-5" strokeWidth={1.5} />
            </IconBox>
            <div>
              <h1 className="text-3xl font-semibold text-white mf-light:text-slate-900">Budget</h1>
              <p className="mt-1 text-sm text-slate-400 mf-light:text-slate-600">
                Monthly budget and finance recording. Data is stored locally in your browser until a backend is
                connected.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isCurrentMonth(monthKey) && (
              <span className="rounded-full border border-cyan-300/35 bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-100">
                Current month
              </span>
            )}
            {!dirty && hasSavedCopyOnDisk && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                Saved
              </span>
            )}
            {dirty && (
              <span className="rounded-full border border-amber-300/35 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
                Unsaved changes
              </span>
            )}
            {!hasSavedCopyOnDisk && !dirty && (
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Not saved yet
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="mf-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-90"
            >
              <Save className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              Save
            </button>
          </div>
        </div>

        {saveMessage && (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" strokeWidth={1.5} aria-hidden />
            {saveMessage}
          </p>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur mf-light:border-slate-200 mf-light:bg-white/90">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-stretch sm:justify-center sm:gap-4">
            <button
              type="button"
              onClick={goPrevMonth}
              className="group inline-flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-3 py-2.5 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-cyan-400/35 hover:bg-white/[0.08] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:max-w-[140px] sm:flex-none sm:min-w-[100px]"
            >
              <ChevronLeft
                className="h-6 w-6 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-cyan-200"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-400">
                Previous
              </span>
            </button>
            <JournalMonthSelectorCenter
              monthKey={monthKey}
              hasSavedCopyOnDisk={hasSavedCopyOnDisk}
              dirty={dirty}
              pickerOpen={pickerOpen}
              onOpenPicker={() => setPickerOpen(true)}
            />
            <button
              type="button"
              onClick={goNextMonth}
              disabled={monthKey >= monthKeyFromDate(new Date())}
              className="group inline-flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-3 py-2.5 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-cyan-400/35 hover:bg-white/[0.08] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-slate-600 disabled:shadow-none sm:max-w-[140px] sm:flex-none sm:min-w-[100px]"
            >
              <ChevronRight
                className="h-6 w-6 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-200 disabled:group-hover:translate-x-0"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-400">
                Next
              </span>
            </button>
          </div>
          <div className="flex justify-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-200">
              {surplus >= 0 ? (
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} aria-hidden />
              ) : (
                <TrendingDown className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.5} aria-hidden />
              )}
              <span className="text-slate-400">Cashflow: </span>
              <span
                className={
                  surplus >= 0
                    ? "font-medium text-emerald-300 mf-light:text-emerald-700"
                    : "font-medium text-rose-500 mf-light:text-rose-800"
                }
              >
                {formatSignedAmount(surplus)}
              </span>
            </p>
          </div>

          {savedSummaries.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Archive className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={1.5} aria-hidden />
                Archive
              </p>
              <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-color:color-mix(in_srgb,var(--mf-accent)_35%,transparent)_var(--mf-surface-card)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500/35 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/50">
                <div className="flex w-max min-w-full gap-2 pr-1">
                  {savedSummaries.map((row) => (
                    <div key={`archive-${row.key}`} className="w-[158px] shrink-0 sm:w-[168px]">
                      <ArchiveMonthCard
                        monthKey={row.key}
                        revenue={row.revenue}
                        expenses={row.expenses}
                        surplus={row.surplus}
                        isSelected={row.key === monthKey}
                        onSelect={() => tryChangeMonth(row.key, dirty, setMonthKey)}
                        onDelete={() => handleDeleteSavedMonth(row.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Revenues" value={totalRevenues} tone="positive" icon={ArrowUpRight} />
        <SummaryCard label="Total Investments" value={totalInvestments} tone="accent" icon={Landmark} />
        <SummaryCard label="Total Expenses" value={totalExpenses} tone="negative" icon={ArrowDownRight} />
        <SummaryCard
          label="Cashflow"
          value={surplus}
          format="signed-currency"
          tone={surplus >= 0 ? "positive" : "negative"}
          helper="Revenues minus expenses (investments excluded)"
          icon={surplus >= 0 ? TrendingUp : TrendingDown}
        />
      </section>

      <section className="mb-6 space-y-6">
        <BudgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          key={activeTab}
          role="tabpanel"
          className="space-y-5 transition-opacity duration-200"
        >
          <BudgetSortableCategoryList
            categories={activeCategories}
            onReorder={(categories) =>
              setSnap((s) => setTabCategories(s, activeTab, categories))
            }
            onTitleChange={(categoryId, title) =>
              patchCategory(categoryId, (c) => ({ ...c, title }))
            }
            onAmountChange={(categoryId, itemId, amount) =>
              patchCategory(categoryId, (c) => ({
                ...c,
                items: updateItemAmount(c.items, itemId, amount),
              }))
            }
            onLabelChange={(categoryId, itemId, label) =>
              patchCategory(categoryId, (c) => ({
                ...c,
                items: updateItemLabel(c.items, itemId, label),
              }))
            }
            onDeleteItem={(categoryId, itemId) =>
              patchCategory(categoryId, (c) => ({
                ...c,
                items: deleteItem(c.items, itemId),
              }))
            }
            onAddLine={(categoryId) =>
              patchCategory(categoryId, (c) => ({
                ...c,
                items: addItem(c.items, "New line", 0),
              }))
            }
            onDeleteCategory={handleDeleteCategory}
            onAddCategoryAfter={handleAddCategory}
          />

          <AddCategoryCard onClick={() => handleAddCategory()} />
        </div>
      </section>

      <section>
        <VisualizationPanel
          totalRevenue={totalRevenues}
          totalExpense={totalExpenses}
          totalInvestments={totalInvestments}
          difference={surplus}
          revenueSections={revenueBreakdown}
          investmentSections={investmentBreakdown}
          expenseSections={expenseBreakdown}
        />
      </section>

      <JournalMonthPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        monthKey={monthKey}
        maxMonthKey={monthKeyFromDate(new Date())}
        onApply={(next) => tryChangeMonth(next, dirty, setMonthKey)}
      />
    </div>
  );
}
