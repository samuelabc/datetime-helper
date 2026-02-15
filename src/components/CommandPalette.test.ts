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
        onSubmit,
        onClose,
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
        onSubmit,
        onClose,
      },
    });

    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
