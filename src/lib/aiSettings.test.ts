import { beforeEach, describe, expect, it } from "vitest";
import { clearGeminiApiKey, loadAiSettings, saveAiSettings } from "./aiSettings";

describe("aiSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads defaults when unset", () => {
    expect(loadAiSettings()).toEqual({
      geminiApiKey: null,
      allowPromptPersistence: false,
      telemetryEnabled: false,
    });
  });

  it("saves and reloads local settings", () => {
    saveAiSettings({
      geminiApiKey: "abc",
      allowPromptPersistence: true,
      telemetryEnabled: true,
    });
    expect(loadAiSettings()).toEqual({
      geminiApiKey: "abc",
      allowPromptPersistence: true,
      telemetryEnabled: true,
    });
  });

  it("clears only gemini key", () => {
    saveAiSettings({
      geminiApiKey: "abc",
      allowPromptPersistence: true,
      telemetryEnabled: false,
    });
    expect(clearGeminiApiKey()).toEqual({
      geminiApiKey: null,
      allowPromptPersistence: true,
      telemetryEnabled: false,
    });
  });
});
