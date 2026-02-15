import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import Calculator from "./Calculator.svelte";

const { calculateMock, validateDateMock } = vi.hoisted(() => ({
  calculateMock: vi.fn(),
  validateDateMock: vi.fn(),
}));

vi.mock("../lib/wasmBridge", () => ({
  init: vi.fn().mockResolvedValue(undefined),
  calculate: calculateMock,
  validateDate: validateDateMock,
}));

beforeEach(() => {
  calculateMock.mockReset();
  validateDateMock.mockReset();
  calculateMock.mockReturnValue({
    unixTimestamp: 1739634600,
    iso8601: "2026-02-15T14:30:00Z",
    rfc2822: "Sun, 15 Feb 2026 14:30:00 +0000",
    localHuman: "February 15, 2026 2:30:00 PM UTC",
  });
  validateDateMock.mockReturnValue({ valid: true, normalized: "2026-02-15T14:30:00Z" });
});

describe("CommandPalette integration", () => {
  it("opens with keyboard shortcut and returns focus on Escape", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    render(Calculator);
    const launcher = screen.getByRole("button", { name: "Open command palette" });
    launcher.focus();
    expect(document.activeElement).toBe(launcher);

    await fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog", { name: "AI command palette" })).toBeTruthy();
    await fireEvent.keyDown(screen.getByRole("dialog", { name: "AI command palette" }), { key: "Escape" });
    expect(document.activeElement).toBe(launcher);
  });
});
