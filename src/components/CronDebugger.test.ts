import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import CronDebugger from "./CronDebugger.svelte";

describe("CronDebugger", () => {
  it("toggles and applies selected run", async () => {
    const onToggle = vi.fn();
    const onExpressionInput = vi.fn();
    const onUseRun = vi.fn();

    render(CronDebugger, {
      props: {
        open: true,
        expression: "0 * * * *",
        timezone: "UTC",
        error: null,
        runs: [{ iso: "2026-02-16T11:00:00.000Z", unixTimestamp: 1771239600 }],
        onToggle,
        onExpressionInput,
        onTimezoneInput: vi.fn(),
        onUseRun,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Use this run" }));
    expect(onUseRun).toHaveBeenCalledWith("2026-02-16T11:00:00.000Z");
    expect(screen.getByText("Unix: 1771239600")).toBeTruthy();
  });

  it("renders collapsed mode without run content", () => {
    render(CronDebugger, {
      props: {
        open: false,
        expression: "0 * * * *",
        timezone: "UTC",
        error: null,
        runs: [{ iso: "2026-02-16T11:00:00.000Z", unixTimestamp: 1771239600 }],
        onToggle: vi.fn(),
        onExpressionInput: vi.fn(),
        onTimezoneInput: vi.fn(),
        onUseRun: vi.fn(),
      },
    });
    expect(screen.queryByLabelText("Cron expression")).toBeNull();
  });
});
