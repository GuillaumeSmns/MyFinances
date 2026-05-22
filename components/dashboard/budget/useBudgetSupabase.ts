"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildMonthSummaries,
  deleteBudgetMonth,
  fetchAllBudgetMonthsSnapshots,
  fetchBudgetMonthByKey,
  fetchLatestBudgetMonthSnapshot,
  formatSupabaseError,
  logSupabaseError,
  saveBudgetMonthSnapshot,
  seedStarterBudgetMonth,
  type BudgetMonthSummary,
} from "@/lib/budget-db";
import {
  cloneSnapshotAsNewDraft,
  getStarterJournalSnapshot,
  type JournalMonthSnapshot,
} from "@/lib/budget-model";
import {
  removeBudgetMonthFromCache,
  writeBudgetMonthToCache,
  writeBudgetMonthsCache,
} from "@/lib/budget-storage";
import { monthKeyFromDate } from "@/lib/journal-storage";
import { createClient } from "@/utils/supabase/client";

export type BudgetLoadState = "loading" | "ready" | "error";

export function useBudgetSupabase(userId: string | null) {
  const [loadState, setLoadState] = useState<BudgetLoadState>(() => (userId ? "loading" : "ready"));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [monthSummaries, setMonthSummaries] = useState<BudgetMonthSummary[]>([]);

  const refreshSummaries = useCallback(async () => {
    if (!userId) {
      setMonthSummaries([]);
      return;
    }
    try {
      const supabase = createClient();
      const summaries = await buildMonthSummaries(supabase, userId);
      setMonthSummaries(summaries);

      const all = await fetchAllBudgetMonthsSnapshots(supabase, userId);
      writeBudgetMonthsCache(all);
    } catch (err) {
      logSupabaseError("refresh summaries", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const uid = userId;
    let cancelled = false;

    async function init() {
      setLoadError(null);
      setLoadState("loading");
      try {
        const supabase = createClient();
        const months = await buildMonthSummaries(supabase, uid);

        if (cancelled) return;

        if (months.length === 0) {
          const currentKey = monthKeyFromDate(new Date());
          await seedStarterBudgetMonth(supabase, uid, currentKey);
          if (cancelled) return;
        }

        await refreshSummaries();
        if (cancelled) return;
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        logSupabaseError("init", err);
        setLoadError(formatSupabaseError(err));
        setLoadState("error");
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshSummaries]);

  const loadMonth = useCallback(
    async (monthKey: string): Promise<{
      snapshot: JournalMonthSnapshot;
      persisted: boolean;
    }> => {
      if (!userId) {
        return { snapshot: getStarterJournalSnapshot(), persisted: false };
      }

      const supabase = createClient();
      const remote = await fetchBudgetMonthByKey(supabase, userId, monthKey);
      if (remote) {
        writeBudgetMonthToCache(monthKey, remote);
        return { snapshot: remote, persisted: true };
      }

      const latest = await fetchLatestBudgetMonthSnapshot(supabase, userId);
      const draft = latest
        ? cloneSnapshotAsNewDraft(latest)
        : getStarterJournalSnapshot();

      return { snapshot: draft, persisted: false };
    },
    [userId],
  );

  const saveMonth = useCallback(
    async (monthKey: string, snapshot: JournalMonthSnapshot): Promise<JournalMonthSnapshot> => {
      if (!userId) return snapshot;

      setSaveError(null);
      try {
        const supabase = createClient();
        const saved = await saveBudgetMonthSnapshot(supabase, userId, monthKey, snapshot);
        writeBudgetMonthToCache(monthKey, saved);
        await refreshSummaries();
        return saved;
      } catch (err) {
        logSupabaseError("save month", err);
        const message = formatSupabaseError(err);
        setSaveError(message);
        throw err;
      }
    },
    [userId, refreshSummaries],
  );

  const deleteMonth = useCallback(
    async (monthKey: string): Promise<string[]> => {
      if (!userId) return [];

      setSaveError(null);
      try {
        const supabase = createClient();
        await deleteBudgetMonth(supabase, userId, monthKey);
        removeBudgetMonthFromCache(monthKey);
        const supabase2 = createClient();
        const summaries = await buildMonthSummaries(supabase2, userId);
        setMonthSummaries(summaries);
        const all = await fetchAllBudgetMonthsSnapshots(supabase2, userId);
        writeBudgetMonthsCache(all);
        return summaries.map((s) => s.monthKey).sort().reverse();
      } catch (err) {
        logSupabaseError("delete month", err);
        setSaveError(formatSupabaseError(err));
        throw err;
      }
    },
    [userId],
  );

  return {
    loadState,
    loadError,
    saveError,
    monthSummaries,
    loadMonth,
    saveMonth,
    deleteMonth,
    refreshSummaries,
  };
}
