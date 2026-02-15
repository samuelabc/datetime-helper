import { describe, expect, it } from "vitest";
import { persistPromptByPolicy } from "./aiPrivacyPolicy";

describe("aiPrivacyPolicy", () => {
  it("does not persist prompt by default", () => {
    const store = { value: null as string | null };
    persistPromptByPolicy(store, "secret prompt", {
      geminiApiKey: null,
      allowPromptPersistence: false,
      telemetryEnabled: false,
    });
    expect(store.value).toBeNull();
  });

  it("persists only when explicitly enabled", () => {
    const store = { value: null as string | null };
    persistPromptByPolicy(store, "allowed prompt", {
      geminiApiKey: null,
      allowPromptPersistence: true,
      telemetryEnabled: false,
    });
    expect(store.value).toBe("allowed prompt");
  });
});
