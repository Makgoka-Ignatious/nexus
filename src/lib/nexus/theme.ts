/** Session-only theme store. Starts from the visitor's system colour preference. */
import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

let theme: Theme = "light";
let initialised = false;
const listeners = new Set<() => void>();

function apply() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function ensureInit() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  // Follow the visitor's OS colour scheme on first paint.
  theme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  apply();
  listeners.forEach((listener) => listener());
}

export function toggleTheme() {
  ensureInit();
  theme = theme === "dark" ? "light" : "dark";
  apply();
  listeners.forEach((listener) => listener());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (listener) => {
      ensureInit();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => theme,
    () => "light" as Theme,
  );
}
