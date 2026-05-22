"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_ASSETS_DISPLAY_CURRENCY,
  getAssetsDisplayCurrency,
  subscribeToAssetsDisplayCurrency,
} from "@/lib/assets-preferences";

export function useAssetsDisplayCurrency() {
  return useSyncExternalStore(
    subscribeToAssetsDisplayCurrency,
    getAssetsDisplayCurrency,
    () => DEFAULT_ASSETS_DISPLAY_CURRENCY,
  );
}
