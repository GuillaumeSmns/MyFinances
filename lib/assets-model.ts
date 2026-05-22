import type { PreferredCurrency } from "@/lib/currency";
import { isPreferredCurrency, PREFERRED_CURRENCIES } from "@/lib/currency";
import { convertCurrencyAmount } from "@/lib/currency-conversion";
import { DEFAULT_ASSETS_DISPLAY_CURRENCY } from "@/lib/assets-preferences";

export type AssetCurrency = PreferredCurrency;

export type AssetLiquidityTier = "liquid" | "semi-liquid" | "illiquid";

export type AssetItem = {
  id: string;
  name: string;
  value: number;
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
  name: string;
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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Default category shells for first-time Supabase users (no sample items). */
export const DEFAULT_ASSET_CATEGORY_SEEDS: ReadonlyArray<{
  name: string;
  templateId: AssetCategoryTemplateId;
}> = [
  { name: "Cash & Bank Accounts", templateId: "cash" },
  { name: "ETFs & Stocks", templateId: "etfs" },
  { name: "Real Estate", templateId: "real-estate" },
  { name: "Pension / Retirement Accounts", templateId: "pension" },
  { name: "Crypto", templateId: "crypto" },
  { name: "Other Assets", templateId: "other" },
];

export function inferTemplateIdFromCategoryName(
  name: string,
): AssetCategoryTemplateId | undefined {
  const normalized = name.trim().toLowerCase();
  const seed = DEFAULT_ASSET_CATEGORY_SEEDS.find((s) => s.name.toLowerCase() === normalized);
  if (seed) return seed.templateId;
  if (normalized.includes("real estate") || normalized.includes("property")) return "real-estate";
  if (normalized.includes("cash") || normalized.includes("bank")) return "cash";
  if (normalized.includes("etf") || normalized.includes("stock")) return "etfs";
  if (normalized.includes("crypto")) return "crypto";
  if (normalized.includes("pension") || normalized.includes("retirement")) return "pension";
  return undefined;
}

export function getEmptyDefaultCategories(): AssetCategory[] {
  return DEFAULT_ASSET_CATEGORY_SEEDS.map(({ name, templateId }) => ({
    id: makeAssetId(),
    name,
    templateId,
    isCustom: false,
    items: [],
  }));
}

/** Empty patrimony — categories are created in Supabase for logged-in users. */
export function getEmptyAssetsSnapshot(): AssetsSnapshot {
  return { categories: [] };
}

export function getCategoryLiquidity(category: AssetCategory): AssetLiquidityTier {
  if (category.templateId) return TEMPLATE_LIQUIDITY[category.templateId];
  const name = category.name.toLowerCase();
  if (name.includes("real estate") || name.includes("property")) return "illiquid";
  if (name.includes("cash") || name.includes("bank") || name.includes("etf") || name.includes("stock"))
    return "liquid";
  if (name.includes("crypto")) return "liquid";
  if (name.includes("pension") || name.includes("retirement")) return "semi-liquid";
  return "semi-liquid";
}

export function isInvestmentsCategory(category: AssetCategory): boolean {
  if (category.templateId === "etfs" || category.templateId === "pension") return true;
  const t = category.name.toLowerCase();
  return t.includes("etf") || t.includes("stock") || t.includes("pension") || t.includes("retirement");
}

export function isRealEstateCategory(category: AssetCategory): boolean {
  if (category.templateId === "real-estate") return true;
  const t = category.name.toLowerCase();
  return t.includes("real estate") || t.includes("property");
}

export function isLiquidCategory(category: AssetCategory): boolean {
  const tier = getCategoryLiquidity(category);
  return tier === "liquid";
}

export function sumItems(items: AssetItem[]): number {
  return items.reduce((acc, item) => acc + (Number.isFinite(item.value) ? item.value : 0), 0);
}

export function convertItemAmount(item: AssetItem, displayCurrency: PreferredCurrency): number {
  return convertCurrencyAmount(item.value, item.currency, displayCurrency);
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
      out[item.currency] += Number.isFinite(item.value) ? item.value : 0;
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

/** @deprecated Demo patrimony removed — use {@link getEmptyAssetsSnapshot}. */
export function getDefaultAssetsSnapshot(): AssetsSnapshot {
  return getEmptyAssetsSnapshot();
}

function readItemName(raw: Record<string, unknown>): string | null {
  if (typeof raw.name === "string") return raw.name;
  if (typeof raw.label === "string") return raw.label;
  return null;
}

function readItemValue(raw: Record<string, unknown>): number | null {
  if (typeof raw.value === "number" && Number.isFinite(raw.value)) return raw.value;
  if (typeof raw.amount === "number" && Number.isFinite(raw.amount)) return raw.amount;
  return null;
}

function readCategoryName(raw: Record<string, unknown>): string | null {
  if (typeof raw.name === "string") return raw.name;
  if (typeof raw.title === "string") return raw.title;
  return null;
}

function normalizeItemFromRaw(raw: unknown): AssetItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : null;
  const name = readItemName(item);
  const value = readItemValue(item);
  const currency = item.currency;
  if (!id || !name || value === null || !isPreferredCurrency(String(currency))) return null;
  return {
    id,
    name: name.trim() || "Untitled asset",
    value,
    currency: currency as AssetCurrency,
    country: typeof item.country === "string" ? item.country : "",
    notes: typeof item.notes === "string" ? item.notes : "",
  };
}

function normalizeCategoryFromRaw(raw: unknown): AssetCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const id = typeof c.id === "string" ? c.id : null;
  const name = readCategoryName(c);
  if (!id || !name || !Array.isArray(c.items)) return null;
  const items = c.items
    .map(normalizeItemFromRaw)
    .filter((item): item is AssetItem => item !== null);
  const categoryName = name.trim() || "Untitled";
  return {
    id,
    name: categoryName,
    templateId:
      (c.templateId as AssetCategoryTemplateId | undefined) ??
      inferTemplateIdFromCategoryName(categoryName),
    isCustom: Boolean(c.isCustom),
    items,
  };
}

function mapCategoriesFromRaw(categoriesRaw: unknown[]): AssetCategory[] {
  return categoriesRaw
    .map(normalizeCategoryFromRaw)
    .filter((c): c is AssetCategory => c !== null);
}

/** Parse stored JSON without injecting demo defaults (for import). */
export function parseAssetsSnapshot(raw: unknown): AssetsSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.categories)) return null;
  const categories = mapCategoriesFromRaw(record.categories);
  if (categories.length === 0) return null;
  return {
    categories,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
}

export function normalizeAssetsSnapshot(raw: unknown): AssetsSnapshot {
  const parsed = parseAssetsSnapshot(raw);
  if (parsed) return parsed;
  return getEmptyAssetsSnapshot();
}

export function createCategory(name = "New category"): AssetCategory {
  return { id: makeAssetId(), name, isCustom: true, items: [] };
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

export function addItem(
  items: AssetItem[],
  name = "New asset",
  value = 0,
  currency: AssetCurrency = "USD",
): AssetItem[] {
  return [...items, { id: makeAssetId(), name, value, currency, country: "", notes: "" }];
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
        name: cat.name,
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

  const maxCategoryShare =
    categoryAllocation.length > 0
      ? Math.max(...categoryAllocation.map((s) => s.percent), 0)
      : 0;
  const assetConcentrationScore = clampScore(
    maxCategoryShare > 50 ? 35 + (maxCategoryShare - 50) * 1.3 : maxCategoryShare * 0.6,
  );

  const liquidityRiskScore = clampScore(
    liquidity.illiquidPercent > 50 ? 30 + (liquidity.illiquidPercent - 50) * 1.4 : liquidity.illiquidPercent * 0.5,
  );

  const cryptoCat = snapshot.categories.find(
    (c) => c.templateId === "crypto" || inferTemplateIdFromCategoryName(c.name) === "crypto",
  );
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
