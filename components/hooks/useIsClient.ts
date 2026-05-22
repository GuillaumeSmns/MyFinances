import { useSyncExternalStore } from "react";

/** True after hydration on the client; false during SSR and the first server render pass. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
