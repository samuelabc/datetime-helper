export type AiAvailabilityState = "ready" | "unavailable";

export interface AiAvailabilityResult {
  state: AiAvailabilityState;
  message?: string;
}

export function detectAiAvailability(): AiAvailabilityResult {
  if (typeof window === "undefined") {
    return { state: "unavailable", message: "AI availability can only be detected in a browser." };
  }

  const globalWindow = window as Window & {
    ai?: { languageModel?: { create?: unknown } };
    LanguageModel?: { create?: unknown; availability?: unknown };
  };
  const hasWindowAiProvider = typeof globalWindow.ai?.languageModel?.create === "function";
  const hasLanguageModelProvider =
    typeof globalWindow.LanguageModel?.create === "function" ||
    typeof globalWindow.LanguageModel?.availability === "function";

  if (hasWindowAiProvider || hasLanguageModelProvider) {
    return { state: "ready" };
  }

  return {
    state: "unavailable",
    message: "AI unavailable in this browser. Use calculator directly.",
  };
}
