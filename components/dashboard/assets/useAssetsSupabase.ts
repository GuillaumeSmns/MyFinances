"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCategoryInDb,
  createItemInDb,
  deleteCategoryInDb,
  deleteItemInDb,
  fetchUserAssets,
  formatSupabaseError,
  logSupabaseError,
  seedDefaultCategories,
  syncCategorySortOrders,
  updateCategoryInDb,
  updateItemInDb,
  type AssetItemUpdatePatch,
} from "@/lib/assets-db";
import type { AssetCategory, AssetItem, AssetsSnapshot } from "@/lib/assets-model";
import { writeAssetsToStorage } from "@/lib/assets-storage";
import { createClient } from "@/utils/supabase/client";

const DEBOUNCE_MS = 500;

function debounceByKey(
  map: Map<string, ReturnType<typeof setTimeout>>,
  key: string,
  fn: () => void,
) {
  const existing = map.get(key);
  if (existing) clearTimeout(existing);
  map.set(
    key,
    setTimeout(() => {
      map.delete(key);
      fn();
    }, DEBOUNCE_MS),
  );
}

export type AssetsLoadState = "loading" | "ready" | "error";

export function useAssetsSupabase(userId: string | null) {
  const [snapshot, setSnapshot] = useState<AssetsSnapshot>({ categories: [] });
  const [loadState, setLoadState] = useState<AssetsLoadState>(() => (userId ? "loading" : "ready"));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categoryNameTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const itemPatchTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const cacheSnapshot = useCallback((next: AssetsSnapshot | ((prev: AssetsSnapshot) => AssetsSnapshot)) => {
    setSnapshot((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      writeAssetsToStorage(resolved);
      return resolved;
    });
  }, []);

  const runDb = useCallback(
    async (action: () => Promise<void>) => {
      if (!userId) return;
      setSaveError(null);
      try {
        await action();
      } catch (err) {
        logSupabaseError("save", err);
        setSaveError(formatSupabaseError(err));
        throw err;
      }
    },
    [userId],
  );

  useEffect(() => {
    const uid = userId;
    if (!uid) return;

    let cancelled = false;

    async function load(forUserId: string) {
      setLoadError(null);
      try {
        const supabase = createClient();
        const remote = await fetchUserAssets(supabase, forUserId);

        if (cancelled) return;

        if (remote.categories.length > 0) {
          cacheSnapshot(remote);
          setLoadState("ready");
          return;
        }

        const seeded = await seedDefaultCategories(supabase, forUserId);
        if (cancelled) return;
        cacheSnapshot(seeded);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        logSupabaseError("load", err);
        setLoadError(formatSupabaseError(err));
        setLoadState("error");
      }
    }

    void load(uid);
    return () => {
      cancelled = true;
    };
  }, [userId, cacheSnapshot]);

  const persistReorder = useCallback(
    async (categories: AssetCategory[]) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      await runDb(async () => {
        const supabase = createClient();
        await syncCategorySortOrders(supabase, userId, categories);
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistCategoryName = useCallback(
    (categoryId: string, name: string, categories: AssetCategory[]) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      debounceByKey(categoryNameTimers.current, categoryId, () => {
        void runDb(async () => {
          const supabase = createClient();
          await updateCategoryInDb(supabase, userId, categoryId, { name });
        });
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistAddCategory = useCallback(
    async (categories: AssetCategory[], newCategory: AssetCategory) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      const sortOrder = categories.length - 1;
      await runDb(async () => {
        const supabase = createClient();
        await createCategoryInDb(supabase, userId, newCategory, sortOrder);
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistDeleteCategory = useCallback(
    async (categories: AssetCategory[], categoryId: string) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      await runDb(async () => {
        const supabase = createClient();
        await deleteCategoryInDb(supabase, userId, categoryId);
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistItemChange = useCallback(
    (
      categories: AssetCategory[],
      categoryId: string,
      itemId: string,
      patch: Partial<Omit<AssetItem, "id">>,
    ) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      const key = `${categoryId}:${itemId}`;
      debounceByKey(itemPatchTimers.current, key, () => {
        void runDb(async () => {
          const supabase = createClient();
          await updateItemInDb(supabase, userId, itemId, patch as AssetItemUpdatePatch);
        });
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistAddItem = useCallback(
    async (categories: AssetCategory[], categoryId: string, item: AssetItem) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      await runDb(async () => {
        const supabase = createClient();
        await createItemInDb(supabase, userId, categoryId, item);
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const persistDeleteItem = useCallback(
    async (categories: AssetCategory[], itemId: string) => {
      cacheSnapshot((prev) => ({ ...prev, categories }));
      if (!userId) return;
      await runDb(async () => {
        const supabase = createClient();
        await deleteItemInDb(supabase, userId, itemId);
      });
    },
    [cacheSnapshot, userId, runDb],
  );

  const hasAnyItems = snapshot.categories.some((c) => c.items.length > 0);

  return {
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
  };
}
