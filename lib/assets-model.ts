import type { PreferredCurrency } from "@/lib/currency";
import { PREFERRED_CURRENCIES } from "@/lib/currency";
import { convertCurrencyAmount } from "@/lib/currency-conversion";
import { DEFAULT_ASSETS_DISPLAY_CURRENCY } from "@/lib/assets-preferences";

export type AssetCurrency = PreferredCurrency;

export type AssetLiquidityTier = "liquid" | "semi-liquid" | "illiquid";

export type AssetItem = {
  id: string;
  label: string;
  amount: number;
  currency: AssetCurrency;
  country?: string;
  notes?: string;
};

export type AssetCategoryTemplateId =
  | "cash"
  | "etfs"
  | "real-estate"
  | "pension"
  | "crypto"
  | "other";

export type AssetCategory = {
  id: string;
  title: string;
  templateId?: AssetCategoryTemplateId;
  isCustom?: boolean;
  items: AssetItem[];
};

export type AssetsSnapshot = {
  categories: AssetCategory[];
  updatedAt?: string;
};

export type CurrencyBucket = {
  currency: AssetCurrency;
  total: number;
  percent: number;
};

export type CategoryAllocationSlice = {
  name: string;
  value: number;
  percent: number;
};

export type LiquidityBreakdown = {
  liquid: number;
  semiLiquid: number;
  illiquid: number;
  liquidPercent: number;
  semiLiquidPercent: number;
  illiquidPercent: number;
};

export type RiskLevel = "Low" | "Moderate" | "High";

export type RiskMetric = {
  id: string;
  label: string;
  score: number;
  level: RiskLevel;
  explanation: string;
};

export type AssetsAnalytics = {
  /** Grand total in Assets display currency */
  totalConverted: number;
  displayCurrency: PreferredCurrency;
  liquidTotal: number;
  realEstateTotal: number;
  investmentsTotal: number;
  byCurrency: CurrencyBucket[];
  categoryAllocation: CategoryAllocationSlice[];
  liquidity: LiquidityBreakdown;
  currencyRiskScore: number;
  diversificationScore: number;
  riskMetrics: RiskMetric[];
};

const TEMPLATE_LIQUIDITY: Record<AssetCategoryTemplateId, AssetLiquidityTier> = {
  cash: "liquid",
  etfs: "liquid",
  "real-estate": "illiquid",
  pension: "semi-liquid",
  crypto: "liquid",
  other: "semi-liquid",
};

const ALLOCATION_COLORS = [
  "#f4be7e",
  "#39bdf8",
  "#9cb8a8",
  "#c9a06a",
  "#b5a99a",
  "#8aa899",
  "#67e8f9",
  "#d4a46a",
];

export function makeAssetId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCategoryLiquidity(category: AssetCategory): AssetLiquidityTier {
  if (category.templateId) return TEMPLATE_LIQUIDITY[category.templateId];
  const title = category.title.toLowerCase();
  if (title.includes("real estate") || title.includes("property")) return "illiquid";
  if (title.includes("cash") || title.includes("bank") || title.includes("etf") || title.includes("stock"))
    return "liquid";
  if (title.includes("crypto")) return "liquid";
  if (title.includes("pension") || title.includes("retirement")) return "semi-liquid";
  return "semi-liquid";
}

export function isInvestmentsCategory(category: AssetCategory): boolean {
  if (category.templateId === "etfs" || category.templateId === "pension") return true;
  const t = category.title.toLowerCase();
  return t.includes("etf") || t.includes("stock") || t.includes("pension") || t.includes("retirement");
}

export function isRealEstateCategory(category: AssetCategory): boolean {
  if (category.templateId === "real-estate") return true;
  const t = category.title.toLowerCase();
  return t.includes("real estate") || t.includes("property");
}

export function isLiquidCategory(category: AssetCategory): boolean {
  const tier = getCategoryLiquidity(category);
  return tier === "liquid";
}

export function sumItems(items: AssetItem[]): number {
  return items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function convertItemAmount(item: AssetItem, displayCurrency: PreferredCurrency): number {
  return convertCurrencyAmount(item.amount, item.currency, displayCurrency);
}

export function sumItemsConverted(items: AssetItem[], displayCurrency: PreferredCurrency): number {
  return items.reduce((acc, item) => acc + convertItemAmount(item, displayCurrency), 0);
}

export function sumCategory(category: AssetCategory): number {
  return sumItems(category.items);
}

export function sumCategoryConverted(
  category: AssetCategory,
  displayCurrency: PreferredCurrency,
): number {
  return sumItemsConverted(category.items, displayCurrency);
}

export function sumCategories(categories: AssetCategory[]): number {
  return categories.reduce((acc, cat) => acc + sumCategory(cat), 0);
}

export function sumByCurrency(items: AssetItem[]): Record<AssetCurrency, number> {
  const out: Record<AssetCurrency, number> = { USD: 0, EUR: 0, AED: 0 };
  for (const item of items) {
    if (PREFERRED_CURRENCIES.includes(item.currency)) {
      out[item.currency] += Number.isFinite(item.amount) ? item.amount : 0;
    }
  }
  return out;
}

/** Native currency keys; values converted to display currency (for exposure chart). */
export function sumByCurrencyConverted(
  items: AssetItem[],
  displayCurrency: PreferredCurrency,
): Record<AssetCurrency, number> {
  const out: Record<AssetCurrency, number> = { USD: 0, EUR: 0, AED: 0 };
  for (const item of items) {
    if (PREFERRED_CURRENCIES.includes(item.currency)) {
      out[item.currency] += convertItemAmount(item, displayCurrency);
    }
  }
  return out;
}

export function mergeCurrencyTotals(
  a: Record<AssetCurrency, number>,
  b: Record<AssetCurrency, number>,
): Record<AssetCurrency, number> {
  return {
    USD: a.USD + b.USD,
    EUR: a.EUR + b.EUR,
    AED: a.AED + b.AED,
  };
}

export function formatCurrencyBreakdown(totals: Record<AssetCurrency, number>): string {
  return PREFERRED_CURRENCIES.filter((c) => totals[c] > 0)
    .map((c) => `${c} ${totals[c].toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
    .join(" · ");
}

function category(id: string, title: string, templateId: AssetCategoryTemplateId, items: AssetItem[] = []): AssetCategory {
  return { id, title, templateId, isCustom: false, items };
}

export function getDefaultAssetsSnapshot(): AssetsSnapshot {
  return {
    categories: [
      category("cat-cash", "Cash & Bank Accounts", "cash", [
        { id: makeAssetId(), label: "UAE current account", amount: 45_000, currency: "AED", country: "UAE" },
        { id: makeAssetId(), label: "US savings", amount: 12_000, currency: "USD", country: "USA" },
      ]),
      category("cat-etfs", "ETFs & Stocks", "etfs", [
        { id: makeAssetId(), label: "Global ETF portfolio", amount: 185_000, currency: "USD", country: "USA" },
        { id: makeAssetId(), label: "EU equities", amount: 42_000, currency: "EUR", country: "France" },
      ]),
      category("cat-realestate", "Real Estate", "real-estate", [
        { id: makeAssetId(), label: "Dubai apartment", amount: 850_000, currency: "AED", country: "UAE" },
      ]),
      category("cat-pension", "Pension / Retirement Accounts", "pension", [
        { id: makeAssetId(), label: "Employer pension", amount: 78_000, currency: "EUR", country: "France" },
      ]),
      category("cat-crypto", "Crypto", "crypto", [
        { id: makeAssetId(), label: "Cold wallet", amount: 18_500, currency: "USD" },
      ]),
      category("cat-other", "Other Assets", "other", [
        { id: makeAssetId(), label: "Collectibles", amount: 9_000, currency: "EUR" },
      ]),
    ],
    updatedAt: new Date().toISOString(),
  };
}

function isValidItem(raw: unknown): raw is AssetItem {
  if (!raw || typeof raw !== "object") return false;
  const item = raw as AssetItem;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.amount === "number" &&
    PREFERRED_CURRENCIES.includes(item.currency as AssetCurrency)
  );
}

function isValidCategory(raw: unknown): raw is AssetCategory {
  if (!raw || typeof raw !== "object") return false;
  const c = raw as AssetCategory;
  return typeof c.id === "string" && typeof c.title === "string" && Array.isArray(c.items);
}

export function normalizeAssetsSnapshot(raw: unknown): AssetsSnapshot {
  const defaults = getDefaultAssetsSnapshot();
  if (!raw || typeof raw !== "object") return defaults;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.categories)) return defaults;

  const categories = record.categories
    .filter(isValidCategory)
    .map((c) => ({
      id: c.id,
      title: c.title.trim() || "Untitled",
      templateId: c.templateId,
      isCustom: Boolean(c.isCustom),
      items: c.items.filter(isValidItem).map((item) => ({
        ...item,
        label: item.label.trim() || "Untitled asset",
        country: typeof item.country === "string" ? item.country : "",
        notes: typeof item.notes === "string" ? item.notes : "",
      })),
    }));

  return {
    categories: categories.length > 0 ? categories : defaults.categories,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
}

export function createCategory(title = "New category"): AssetCategory {
  return { id: makeAssetId(), title, isCustom: true, items: [] };
}

export function reorderCategoriesByIds(
  categories: AssetCategory[],
  activeId: string,
  overId: string,
): AssetCategory[] {
  const oldIndex = categories.findIndex((c) => c.id === activeId);
  const newIndex = categories.findIndex((c) => c.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return categories;
  const next = [...categories];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next;
}

export function updateCategoryInList(
  categories: AssetCategory[],
  categoryId: string,
  updater: (cat: AssetCategory) => AssetCategory,
): AssetCategory[] {
  return categories.map((cat) => (cat.id === categoryId ? updater(cat) : cat));
}

export function deleteCategoryFromList(categories: AssetCategory[], categoryId: string): AssetCategory[] {
  return categories.filter((cat) => cat.id !== categoryId);
}

export function insertCategory(
  categories: AssetCategory[],
  newCategory: AssetCategory,
  afterIndex?: number,
): AssetCategory[] {
  if (afterIndex === undefined || afterIndex < 0 || afterIndex >= categories.length) {
    return [...categories, newCategory];
  }
  const next = [...categories];
  next.splice(afterIndex + 1, 0, newCategory);
  return next;
}

export function addItem(items: AssetItem[], label = "New asset", amount = 0, currency: AssetCurrency = "USD"): AssetItem[] {
  return [...items, { id: makeAssetId(), label, amount, currency, country: "", notes: "" }];
}

export function updateItem(
  items: AssetItem[],
  itemId: string,
  patch: Partial<Omit<AssetItem, "id">>,
): AssetItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
}

export function deleteItem(items: AssetItem[], itemId: string): AssetItem[] {
  return items.filter((item) => item.id !== itemId);
}

function riskLevelFromScore(score: number, invert = false): RiskLevel {
  const s = invert ? 100 - score : score;
  if (s < 34) return "Low";
  if (s < 67) return "Moderate";
  return "High";
}

function clampScore(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

export function computeAssetsAnalytics(
  snapshot: AssetsSnapshot,
  displayCurrency: PreferredCurrency = DEFAULT_ASSETS_DISPLAY_CURRENCY,
): AssetsAnalytics {
  const allItems = snapshot.categories.flatMap((c) => c.items);
  const totalConverted = sumItemsConverted(allItems, displayCurrency);

  let liquidTotal = 0;
  let realEstateTotal = 0;
  let investmentsTotal = 0;
  const currencyTotals: Record<AssetCurrency, number> = { USD: 0, EUR: 0, AED: 0 };

  for (const cat of snapshot.categories) {
    const catSum = sumCategoryConverted(cat, displayCurrency);
    const catCurrency = sumByCurrencyConverted(cat.items, displayCurrency);
    for (const c of PREFERRED_CURRENCIES) currencyTotals[c] += catCurrency[c];

    if (isLiquidCategory(cat)) liquidTotal += catSum;
    if (isRealEstateCategory(cat)) realEstateTotal += catSum;
    if (isInvestmentsCategory(cat)) investmentsTotal += catSum;
  }

  const byCurrency: CurrencyBucket[] = PREFERRED_CURRENCIES.map((currency) => ({
    currency,
    total: currencyTotals[currency],
    percent: totalConverted > 0 ? (currencyTotals[currency] / totalConverted) * 100 : 0,
  })).filter((b) => b.total > 0);

  const categoryAllocation: CategoryAllocationSlice[] = snapshot.categories
    .map((cat) => {
      const value = sumCategoryConverted(cat, displayCurrency);
      return {
        name: cat.title,
        value,
        percent: totalConverted > 0 ? (value / totalConverted) * 100 : 0,
      };
    })
    .filter((s) => s.value > 0);

  let liquid = 0;
  let semiLiquid = 0;
  let illiquid = 0;
  for (const cat of snapshot.categories) {
    const tier = getCategoryLiquidity(cat);
    const v = sumCategoryConverted(cat, displayCurrency);
    if (tier === "liquid") liquid += v;
    else if (tier === "illiquid") illiquid += v;
    else semiLiquid += v;
  }

  const liquidity: LiquidityBreakdown = {
    liquid,
    semiLiquid,
    illiquid,
    liquidPercent: totalConverted > 0 ? (liquid / totalConverted) * 100 : 0,
    semiLiquidPercent: totalConverted > 0 ? (semiLiquid / totalConverted) * 100 : 0,
    illiquidPercent: totalConverted > 0 ? (illiquid / totalConverted) * 100 : 0,
  };

  const maxCurrencyShare = Math.max(...byCurrency.map((b) => b.percent), 0);
  const currencyRiskScore = clampScore(maxCurrencyShare > 60 ? 40 + (maxCurrencyShare - 60) * 1.5 : maxCurrencyShare * 0.5);

  const maxCategoryShare = Math.max(...categoryAllocation.map((s) => s.percent), 0);
  const assetConcentrationScore = clampScore(
    maxCategoryShare > 50 ? 35 + (maxCategoryShare - 50) * 1.3 : maxCategoryShare * 0.6,
  );

  const liquidityRiskScore = clampScore(
    liquidity.illiquidPercent > 50 ? 30 + (liquidity.illiquidPercent - 50) * 1.4 : liquidity.illiquidPercent * 0.5,
  );

  const cryptoCat = snapshot.categories.find((c) => c.templateId === "crypto");
  const cryptoTotal = cryptoCat ? sumCategoryConverted(cryptoCat, displayCurrency) : 0;
  const cryptoPercent = totalConverted > 0 ? (cryptoTotal / totalConverted) * 100 : 0;
  const cryptoRiskScore = clampScore(cryptoPercent > 10 ? 25 + (cryptoPercent - 10) * 2.5 : cryptoPercent * 1.2);

  const realEstatePercent = totalConverted > 0 ? (realEstateTotal / totalConverted) * 100 : 0;
  const realEstateRiskScore = clampScore(
    realEstatePercent > 45 ? 30 + (realEstatePercent - 45) * 1.2 : realEstatePercent * 0.55,
  );

  const categoryCount = categoryAllocation.length;
  const currencyCount = byCurrency.length;
  const diversificationScore = clampScore(
    Math.min(100, categoryCount * 14 + currencyCount * 18 + (100 - maxCategoryShare) * 0.35 + (100 - maxCurrencyShare) * 0.25),
  );

  const riskMetrics: RiskMetric[] = [
    {
      id: "currency",
      label: "Currency concentration risk",
      score: currencyRiskScore,
      level: riskLevelFromScore(currencyRiskScore),
      explanation:
        maxCurrencyShare > 60
          ? `One currency represents ${maxCurrencyShare.toFixed(0)}% of patrimony in ${displayCurrency} (above 60%).`
          : `Largest currency share is ${maxCurrencyShare.toFixed(0)}% of total (${displayCurrency}).`,
    },
    {
      id: "asset",
      label: "Asset concentration risk",
      score: assetConcentrationScore,
      level: riskLevelFromScore(assetConcentrationScore),
      explanation:
        maxCategoryShare > 50
          ? `Largest category is ${maxCategoryShare.toFixed(0)}% of assets (above 50%).`
          : `Largest category holds ${maxCategoryShare.toFixed(0)}% of total assets (${displayCurrency}).`,
    },
    {
      id: "liquidity",
      label: "Liquidity risk",
      score: liquidityRiskScore,
      level: riskLevelFromScore(liquidityRiskScore),
      explanation:
        liquidity.illiquidPercent > 50
          ? `Illiquid assets are ${liquidity.illiquidPercent.toFixed(0)}% of patrimony (above 50%).`
          : `Illiquid share is ${liquidity.illiquidPercent.toFixed(0)}% of total assets.`,
    },
    {
      id: "crypto",
      label: "Crypto exposure risk",
      score: cryptoRiskScore,
      level: riskLevelFromScore(cryptoRiskScore),
      explanation:
        cryptoPercent > 10
          ? `Crypto is ${cryptoPercent.toFixed(0)}% of assets (above 10% guideline).`
          : cryptoPercent > 0
            ? `Crypto represents ${cryptoPercent.toFixed(0)}% of total assets (${displayCurrency}).`
            : "No crypto assets recorded.",
    },
    {
      id: "realestate",
      label: "Real estate concentration risk",
      score: realEstateRiskScore,
      level: riskLevelFromScore(realEstateRiskScore),
      explanation:
        realEstatePercent > 45
          ? `Real estate is ${realEstatePercent.toFixed(0)}% of patrimony.`
          : realEstatePercent > 0
            ? `Real estate represents ${realEstatePercent.toFixed(0)}% of assets.`
            : "No real estate recorded.",
    },
    {
      id: "diversification",
      label: "Diversification score",
      score: diversificationScore,
      level: riskLevelFromScore(diversificationScore, true),
      explanation: `Spread across ${categoryCount} categories and ${currencyCount} currencies (higher is better).`,
    },
  ];

  return {
    totalConverted,
    displayCurrency,
    liquidTotal,
    realEstateTotal,
    investmentsTotal,
    byCurrency,
    categoryAllocation,
    liquidity,
    currencyRiskScore,
    diversificationScore,
    riskMetrics,
  };
}

export function categoryAllocationChartData(
  slices: CategoryAllocationSlice[],
): { name: string; value: number; color: string }[] {
  return slices.map((s, i) => ({
    name: s.name,
    value: s.value,
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]!,
  }));
}

export const CURRENCY_CHART_COLORS: Record<AssetCurrency, string> = {
  USD: "#39bdf8",
  EUR: "#f4be7e",
  AED: "#e879f9",
};
