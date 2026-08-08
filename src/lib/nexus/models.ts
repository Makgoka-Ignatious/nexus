/** Session-only AI model selection, shared across the app. */
import { useSyncExternalStore } from "react";

export interface ModelOption {
  id: string;
  label: string;
  hint: string;
}

export const MODELS: ModelOption[] = [
  { id: "google/gemini-3.6-flash", label: "Gemini Flash", hint: "Fast all-rounder (default)" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini Pro", hint: "Deeper reasoning" },
  { id: "openai/gpt-5.6-terra", label: "ChatGPT", hint: "Balanced GPT-5.6" },
  { id: "openai/gpt-5.6-luna", label: "ChatGPT Fast", hint: "Low-latency GPT-5.6" },
];

export const DEFAULT_MODEL = MODELS[0]!.id;
export const MODEL_IDS = MODELS.map((m) => m.id);

let selected = DEFAULT_MODEL;
const listeners = new Set<() => void>();

export function setModel(id: string) {
  if (!MODEL_IDS.includes(id)) return;
  selected = id;
  listeners.forEach((listener) => listener());
}

export function getModel() {
  return selected;
}

export function useModel() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selected,
    () => DEFAULT_MODEL,
  );
}
