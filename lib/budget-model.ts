import type { FinanceItem } from "@/components/dashboard/types";

export type BudgetTabId = "revenues" | "investments" | "expenses";

export const BUDGET_TABS: { id: BudgetTabId; label: string }[] = [
  { id: "revenues", label: "Revenues" },
  { id: "investments", label: "Investments" },
  { id: "expenses", label: "Expenses" },
];

export type BudgetCategory = {
  id: string;
  title: string;
  items: FinanceItem[];
};

export type JournalMonthSnapshot = {
  revenues: BudgetCategory[];
  investments: BudgetCategory[];
  expenses: BudgetCategory[];
  savedAt?: string;
};

/** Pre-tab-migration shape (localStorage v1). */
export type LegacyJournalMonthSnapshot = {
  pilotRevenue: FinanceItem[];
  financialRevenue: FinanceItem[];
  immoRevenue: FinanceItem[];
  pilotExpense: FinanceItem[];
  loanExpense: FinanceItem[];
  everydayExpense: FinanceItem[];
  homeCharges: FinanceItem[];
  investments: FinanceItem[];
  savedAt?: string;
};

export function makeBudgetId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sumItems(items: FinanceItem[]): number {
  return items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function sumCategory(category: BudgetCategory): number {
  return sumItems(category.items);
}

export function sumCategories(categories: BudgetCategory[]): number {
  return categories.reduce((acc, cat) => acc + sumCategory(cat), 0);
}

export type BudgetTotals = {
  totalRevenues: number;
  totalInvestments: number;
  totalExpenses: number;
  surplus: number;
};

export function computeBudgetTotals(snapshot: JournalMonthSnapshot): BudgetTotals {
  const totalRevenues = sumCategories(snapshot.revenues);
  const totalInvestments = sumCategories(snapshot.investments);
  const totalExpenses = sumCategories(snapshot.expenses);
  const surplus = totalRevenues - totalExpenses;
  return { totalRevenues, totalInvestments, totalExpenses, surplus };
}

function category(id: string, title: string, items: FinanceItem[]): BudgetCategory {
  return { id, title, items: items.map((item) => ({ ...item })) };
}

export function migrateLegacySnapshot(legacy: LegacyJournalMonthSnapshot): JournalMonthSnapshot {
  return {
    revenues: [
      category("cat-salary", "Salary", legacy.pilotRevenue ?? []),
      category("cat-financial-revenue", "Financial Revenue", legacy.financialRevenue ?? []),
      category("cat-immo", "Immo", legacy.immoRevenue ?? []),
    ],
    investments: [category("cat-investments", "Monthly investments", legacy.investments ?? [])],
    expenses: [
      category("cat-salary-deductions", "Salary deductions", legacy.pilotExpense ?? []),
      category("cat-loan", "Loan", legacy.loanExpense ?? []),
      category("cat-everyday", "Everyday Expenses", legacy.everydayExpense ?? []),
      category("cat-home", "Home Charges", legacy.homeCharges ?? []),
    ],
    savedAt: legacy.savedAt,
  };
}

function isLegacySnapshot(raw: Record<string, unknown>): boolean {
  return "pilotRevenue" in raw && !("revenues" in raw);
}

function isValidCategory(raw: unknown): raw is BudgetCategory {
  if (!raw || typeof raw !== "object") return false;
  const c = raw as BudgetCategory;
  return typeof c.id === "string" && typeof c.title === "string" && Array.isArray(c.items);
}

function normalizeCategories(raw: unknown, fallback: BudgetCategory[]): BudgetCategory[] {
  if (!Array.isArray(raw)) return fallback;
  const cats = raw.filter(isValidCategory).map((c) => ({
    id: c.id,
    title: c.title.trim() || "Untitled",
    items: c.items.filter(
      (item) => item && typeof item.id === "string" && typeof item.label === "string",
    ),
  }));
  return cats.length > 0 ? cats : fallback;
}

export function normalizeJournalSnapshot(raw: unknown): JournalMonthSnapshot {
  const defaults = getDefaultJournalSnapshot();
  if (!raw || typeof raw !== "object") return defaults;

  const record = raw as Record<string, unknown>;

  if (isLegacySnapshot(record)) {
    return migrateLegacySnapshot(record as unknown as LegacyJournalMonthSnapshot);
  }

  return {
    revenues: normalizeCategories(record.revenues, defaults.revenues),
    investments: normalizeCategories(record.investments, defaults.investments),
    expenses: normalizeCategories(record.expenses, defaults.expenses),
    savedAt: typeof record.savedAt === "string" ? record.savedAt : undefined,
  };
}

export function getDefaultJournalSnapshot(): JournalMonthSnapshot {
  return {
    revenues: [
      category("cat-salary", "Salary", [
        { id: "rev-basic-salary", label: "Basic salary", amount: 5200 },
        { id: "rev-accommodation", label: "Accommodation allowance", amount: 1300 },
        { id: "rev-layover", label: "Layover allowance", amount: 550 },
        { id: "rev-flight-pay", label: "Flight pay", amount: 1100 },
        { id: "rev-other", label: "Other", amount: 300 },
      ]),
      category("cat-financial-revenue", "Financial Revenue", [
        { id: "default-fin-dividends", label: "Dividends", amount: 260 },
        { id: "default-fin-side-income", label: "Side income", amount: 420 },
      ]),
      category("cat-immo", "Immo", [{ id: "default-immo-rent", label: "Apartment rent", amount: 950 }]),
    ],
    investments: [
      category("cat-investments", "Monthly investments", [
        { id: "default-investment-etf", label: "ETF monthly contribution", amount: 400 },
      ]),
    ],
    expenses: [
      category("cat-salary-deductions", "Salary deductions", [
        { id: "exp-provident", label: "Provident fund deductions", amount: 700 },
        { id: "exp-staff-travel", label: "Staff travel", amount: 180 },
        { id: "exp-pilot-other", label: "Other", amount: 120 },
      ]),
      category("cat-loan", "Loan", [{ id: "default-loan-car", label: "Car loan", amount: 480 }]),
      category("cat-everyday", "Everyday Expenses", [
        { id: "default-everyday-groceries", label: "Groceries", amount: 530 },
        { id: "default-everyday-dining", label: "Dining", amount: 220 },
      ]),
      category("cat-home", "Home Charges", [
        { id: "home-dewa", label: "DEWA", amount: 260 },
        { id: "home-service-fees", label: "Service fees", amount: 340 },
        { id: "home-other", label: "Other", amount: 90 },
      ]),
    ],
  };
}

export function getTabCategories(snapshot: JournalMonthSnapshot, tab: BudgetTabId): BudgetCategory[] {
  return snapshot[tab];
}

export function setTabCategories(
  snapshot: JournalMonthSnapshot,
  tab: BudgetTabId,
  categories: BudgetCategory[],
): JournalMonthSnapshot {
  return { ...snapshot, [tab]: categories };
}

export function createCategory(title = "New category"): BudgetCategory {
  return { id: makeBudgetId(), title, items: [] };
}

export function updateCategoryInList(
  categories: BudgetCategory[],
  categoryId: string,
  updater: (cat: BudgetCategory) => BudgetCategory,
): BudgetCategory[] {
  return categories.map((cat) => (cat.id === categoryId ? updater(cat) : cat));
}

export function deleteCategoryFromList(categories: BudgetCategory[], categoryId: string): BudgetCategory[] {
  return categories.filter((cat) => cat.id !== categoryId);
}

export function insertCategory(
  categories: BudgetCategory[],
  newCategory: BudgetCategory,
  afterIndex?: number,
): BudgetCategory[] {
  if (afterIndex === undefined || afterIndex < 0 || afterIndex >= categories.length) {
    return [...categories, newCategory];
  }
  const next = [...categories];
  next.splice(afterIndex + 1, 0, newCategory);
  return next;
}

/** Reorder categories after drag-and-drop (active tab only). */
export function reorderCategoriesByIds(
  categories: BudgetCategory[],
  activeId: string,
  overId: string,
): BudgetCategory[] {
  const oldIndex = categories.findIndex((c) => c.id === activeId);
  const newIndex = categories.findIndex((c) => c.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return categories;
  const next = [...categories];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next;
}

export function updateItemAmount(items: FinanceItem[], id: string, amount: number): FinanceItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, amount: Number.isFinite(amount) ? amount : 0 } : item,
  );
}

export function updateItemLabel(items: FinanceItem[], id: string, label: string): FinanceItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, label: label.trim() === "" ? item.label : label.trim() } : item,
  );
}

export function addItem(items: FinanceItem[], label: string, amount: number): FinanceItem[] {
  return [...items, { id: makeBudgetId(), label, amount }];
}

export function deleteItem(items: FinanceItem[], id: string): FinanceItem[] {
  return items.filter((item) => item.id !== id);
}

/** Loan section total for Overview debt metrics. */
export function getLoanTotal(snapshot: JournalMonthSnapshot): number {
  const loanCat = snapshot.expenses.find(
    (c) => c.id === "cat-loan" || c.title.toLowerCase() === "loan",
  );
  return loanCat ? sumCategory(loanCat) : 0;
}
