import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinanceItem } from "@/components/dashboard/types";
import {
  computeBudgetTotals,
  STARTER_BUDGET_CATEGORY_SEEDS,
  TAB_TO_CATEGORY_TYPE,
  type BudgetCategory,
  type BudgetCategoryType,
  type BudgetTabId,
  type JournalMonthSnapshot,
} from "@/lib/budget-model";
import { formatMonthLabel } from "@/lib/journal-storage";

/**
 * Supabase schema (authoritative).
 *
 * budget_months: id, user_id, month_key, month_label, created_at, updated_at
 * budget_categories: id, user_id, budget_month_id, name, type, sort_order, created_at, updated_at
 * budget_items: id, user_id, budget_month_id, category_id, label, amount, sort_order, created_at, updated_at
 */

export type BudgetMonthRow = {
  id: string;
  user_id: string;
  month_key: string;
  month_label: string;
  created_at?: string;
  updated_at?: string;
};

export type BudgetCategoryRow = {
  id: string;
  user_id: string;
  budget_month_id: string;
  name: string;
  type: BudgetCategoryType;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type BudgetItemRow = {
  id: string;
  user_id: string;
  budget_month_id: string;
  category_id: string;
  label: string;
  amount: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type BudgetMonthSummary = {
  monthKey: string;
  monthId: string;
  revenue: number;
  expenses: number;
  surplus: number;
};

const MONTH_COLUMNS = "id, user_id, month_key, month_label, created_at, updated_at";
const CATEGORY_COLUMNS =
  "id, user_id, budget_month_id, name, type, sort_order, created_at, updated_at";
const ITEM_COLUMNS =
  "id, user_id, budget_month_id, category_id, label, amount, sort_order, created_at, updated_at";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TAB_ORDER: BudgetTabId[] = ["revenues", "investments", "expenses"];

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
  console.error(`[Budget Supabase] ${context}`, error);
  if (error && typeof error === "object") {
    const e = error as { message?: string; details?: string; hint?: string; code?: string };
    if (e.message) console.error(`[Budget Supabase] ${context} message:`, e.message);
    if (e.details) console.error(`[Budget Supabase] ${context} details:`, e.details);
    if (e.hint) console.error(`[Budget Supabase] ${context} hint:`, e.hint);
    if (e.code) console.error(`[Budget Supabase] ${context} code:`, e.code);
  }
}

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function parseNumeric(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseCategoryType(value: unknown): BudgetCategoryType | null {
  if (value === "revenue" || value === "investment" || value === "expense") return value;
  return null;
}

function parseMonthRow(raw: unknown): BudgetMonthRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.month_key !== "string") return null;
  return {
    id: row.id,
    user_id: String(row.user_id),
    month_key: row.month_key,
    month_label: typeof row.month_label === "string" ? row.month_label : row.month_key,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function parseCategoryRow(raw: unknown): BudgetCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const type = parseCategoryType(row.type);
  if (typeof row.id !== "string" || !type) return null;
  return {
    id: row.id,
    user_id: String(row.user_id),
    budget_month_id: String(row.budget_month_id),
    name: typeof row.name === "string" ? row.name : "Untitled",
    type,
    sort_order: parseNumeric(row.sort_order),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function parseItemRow(raw: unknown): BudgetItemRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.category_id !== "string") return null;
  return {
    id: row.id,
    user_id: String(row.user_id),
    budget_month_id: String(row.budget_month_id),
    category_id: row.category_id,
    label: typeof row.label === "string" ? row.label : "",
    amount: parseNumeric(row.amount),
    sort_order: parseNumeric(row.sort_order),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function rowToItem(row: BudgetItemRow): FinanceItem {
  return {
    id: row.id,
    label: row.label.trim() || "Untitled",
    amount: parseNumeric(row.amount),
  };
}

function rowToCategory(row: BudgetCategoryRow, items: FinanceItem[]): BudgetCategory {
  return {
    id: row.id,
    title: row.name.trim() || "Untitled",
    items,
  };
}

function snapshotFromMonth(
  month: BudgetMonthRow,
  categoryRows: BudgetCategoryRow[],
  itemRows: BudgetItemRow[],
): JournalMonthSnapshot {
  const itemsByCategory = new Map<string, FinanceItem[]>();
  for (const row of [...itemRows].sort((a, b) => a.sort_order - b.sort_order)) {
    const list = itemsByCategory.get(row.category_id) ?? [];
    list.push(rowToItem(row));
    itemsByCategory.set(row.category_id, list);
  }

  const snapshot: JournalMonthSnapshot = {
    monthId: month.id,
    revenues: [],
    investments: [],
    expenses: [],
    savedAt: month.updated_at ?? month.created_at,
  };

  for (const row of [...categoryRows].sort((a, b) => a.sort_order - b.sort_order)) {
    const cat = rowToCategory(row, itemsByCategory.get(row.id) ?? []);
    if (row.type === "revenue") snapshot.revenues.push(cat);
    else if (row.type === "investment") snapshot.investments.push(cat);
    else snapshot.expenses.push(cat);
  }

  return snapshot;
}

function emptySnapshot(): JournalMonthSnapshot {
  return { revenues: [], investments: [], expenses: [] };
}

export async function listBudgetMonthRows(
  supabase: SupabaseClient,
  userId: string,
): Promise<BudgetMonthRow[]> {
  const { data, error } = await supabase
    .from("budget_months")
    .select(MONTH_COLUMNS)
    .eq("user_id", userId)
    .order("month_key", { ascending: true });

  if (error) {
    logSupabaseError("list months", error);
    throw error;
  }

  return (data ?? []).map(parseMonthRow).filter((r): r is BudgetMonthRow => r !== null);
}

export async function fetchBudgetMonthByKey(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string,
): Promise<JournalMonthSnapshot | null> {
  const { data: monthData, error: monthError } = await supabase
    .from("budget_months")
    .select(MONTH_COLUMNS)
    .eq("user_id", userId)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (monthError) {
    logSupabaseError("fetch month", monthError);
    throw monthError;
  }

  const month = parseMonthRow(monthData);
  if (!month) return null;

  const { data: categoryRows, error: catError } = await supabase
    .from("budget_categories")
    .select(CATEGORY_COLUMNS)
    .eq("user_id", userId)
    .eq("budget_month_id", month.id)
    .order("sort_order", { ascending: true });

  if (catError) {
    logSupabaseError("fetch categories", catError);
    throw catError;
  }

  const categories = (categoryRows ?? [])
    .map(parseCategoryRow)
    .filter((r): r is BudgetCategoryRow => r !== null);

  if (categories.length === 0) {
    return { ...emptySnapshot(), monthId: month.id, savedAt: month.updated_at ?? month.created_at };
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("budget_items")
    .select(ITEM_COLUMNS)
    .eq("user_id", userId)
    .eq("budget_month_id", month.id)
    .order("sort_order", { ascending: true });

  if (itemError) {
    logSupabaseError("fetch items", itemError);
    throw itemError;
  }

  const items = (itemRows ?? []).map(parseItemRow).filter((r): r is BudgetItemRow => r !== null);

  return snapshotFromMonth(month, categories, items);
}

export async function fetchAllBudgetMonthsSnapshots(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<string, JournalMonthSnapshot>> {
  const months = await listBudgetMonthRows(supabase, userId);
  if (months.length === 0) return {};

  const monthIds = months.map((m) => m.id);

  const { data: categoryRows, error: catError } = await supabase
    .from("budget_categories")
    .select(CATEGORY_COLUMNS)
    .eq("user_id", userId)
    .in("budget_month_id", monthIds)
    .order("sort_order", { ascending: true });

  if (catError) {
    logSupabaseError("fetch all categories", catError);
    throw catError;
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("budget_items")
    .select(ITEM_COLUMNS)
    .eq("user_id", userId)
    .in("budget_month_id", monthIds)
    .order("sort_order", { ascending: true });

  if (itemError) {
    logSupabaseError("fetch all items", itemError);
    throw itemError;
  }

  const categories = (categoryRows ?? [])
    .map(parseCategoryRow)
    .filter((r): r is BudgetCategoryRow => r !== null);
  const items = (itemRows ?? []).map(parseItemRow).filter((r): r is BudgetItemRow => r !== null);

  const record: Record<string, JournalMonthSnapshot> = {};
  for (const month of months) {
    const monthCats = categories.filter((c) => c.budget_month_id === month.id);
    const monthItems = items.filter((i) => i.budget_month_id === month.id);
    record[month.month_key] = snapshotFromMonth(month, monthCats, monthItems);
  }
  return record;
}

export async function fetchLatestBudgetMonthSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<JournalMonthSnapshot | null> {
  const months = await listBudgetMonthRows(supabase, userId);
  if (months.length === 0) return null;
  const latest = months[months.length - 1]!;
  return fetchBudgetMonthByKey(supabase, userId, latest.month_key);
}

export async function seedStarterBudgetMonth(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string,
): Promise<JournalMonthSnapshot> {
  const monthLabel = formatMonthLabel(monthKey);

  const { data: monthData, error: monthError } = await supabase
    .from("budget_months")
    .insert({
      user_id: userId,
      month_key: monthKey,
      month_label: monthLabel,
    })
    .select(MONTH_COLUMNS)
    .single();

  if (monthError) {
    logSupabaseError("seed month", monthError);
    throw monthError;
  }

  const month = parseMonthRow(monthData);
  if (!month) throw new Error("Failed to create starter budget month");

  const categoryInserts = STARTER_BUDGET_CATEGORY_SEEDS.map((seed, index) => ({
    user_id: userId,
    budget_month_id: month.id,
    name: seed.name,
    type: seed.type,
    sort_order: index,
  }));

  const { data: catData, error: catError } = await supabase
    .from("budget_categories")
    .insert(categoryInserts)
    .select(CATEGORY_COLUMNS);

  if (catError) {
    logSupabaseError("seed categories", catError);
    throw catError;
  }

  const categories = (catData ?? [])
    .map(parseCategoryRow)
    .filter((r): r is BudgetCategoryRow => r !== null);

  return snapshotFromMonth(month, categories, []);
}

async function resolveMonthId(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string,
  snapshot: JournalMonthSnapshot,
): Promise<BudgetMonthRow> {
  if (snapshot.monthId && isValidUuid(snapshot.monthId)) {
    const { data, error } = await supabase
      .from("budget_months")
      .select(MONTH_COLUMNS)
      .eq("id", snapshot.monthId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logSupabaseError("resolve month by id", error);
      throw error;
    }
    const row = parseMonthRow(data);
    if (row) {
      await supabase
        .from("budget_months")
        .update({ month_label: formatMonthLabel(monthKey) })
        .eq("id", row.id)
        .eq("user_id", userId);
      return row;
    }
  }

  const { data: existing, error: findError } = await supabase
    .from("budget_months")
    .select(MONTH_COLUMNS)
    .eq("user_id", userId)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (findError) {
    logSupabaseError("find month", findError);
    throw findError;
  }

  const found = parseMonthRow(existing);
  if (found) return found;

  const { data: created, error: createError } = await supabase
    .from("budget_months")
    .insert({
      user_id: userId,
      month_key: monthKey,
      month_label: formatMonthLabel(monthKey),
    })
    .select(MONTH_COLUMNS)
    .single();

  if (createError) {
    logSupabaseError("create month", createError);
    throw createError;
  }

  const row = parseMonthRow(created);
  if (!row) throw new Error("Failed to create budget month");
  return row;
}

export async function saveBudgetMonthSnapshot(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string,
  snapshot: JournalMonthSnapshot,
): Promise<JournalMonthSnapshot> {
  const month = await resolveMonthId(supabase, userId, monthKey, snapshot);
  const monthId = month.id;

  const { data: existingCats, error: catFetchError } = await supabase
    .from("budget_categories")
    .select(CATEGORY_COLUMNS)
    .eq("user_id", userId)
    .eq("budget_month_id", monthId);

  if (catFetchError) {
    logSupabaseError("fetch existing categories", catFetchError);
    throw catFetchError;
  }

  const { data: existingItems, error: itemFetchError } = await supabase
    .from("budget_items")
    .select(ITEM_COLUMNS)
    .eq("user_id", userId)
    .eq("budget_month_id", monthId);

  if (itemFetchError) {
    logSupabaseError("fetch existing items", itemFetchError);
    throw itemFetchError;
  }

  const keptCategoryIds = new Set<string>();
  const keptItemIds = new Set<string>();

  let globalSort = 0;

  for (const tab of TAB_ORDER) {
    const type = TAB_TO_CATEGORY_TYPE[tab];
    for (let catIndex = 0; catIndex < snapshot[tab].length; catIndex++) {
      const cat = snapshot[tab][catIndex]!;
      let categoryId = cat.id;

      if (isValidUuid(categoryId)) {
        const { error } = await supabase
          .from("budget_categories")
          .update({
            name: cat.title.trim() || "Untitled",
            type,
            sort_order: globalSort,
          })
          .eq("id", categoryId)
          .eq("user_id", userId);

        if (error) {
          logSupabaseError("update category", error);
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("budget_categories")
          .insert({
            user_id: userId,
            budget_month_id: monthId,
            name: cat.title.trim() || "Untitled",
            type,
            sort_order: globalSort,
          })
          .select(CATEGORY_COLUMNS)
          .single();

        if (error) {
          logSupabaseError("insert category", error);
          throw error;
        }

        const row = parseCategoryRow(data);
        if (!row) throw new Error("Failed to insert budget category");
        categoryId = row.id;
      }

      keptCategoryIds.add(categoryId);
      globalSort += 1;

      for (let itemIndex = 0; itemIndex < cat.items.length; itemIndex++) {
        const item = cat.items[itemIndex]!;
        const payload = {
          user_id: userId,
          budget_month_id: monthId,
          category_id: categoryId,
          label: item.label.trim() || "Untitled",
          amount: parseNumeric(item.amount),
          sort_order: itemIndex,
        };

        if (isValidUuid(item.id)) {
          const { error } = await supabase
            .from("budget_items")
            .update(payload)
            .eq("id", item.id)
            .eq("user_id", userId);

          if (error) {
            logSupabaseError("update item", error);
            throw error;
          }
          keptItemIds.add(item.id);
        } else {
          const { data, error } = await supabase
            .from("budget_items")
            .insert(payload)
            .select(ITEM_COLUMNS)
            .single();

          if (error) {
            logSupabaseError("insert item", error);
            throw error;
          }

          const row = parseItemRow(data);
          if (!row) throw new Error("Failed to insert budget item");
          keptItemIds.add(row.id);
        }
      }
    }
  }

  const categoriesToDelete = (existingCats ?? [])
    .map(parseCategoryRow)
    .filter((r): r is BudgetCategoryRow => r !== null && !keptCategoryIds.has(r.id));

  for (const cat of categoriesToDelete) {
    const { error: itemsError } = await supabase
      .from("budget_items")
      .delete()
      .eq("category_id", cat.id)
      .eq("user_id", userId);

    if (itemsError) {
      logSupabaseError("delete orphan category items", itemsError);
      throw itemsError;
    }

    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", cat.id)
      .eq("user_id", userId);

    if (error) {
      logSupabaseError("delete orphan category", error);
      throw error;
    }
  }

  const itemsToDelete = (existingItems ?? [])
    .map(parseItemRow)
    .filter((r): r is BudgetItemRow => r !== null && !keptItemIds.has(r.id));

  if (itemsToDelete.length > 0) {
    const { error } = await supabase
      .from("budget_items")
      .delete()
      .in(
        "id",
        itemsToDelete.map((i) => i.id),
      )
      .eq("user_id", userId);

    if (error) {
      logSupabaseError("delete orphan items", error);
      throw error;
    }
  }

  const saved = await fetchBudgetMonthByKey(supabase, userId, monthKey);
  return saved ?? { ...snapshot, monthId, savedAt: new Date().toISOString() };
}

export async function deleteBudgetMonth(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string,
): Promise<void> {
  const { data: monthData, error: monthError } = await supabase
    .from("budget_months")
    .select("id")
    .eq("user_id", userId)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (monthError) {
    logSupabaseError("find month for delete", monthError);
    throw monthError;
  }

  const monthId = monthData && typeof monthData.id === "string" ? monthData.id : null;
  if (!monthId) return;

  const { error: itemsError } = await supabase
    .from("budget_items")
    .delete()
    .eq("budget_month_id", monthId)
    .eq("user_id", userId);

  if (itemsError) {
    logSupabaseError("delete month items", itemsError);
    throw itemsError;
  }

  const { error: catsError } = await supabase
    .from("budget_categories")
    .delete()
    .eq("budget_month_id", monthId)
    .eq("user_id", userId);

  if (catsError) {
    logSupabaseError("delete month categories", catsError);
    throw catsError;
  }

  const { error } = await supabase
    .from("budget_months")
    .delete()
    .eq("id", monthId)
    .eq("user_id", userId);

  if (error) {
    logSupabaseError("delete month", error);
    throw error;
  }
}

export async function buildMonthSummaries(
  supabase: SupabaseClient,
  userId: string,
): Promise<BudgetMonthSummary[]> {
  const all = await fetchAllBudgetMonthsSnapshots(supabase, userId);

  return Object.keys(all)
    .sort()
    .map((monthKey) => {
      const snap = all[monthKey]!;
      const totals = computeBudgetTotals(snap);
      return {
        monthKey,
        monthId: snap.monthId ?? "",
        revenue: totals.totalRevenues,
        expenses: totals.totalExpenses,
        surplus: totals.surplus,
      };
    });
}
