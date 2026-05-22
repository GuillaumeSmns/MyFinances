"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PieChart, Wallet } from "lucide-react";
import { AddAssetCategoryCard } from "@/components/dashboard/assets/AddAssetCategoryCard";
import { AssetRiskMetrics } from "@/components/dashboard/assets/AssetRiskMetrics";
import { AssetSortableCategoryList } from "@/components/dashboard/assets/AssetSortableCategoryList";
import { AssetsSummaryCards } from "@/components/dashboard/assets/AssetsSummaryCards";
import { CurrencyExposureChart } from "@/components/dashboard/assets/CurrencyExposureChart";
import { LiquidityBreakdown } from "@/components/dashboard/assets/LiquidityBreakdown";
import { PatrimonyAllocationChart } from "@/components/dashboard/assets/PatrimonyAllocationChart";
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
  type AssetCategory,
  type AssetsSnapshot,
} from "@/lib/assets-model";
import { readAssetsFromStorage, writeAssetsToStorage } from "@/lib/assets-storage";

export function AssetsPageContent() {
  const displayCurrency = useAssetsDisplayCurrency();
  const [snapshot, setSnapshot] = useState<AssetsSnapshot>(readAssetsFromStorage);

  useEffect(() => {
    writeAssetsToStorage(snapshot);
  }, [snapshot]);

  const analytics = useMemo(
    () => computeAssetsAnalytics(snapshot, displayCurrency),
    [snapshot, displayCurrency],
  );

  const setCategories = useCallback((categories: AssetCategory[]) => {
    setSnapshot((prev) => ({ ...prev, categories }));
  }, []);

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      const cat = snapshot.categories.find((c) => c.id === categoryId);
      const name = cat?.title ?? "this category";
      if (!window.confirm(`Delete "${name}" and all assets inside it? This cannot be undone.`)) {
        return;
      }
      setCategories(deleteCategoryFromList(snapshot.categories, categoryId));
    },
    [snapshot.categories, setCategories],
  );

  const handleAddCategory = useCallback(() => {
    setCategories([...snapshot.categories, createCategory("New asset category")]);
  }, [snapshot.categories, setCategories]);

  const handleAddCategoryAfter = useCallback(
    (index: number) => {
      setCategories(insertCategory(snapshot.categories, createCategory("New asset category"), index));
    },
    [snapshot.categories, setCategories],
  );

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
          <p className="mt-1 text-xs text-faint">
            Summaries and charts use {displayCurrency} (static FX conversion). Input rows keep each asset&apos;s native currency.
          </p>
        </div>
      </header>

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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Asset categories</h2>
        <AssetSortableCategoryList
          categories={snapshot.categories}
          displayCurrency={displayCurrency}
          onReorder={setCategories}
          onTitleChange={(categoryId, title) =>
            setCategories(
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({ ...cat, title })),
            )
          }
          onItemChange={(categoryId, itemId, patch) =>
            setCategories(
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({
                ...cat,
                items: updateItem(cat.items, itemId, patch),
              })),
            )
          }
          onDeleteItem={(categoryId, itemId) =>
            setCategories(
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({
                ...cat,
                items: deleteItem(cat.items, itemId),
              })),
            )
          }
          onAddLine={(categoryId) =>
            setCategories(
              updateCategoryInList(snapshot.categories, categoryId, (cat) => ({
                ...cat,
                items: addItem(cat.items, "New asset", 0, displayCurrency),
              })),
            )
          }
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
