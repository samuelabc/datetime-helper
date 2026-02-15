import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import AISettingsPanel from "./AISettingsPanel.svelte";

describe("AISettingsPanel", () => {
  it("saves key through callback", async () => {
    const onSave = vi.fn();
    render(AISettingsPanel, {
      props: {
        settings: { geminiApiKey: null, allowPromptPersistence: false, telemetryEnabled: false },
        onSave,
        onClearKey: vi.fn(),
      },
    });
    const input = screen.getByLabelText("Optional Gemini API key") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "abc" } });
    await fireEvent.click(screen.getByRole("button", { name: "Save key" }));
    expect(onSave).toHaveBeenCalled();
  });
});
