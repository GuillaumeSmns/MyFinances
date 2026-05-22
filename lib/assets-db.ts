import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_ASSET_CATEGORY_SEEDS,
  inferTemplateIdFromCategoryName,
  type AssetCategory,
  type AssetCurrency,
  type AssetItem,
  type AssetsSnapshot,
} from "@/lib/assets-model";
import { isPreferredCurrency } from "@/lib/currency";

/**
 * Supabase schema (authoritative).
 *
 * asset_categories: id, user_id, name, sort_order, created_at, updated_at
 * asset_items: id, user_id, category_id, name, value, currency, country, notes, created_at, updated_at
 */

export type AssetCategoryRow = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type AssetItemRow = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  value: number;
  currency: string;
  country: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AssetCategoryInsertPayload = Omit<
  AssetCategoryRow,
  "id" | "created_at" | "updated_at"
>;

export type AssetItemInsertPayload = Omit<AssetItemRow, "id" | "created_at" | "updated_at">;

export type AssetCategoryUpdatePatch = Partial<Pick<AssetCategoryRow, "name">>;

export type AssetItemUpdatePatch = Partial<
  Pick<AssetItemRow, "name" | "value" | "currency" | "country" | "notes">
>;

const CATEGORY_COLUMNS = "id, user_id, name, sort_order, created_at, updated_at";

const ITEM_COLUMNS =
  "id, user_id, category_id, name, value, currency, country, notes, created_at, updated_at";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function formatSupabaseError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const parts = [e.message, e.details, e.hint, e.code ? `(${e.code})` : undefined].filter(
      (p): p is string => Boolean(p && p.trim()),
    );
    if (parts.length > 0) return parts.join(" — ");
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function logSupabaseError(context: string, error: unknown): void {
  console.error(`[Assets Supabase] ${context}`, error);
  if (error && typeof error === "object") {
    const e = error as { message?: string; details?: string; hint?: string; code?: string };
    if (e.message) console.error(`[Assets Supabase] ${context} message:`, e.message);
    if (e.details) console.error(`[Assets Supabase] ${context} details:`, e.details);
    if (e.hint) console.error(`[Assets Supabase] ${context} hint:`, e.hint);
    if (e.code) console.error(`[Assets Supabase] ${context} code:`, e.code);
  }
}

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function parseCurrency(value: unknown): AssetCurrency {
  return typeof value === "string" && isPreferredCurrency(value) ? value : "USD";
}

function parseNumeric(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function categoryToInsertPayload(
  category: AssetCategory,
  userId: string,
  sortOrder: number,
): AssetCategoryInsertPayload {
  return {
    user_id: userId,
    name: category.name.trim() || "Untitled",
    sort_order: sortOrder,
  };
}

function itemToInsertPayload(
  item: AssetItem,
  userId: string,
  categoryId: string,
): AssetItemInsertPayload {
  return {
    user_id: userId,
    category_id: categoryId,
    name: item.name.trim() || "Untitled asset",
    value: parseNumeric(item.value),
    currency: item.currency,
    country: item.country ?? "",
    notes: item.notes ?? "",
  };
}

function rowToCategory(row: AssetCategoryRow, items: AssetItem[]): AssetCategory {
  const name = row.name.trim() || "Untitled";
  return {
    id: row.id,
    name,
    templateId: inferTemplateIdFromCategoryName(name),
    isCustom: !DEFAULT_ASSET_CATEGORY_SEEDS.some(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    ),
    items,
  };
}

function rowToItem(row: AssetItemRow): AssetItem {
  return {
    id: row.id,
    name: row.name.trim() || "Untitled asset",
    value: parseNumeric(row.value),
    currency: parseCurrency(row.currency),
    country: row.country ?? "",
    notes: row.notes ?? "",
  };
}

function parseCategoryRow(raw: unknown): AssetCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.user_id !== "string") return null;
  return {
    id: row.id,
    user_id: row.user_id,
    name: typeof row.name === "string" ? row.name : "Untitled",
    sort_order: parseNumeric(row.sort_order),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function parseItemRow(raw: unknown): AssetItemRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.category_id !== "string") return null;
  return {
    id: row.id,
    user_id: String(row.user_id),
    category_id: row.category_id,
    name: typeof row.name === "string" ? row.name : "",
    value: parseNumeric(row.value),
    currency: typeof row.currency === "string" ? row.currency : "USD",
    country: typeof row.country === "string" ? row.country : "",
    notes: typeof row.notes === "string" ? row.notes : "",
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function compareByCreatedAt(a: AssetItemRow, b: AssetItemRow): number {
  const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
  const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
  return aTime - bTime;
}

function snapshotFromRows(categoryRows: AssetCategoryRow[], itemRows: AssetItemRow[]): AssetsSnapshot {
  const itemsByCategory = new Map<string, AssetItem[]>();
  for (const row of [...itemRows].sort(compareByCreatedAt)) {
    const list = itemsByCategory.get(row.category_id) ?? [];
    list.push(rowToItem(row));
    itemsByCategory.set(row.category_id, list);
  }

  const categories = [...categoryRows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => rowToCategory(row, itemsByCategory.get(row.id) ?? []));

  return { categories, updatedAt: new Date().toISOString() };
}

export async function fetchUserAssets(
  supabase: SupabaseClient,
  userId: string,
): Promise<AssetsSnapshot> {
  const { data: categoryRows, error: catError } = await supabase
    .from("asset_categories")
    .select(CATEGORY_COLUMNS)
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (catError) {
    logSupabaseError("fetch categories", catError);
    throw catError;
  }

  if (!categoryRows?.length) {
    return { categories: [], updatedAt: new Date().toISOString() };
  }

  const categories = categoryRows
    .map(parseCategoryRow)
    .filter((r): r is AssetCategoryRow => r !== null);

  const categoryIds = categories.map((c) => c.id);

  const { data: itemRows, error: itemError } = await supabase
    .from("asset_items")
    .select(ITEM_COLUMNS)
    .eq("user_id", userId)
    .in("category_id", categoryIds)
    .order("created_at", { ascending: true });

  if (itemError) {
    logSupabaseError("fetch items", itemError);
    throw itemError;
  }

  const items = (itemRows ?? [])
    .map(parseItemRow)
    .filter((r): r is AssetItemRow => r !== null);

  return snapshotFromRows(categories, items);
}

/** Create default empty category shells in Supabase (no asset_items). */
export async function seedDefaultCategories(
  supabase: SupabaseClient,
  userId: string,
): Promise<AssetsSnapshot> {
  const inserts: AssetCategoryInsertPayload[] = DEFAULT_ASSET_CATEGORY_SEEDS.map((seed, index) => ({
    user_id: userId,
    name: seed.name,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("asset_categories")
    .insert(inserts)
    .select(CATEGORY_COLUMNS);

  if (error) {
    logSupabaseError("seed categories", error);
    throw error;
  }

  const categories = (data ?? [])
    .map(parseCategoryRow)
    .filter((r): r is AssetCategoryRow => r !== null);

  return snapshotFromRows(categories, []);
}

export async function ensureUserAssets(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ snapshot: AssetsSnapshot; isNew: boolean }> {
  const snapshot = await fetchUserAssets(supabase, userId);
  if (snapshot.categories.length > 0) {
    return { snapshot, isNew: false };
  }

  const seeded = await seedDefaultCategories(supabase, userId);
  return { snapshot: seeded, isNew: true };
}

export async function createCategoryInDb(
  supabase: SupabaseClient,
  userId: string,
  category: AssetCategory,
  sortOrder: number,
): Promise<void> {
  const payload = categoryToInsertPayload(category, userId, sortOrder);
  const insertPayload = isValidUuid(category.id) ? { id: category.id, ...payload } : payload;

  const { error } = await supabase.from("asset_categories").insert(insertPayload);
  if (error) {
    logSupabaseError("create category", error);
    throw error;
  }
}

export async function updateCategoryInDb(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  patch: AssetCategoryUpdatePatch,
): Promise<void> {
  if (patch.name === undefined) return;

  const { error } = await supabase
    .from("asset_categories")
    .update({ name: patch.name.trim() || "Untitled" })
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    logSupabaseError("update category", error);
    throw error;
  }
}

export async function deleteCategoryInDb(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
): Promise<void> {
  const { error: itemsError } = await supabase
    .from("asset_items")
    .delete()
    .eq("category_id", categoryId)
    .eq("user_id", userId);

  if (itemsError) {
    logSupabaseError("delete category items", itemsError);
    throw itemsError;
  }

  const { error } = await supabase
    .from("asset_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    logSupabaseError("delete category", error);
    throw error;
  }
}

export async function syncCategorySortOrders(
  supabase: SupabaseClient,
  userId: string,
  categories: AssetCategory[],
): Promise<void> {
  const results = await Promise.all(
    categories.map((cat, index) =>
      supabase
        .from("asset_categories")
        .update({ sort_order: index })
        .eq("id", cat.id)
        .eq("user_id", userId),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    logSupabaseError("sync category sort_order", failed.error);
    throw failed.error;
  }
}

export async function createItemInDb(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  item: AssetItem,
): Promise<void> {
  const payload = itemToInsertPayload(item, userId, categoryId);
  const insertPayload = isValidUuid(item.id) ? { id: item.id, ...payload } : payload;

  const { error } = await supabase.from("asset_items").insert(insertPayload);
  if (error) {
    logSupabaseError("create item", error);
    throw error;
  }
}

export async function updateItemInDb(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
  patch: AssetItemUpdatePatch,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase
    .from("asset_items")
    .update(patch)
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) {
    logSupabaseError("update item", error);
    throw error;
  }
}

export async function deleteItemInDb(
  supabase: SupabaseClient,
  userId: string,
  itemId: string,
): Promise<void> {
  const { error } = await supabase.from("asset_items").delete().eq("id", itemId).eq("user_id", userId);

  if (error) {
    logSupabaseError("delete item", error);
    throw error;
  }
}
