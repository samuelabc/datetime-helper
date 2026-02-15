const STORAGE_KEY = "datetime-helper.ai-settings";

export interface AiSettings {
  geminiApiKey: string | null;
  allowPromptPersistence: boolean;
  telemetryEnabled: boolean;
}

const defaults: AiSettings = {
  geminiApiKey: null,
  allowPromptPersistence: false,
  telemetryEnabled: false,
};

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") return defaults;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      geminiApiKey: typeof parsed.geminiApiKey === "string" && parsed.geminiApiKey.trim().length > 0
        ? parsed.geminiApiKey.trim()
        : null,
      allowPromptPersistence: parsed.allowPromptPersistence === true,
      telemetryEnabled: parsed.telemetryEnabled === true,
    };
  } catch {
    return defaults;
  }
}

export function saveAiSettings(next: AiSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearGeminiApiKey(): AiSettings {
  const current = loadAiSettings();
  const next = { ...current, geminiApiKey: null };
  saveAiSettings(next);
  return next;
}
