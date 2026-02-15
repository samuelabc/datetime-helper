import type { AiSettings } from "./aiSettings";

export interface SessionPromptStore {
  value: string | null;
}

export function persistPromptByPolicy(store: SessionPromptStore, prompt: string, settings: AiSettings): void {
  if (settings.allowPromptPersistence) {
    store.value = prompt;
    return;
  }
  store.value = null;
}
