"use client";

import { useCallback, useMemo } from "react";
import { AlertCircle, Loader2, PieChart, Wallet } from "lucide-react";
import { AddAssetCategoryCard } from "@/components/dashboard/assets/AddAssetCategoryCard";
import { AssetRiskMetrics } from "@/components/dashboard/assets/AssetRiskMetrics";
import { AssetSortableCategoryList } from "@/components/dashboard/assets/AssetSortableCategoryList";
import { AssetsSummaryCards } from "@/components/dashboard/assets/AssetsSummaryCards";
import { CurrencyExposureChart } from "@/components/dashboard/assets/CurrencyExposureChart";
import { LiquidityBreakdown } from "@/components/dashboard/assets/LiquidityBreakdown";
import { PatrimonyAllocationChart } from "@/components/dashboard/assets/PatrimonyAllocationChart";
import { useAssetsSupabase } from "@/components/dashboard/assets/useAssetsSupabase";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { IconBox } from "@/components/dashboard/IconBox";
import { useAssetsDisplayCurrency } from "@/components/preferences/useAssetsDisplayCurrency";
import {
  addItem,
  computeAssetsAnalytics,
  createCategory,
  deleteCategoryFromList,
  deleteItem,
  insertCategory,
  updateCategoryInList,
  updateItem,
} from "@/lib/assets-model";

export function AssetsPageContent({ userId }: { userId: string | null }) {
  const displayCurrency = useAssetsDisplayCurrency();
  const {
    snapshot,
    loadState,
    loadError,
    saveError,
    hasAnyItems,
    persistReorder,
    persistCategoryName,
    persistAddCategory,
    persistDeleteCategory,
    persistItemChange,
    persistAddItem,
    persistDeleteItem,
  } = useAssetsSupabase(userId);

  const analytics = useMemo(
    () => computeAssetsAnalytics(snapshot, displayCurrency),
    [snapshot, displayCurrency],
  );

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      const next = deleteCategoryFromList(snapshot.categories, categoryId);
      void persistDeleteCategory(next, categoryId);
    },
    [snapshot.categories, persistDeleteCategory],
  );

  const handleAddCategory = useCallback(() => {
    const newCategory = createCategory("New asset category");
    const next = [...snapshot.categories, newCategory];
    void persistAddCategory(next, newCategory);
  }, [snapshot.categories, persistAddCategory]);

  const handleAddCategoryAfter = useCallback(
    (index: number) => {
      const newCategory = createCategory("New asset category");
      const next = insertCategory(snapshot.categories, newCategory, index);
      void persistAddCategory(next, newCategory);
    },
    [snapshot.categories, persistAddCategory],
  );

  const categoriesDisabled = loadState !== "ready";

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <IconBox className="h-11 w-11 border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
          <Wallet className="h-5 w-5" strokeWidth={1.5} />
        </IconBox>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Assets</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your patrimony across currencies, asset classes, and countries.
          </p>
          {loadState === "loading" && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Loading assets…
            </p>
          )}
        </div>
      </header>

      {loadError && (
        <p
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100/95"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {loadError}
        </p>
      )}

      {saveError && (
        <p
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100/95"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {saveError}
        </p>
      )}

      {!hasAnyItems && loadState === "ready" && (
        <p className="rounded-xl border border-border-subtle bg-overlay/40 px-4 py-3 text-sm text-muted-foreground">
          Add your first asset in a category below. Summaries and charts update as you enter values.
        </p>
      )}

      <AssetsSummaryCards analytics={analytics} />

      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Asset allocation"
          subtitle={`By category · converted to ${displayCurrency}`}
          titleIcon={
            <IconBox className="border-[#f4be7e]/20 bg-[#f4be7e]/10 text-[#f4be7e]">
              <PieChart className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <PatrimonyAllocationChart
            slices={analytics.categoryAllocation}
            displayCurrency={displayCurrency}
          />
        </DashboardCard>

        <DashboardCard
          title="Currency exposure"
          subtitle={`By original currency · values in ${displayCurrency}`}
          titleIcon={
            <IconBox>
              <Wallet className="h-4 w-4" strokeWidth={1.5} />
            </IconBox>
          }
        >
          <CurrencyExposureChart
            buckets={analytics.byCurrency}
            displayCurrency={displayCurrency}
          />
        </DashboardCard>
      </section>

      <DashboardCard title="Liquidity breakdown" subtitle={`Converted to ${displayCurrency}`}>
        <LiquidityBreakdown data={analytics.liquidity} displayCurrency={displayCurrency} />
      </DashboardCard>

      <AssetRiskMetrics metrics={analytics.riskMetrics} />

      <section className={categoriesDisabled ? "pointer-events-none opacity-60" : undefined}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Asset categories</h2>
        <AssetSortableCategoryList
          categories={snapshot.categories}
          displayCurrency={displayCurrency}
          onReorder={(categories) => void persistReorder(categories)}
          onNameChange={(categoryId, name) =>
            persistCategoryName(
              categoryId,
              name,
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({ ...cat, name })),
            )
          }
          onItemChange={(categoryId, itemId, patch) =>
            persistItemChange(
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({
                ...cat,
                items: updateItem(cat.items, itemId, patch),
              })),
              categoryId,
              itemId,
              patch,
            )
          }
          onDeleteItem={(categoryId, itemId) => {
            const next = updateCategoryInList(snapshot.categories, categoryId, (cat) => ({
              ...cat,
              items: deleteItem(cat.items, itemId),
            }));
            void persistDeleteItem(next, itemId);
          }}
          onAddLine={(categoryId) => {
            const cat = snapshot.categories.find((c) => c.id === categoryId);
            if (!cat) return;
            const nextItems = addItem(cat.items, "New asset", 0, displayCurrency);
            const newItem = nextItems[nextItems.length - 1];
            if (!newItem) return;
            const next = updateCategoryInList(snapshot.categories, categoryId, (c) => ({
              ...c,
              items: nextItems,
            }));
            void persistAddItem(next, categoryId, newItem);
          }}
          onDeleteCategory={handleDeleteCategory}
          onAddCategoryAfter={handleAddCategoryAfter}
        />
        <div className="mt-5">
          <AddAssetCategoryCard onClick={handleAddCategory} />
        </div>
      </section>
    </div>
  );
}
