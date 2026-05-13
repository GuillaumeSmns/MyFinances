"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { FinanceSection } from "@/components/dashboard/FinanceSection";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { VisualizationPanel } from "@/components/dashboard/VisualizationPanel";
import type { FinanceItem, SectionTotal } from "@/components/dashboard/types";
import {
  deleteJournalMonth,
  formatMonthLabel,
  getDefaultJournalSnapshot,
  listSavedMonthKeys,
  listSavedMonthKeysChronological,
  loadJournalMonth,
  monthKeyFromDate,
  parseMonthKey,
  saveJournalMonth,
  type JournalMonthSnapshot,
} from "@/lib/journal-storage";
import { computeJournalOverviewMetrics } from "@/lib/journal-overview";
import { ArchiveMonthCard } from "@/components/dashboard/ArchiveMonthCard";
import { JournalMonthPickerModal } from "@/components/dashboard/JournalMonthPickerModal";
import { JournalMonthSelectorCenter } from "@/components/dashboard/JournalMonthSelectorCenter";
import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Landmark,
  NotebookPen,
  Percent,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { IconBox } from "@/components/dashboard/IconBox";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sumItems = (items: FinanceItem[]) => items.reduce((acc, item) => acc + item.amount, 0);

const updateItemAmount = (items: FinanceItem[], id: string, amount: number) =>
  items.map((item) => (item.id === id ? { ...item, amount: Number.isFinite(amount) ? amount : 0 } : item));

const addItem = (items: FinanceItem[], label: string, amount: number) => [
  ...items,
  { id: makeId(), label, amount },
];

const deleteItem = (items: FinanceItem[], id: string) => items.filter((item) => item.id !== id);

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

export function JournalPageContent() {
  const [monthKey, setMonthKey] = useState(() => monthKeyFromDate(new Date()));
  const [snap, setSnap] = useState<JournalMonthSnapshot>(() => getDefaultJournalSnapshot());
  const [lastPersistedSerialized, setLastPersistedSerialized] = useState<string>(() =>
    JSON.stringify(getDefaultJournalSnapshot()),
  );
  const [hasSavedCopyOnDisk, setHasSavedCopyOnDisk] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [storageRevision, setStorageRevision] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    startTransition(() => {
      const fromDisk = loadJournalMonth(monthKey);
      const initial = fromDisk ?? getDefaultJournalSnapshot();
      setSnap(initial);
      setLastPersistedSerialized(fromDisk ? JSON.stringify(fromDisk) : JSON.stringify(initial));
      setHasSavedCopyOnDisk(!!fromDisk);
    });
  }, [monthKey]);

  const currentSerialized = JSON.stringify(snap);
  const dirty = currentSerialized !== lastPersistedSerialized;

  const revenueTotals = useMemo(
    () => ({
      pilot: sumItems(snap.pilotRevenue),
      financial: sumItems(snap.financialRevenue),
      immo: sumItems(snap.immoRevenue),
    }),
    [snap.pilotRevenue, snap.financialRevenue, snap.immoRevenue],
  );

  const expenseTotals = useMemo(
    () => ({
      pilot: sumItems(snap.pilotExpense),
      loans: sumItems(snap.loanExpense),
      everyday: sumItems(snap.everydayExpense),
      home: sumItems(snap.homeCharges),
      investments: sumItems(snap.investments),
    }),
    [snap.pilotExpense, snap.loanExpense, snap.everydayExpense, snap.homeCharges, snap.investments],
  );

  const totalRevenue = revenueTotals.pilot + revenueTotals.financial + revenueTotals.immo;
  const totalExpense =
    expenseTotals.pilot +
    expenseTotals.loans +
    expenseTotals.everyday +
    expenseTotals.home +
    expenseTotals.investments;
  const difference = totalRevenue - totalExpense;

  const revenueBreakdown: SectionTotal[] = [
    { name: "Pilot Revenue", total: revenueTotals.pilot },
    { name: "Financial Revenue", total: revenueTotals.financial },
    { name: "Immo", total: revenueTotals.immo },
  ];

  const expenseBreakdown: SectionTotal[] = [
    { name: "Pilot Expense", total: expenseTotals.pilot },
    { name: "Loan", total: expenseTotals.loans },
    { name: "Everyday Expenses", total: expenseTotals.everyday },
    { name: "Home Charges", total: expenseTotals.home },
    { name: "Investments", total: expenseTotals.investments },
  ];

  const savedSummaries = useMemo(() => {
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
  }, [storageRevision]);

  const handleSave = useCallback(() => {
    saveJournalMonth(monthKey, snap);
    setLastPersistedSerialized(JSON.stringify(snap));
    setHasSavedCopyOnDisk(true);
    setStorageRevision((r) => r + 1);
    setSaveMessage("Journal saved for " + formatMonthLabel(monthKey));
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
              <h1 className="text-3xl font-semibold text-white">Journal</h1>
              <p className="mt-1 text-sm text-slate-400">
                Monthly finance recording. Data is stored locally in your browser until a backend is connected.
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
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
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

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-4 sm:flex-row sm:items-stretch sm:justify-center sm:gap-5">
            <button
              type="button"
              onClick={goPrevMonth}
              className="group inline-flex min-h-[132px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-4 py-4 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-cyan-400/35 hover:bg-white/[0.08] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:max-w-[160px] sm:flex-none sm:min-w-[132px]"
            >
              <ChevronLeft
                className="h-8 w-8 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-cyan-200"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-400">
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
              className="group inline-flex min-h-[132px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-4 py-4 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-cyan-400/35 hover:bg-white/[0.08] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-slate-600 disabled:shadow-none sm:max-w-[160px] sm:flex-none sm:min-w-[132px]"
            >
              <ChevronRight
                className="h-8 w-8 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-200 disabled:group-hover:translate-x-0"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-400">
                Next
              </span>
            </button>
          </div>
          <div className="flex justify-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-200">
              {difference >= 0 ? (
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} aria-hidden />
              ) : (
                <TrendingDown className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.5} aria-hidden />
              )}
              {difference >= 0 ? "Surplus" : "Deficit"}: AED {Math.abs(difference).toLocaleString()}
            </p>
          </div>

          {savedSummaries.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Archive className="h-3.5 w-3.5 shrink-0 text-slate-600" strokeWidth={1.5} aria-hidden />
                Archive
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {savedSummaries.map((row) => (
                  <ArchiveMonthCard
                    key={`archive-${row.key}`}
                    monthKey={row.key}
                    revenue={row.revenue}
                    expenses={row.expenses}
                    surplus={row.surplus}
                    isSelected={row.key === monthKey}
                    onSelect={() => tryChangeMonth(row.key, dirty, setMonthKey)}
                    onDelete={() => handleDeleteSavedMonth(row.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Revenues"
          value={totalRevenue}
          tone="positive"
          icon={ArrowUpRight}
        />
        <SummaryCard
          label="Total Expenses"
          value={totalExpense}
          tone="negative"
          icon={ArrowDownRight}
        />
        <SummaryCard
          label="Cash Flow Difference"
          value={difference}
          tone={difference >= 0 ? "positive" : "negative"}
          helper={difference >= 0 ? "Positive monthly cash flow" : "Expenses exceed revenues"}
          icon={difference >= 0 ? TrendingUp : TrendingDown}
        />
        <SummaryCard
          label="Savings Ratio"
          value={totalRevenue > 0 ? Math.round((difference / totalRevenue) * 100) : 0}
          format="percent"
          helper="Difference as % of total revenue"
          icon={Percent}
        />
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <ArrowUpRight className="h-5 w-5 shrink-0 text-emerald-400/90" strokeWidth={1.5} aria-hidden />
            Revenue
          </h2>
          <FinanceSection
            title="Pilot Revenue"
            subtitle="Fixed structure with editable values"
            sectionIcon={
              <IconBox>
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.pilotRevenue}
            total={revenueTotals.pilot}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, pilotRevenue: updateItemAmount(s.pilotRevenue, id, value) }))
            }
          />
          <FinanceSection
            title="Financial Revenue"
            subtitle="Add and manage custom finance revenue streams"
            sectionIcon={
              <IconBox>
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.financialRevenue}
            total={revenueTotals.financial}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, financialRevenue: updateItemAmount(s.financialRevenue, id, value) }))
            }
            onDeleteItem={(id) =>
              setSnap((s) => ({ ...s, financialRevenue: deleteItem(s.financialRevenue, id) }))
            }
            onAddItem={(label, amount) =>
              setSnap((s) => ({ ...s, financialRevenue: addItem(s.financialRevenue, label, amount) }))
            }
            addButtonLabel="Add Revenue"
          />
          <FinanceSection
            title="Immo"
            subtitle="Custom real estate revenue items"
            sectionIcon={
              <IconBox>
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.immoRevenue}
            total={revenueTotals.immo}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, immoRevenue: updateItemAmount(s.immoRevenue, id, value) }))
            }
            onDeleteItem={(id) => setSnap((s) => ({ ...s, immoRevenue: deleteItem(s.immoRevenue, id) }))}
            onAddItem={(label, amount) =>
              setSnap((s) => ({ ...s, immoRevenue: addItem(s.immoRevenue, label, amount) }))
            }
            addButtonLabel="Add Immo Item"
          />
        </div>

        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <ArrowDownRight className="h-5 w-5 shrink-0 text-rose-400/90" strokeWidth={1.5} aria-hidden />
            Expenses
          </h2>
          <FinanceSection
            title="Pilot Expense"
            subtitle="Fixed structure with editable values"
            sectionIcon={
              <IconBox>
                <ArrowDownRight className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.pilotExpense}
            total={expenseTotals.pilot}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, pilotExpense: updateItemAmount(s.pilotExpense, id, value) }))
            }
          />
          <FinanceSection
            title="Loan"
            subtitle="Custom loan items with editable amount"
            sectionIcon={
              <IconBox>
                <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.loanExpense}
            total={expenseTotals.loans}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, loanExpense: updateItemAmount(s.loanExpense, id, value) }))
            }
            onDeleteItem={(id) => setSnap((s) => ({ ...s, loanExpense: deleteItem(s.loanExpense, id) }))}
            onAddItem={(label, amount) =>
              setSnap((s) => ({ ...s, loanExpense: addItem(s.loanExpense, label, amount) }))
            }
            addButtonLabel="Add Loan"
          />
          <FinanceSection
            title="Everyday Expenses"
            subtitle="Add recurring and variable daily costs"
            sectionIcon={
              <IconBox>
                <ArrowDownRight className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.everydayExpense}
            total={expenseTotals.everyday}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, everydayExpense: updateItemAmount(s.everydayExpense, id, value) }))
            }
            onDeleteItem={(id) =>
              setSnap((s) => ({ ...s, everydayExpense: deleteItem(s.everydayExpense, id) }))
            }
            onAddItem={(label, amount) =>
              setSnap((s) => ({ ...s, everydayExpense: addItem(s.everydayExpense, label, amount) }))
            }
            addButtonLabel="Add Expense"
          />
          <FinanceSection
            title="Home Charges"
            subtitle="Fixed household costs with editable amount"
            sectionIcon={
              <IconBox>
                <Home className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.homeCharges}
            total={expenseTotals.home}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, homeCharges: updateItemAmount(s.homeCharges, id, value) }))
            }
          />
          <FinanceSection
            title="Investments"
            subtitle="User-defined monthly investment allocations"
            sectionIcon={
              <IconBox>
                <Landmark className="h-4 w-4" strokeWidth={1.5} />
              </IconBox>
            }
            items={snap.investments}
            total={expenseTotals.investments}
            onAmountChange={(id, value) =>
              setSnap((s) => ({ ...s, investments: updateItemAmount(s.investments, id, value) }))
            }
            onDeleteItem={(id) => setSnap((s) => ({ ...s, investments: deleteItem(s.investments, id) }))}
            onAddItem={(label, amount) =>
              setSnap((s) => ({ ...s, investments: addItem(s.investments, label, amount) }))
            }
            addButtonLabel="Add Investment"
          />
        </div>
      </section>

      <section>
        <VisualizationPanel
          totalRevenue={totalRevenue}
          totalExpense={totalExpense}
          difference={difference}
          revenueSections={revenueBreakdown}
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
