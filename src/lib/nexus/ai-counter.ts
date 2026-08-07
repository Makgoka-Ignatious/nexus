import { useSyncExternalStore } from "react";

/** Session-only counter of AI network calls. Resets on page reload. */
let count = 0;
const listeners = new Set<() => void>();

export function bumpAiCalls() {
  count += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAiCallCount() {
  return useSyncExternalStore(
    subscribe,
    () => count,
    () => 0,
  );
}
