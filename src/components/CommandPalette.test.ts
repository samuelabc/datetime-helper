import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import CommandPalette from "./CommandPalette.svelte";

describe("CommandPalette", () => {
  it("renders ready state and submits prompt", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(CommandPalette, {
      props: {
        open: true,
        availability: { state: "ready" },
        busy: false,
        error: null,
        settings: { geminiApiKey: null, allowPromptPersistence: false, telemetryEnabled: false },
        onSubmit,
        onClose,
        onSaveSettings: vi.fn(),
        onClearGeminiKey: vi.fn(),
      },
    });

    const input = screen.getByLabelText("Command palette prompt");
    await fireEvent.input(input, { target: { value: "6 months ago from now" } });
    await fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith("6 months ago from now");
  });

  it("handles Escape close path", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(CommandPalette, {
      props: {
        open: true,
        availability: { state: "unavailable", message: "AI unavailable" },
        busy: false,
        error: null,
        settings: { geminiApiKey: null, allowPromptPersistence: false, telemetryEnabled: false },
        onSubmit,
        onClose,
        onSaveSettings: vi.fn(),
        onClearGeminiKey: vi.fn(),
      },
    });

    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("allows submit when local AI unavailable but gemini key is configured", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(CommandPalette, {
      props: {
        open: true,
        availability: { state: "unavailable", message: "AI unavailable" },
        busy: false,
        error: null,
        settings: { geminiApiKey: "abc", allowPromptPersistence: false, telemetryEnabled: false },
        onSubmit,
        onClose: vi.fn(),
        onSaveSettings: vi.fn(),
        onClearGeminiKey: vi.fn(),
      },
    });

    const submit = screen.getByRole("button", { name: "Apply" });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });
});
