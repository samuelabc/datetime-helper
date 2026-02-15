import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import AIConfidenceDiff from "./AIConfidenceDiff.svelte";

describe("AIConfidenceDiff", () => {
  it("renders confidence summary and toggles diff details", async () => {
    const onToggle = vi.fn();
    render(AIConfidenceDiff, {
      props: {
        open: false,
        onToggle,
        model: {
          summary: "Heuristic parse confidence available.",
          unavailable: false,
          steps: [
            {
              operationIndex: 0,
              label: "add 1 days",
              scoreLabel: "60%",
              lowConfidence: true,
              sourceText: "add 1 day",
            },
          ],
        },
      },
    });

    expect(screen.getByText("Heuristic parse confidence available.")).toBeTruthy();
    expect(screen.queryByText(/From prompt:/)).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Show confidence diff" }));
    expect(onToggle).toHaveBeenCalled();
  });

  it("shows prompt-to-operation mapping text when expanded", () => {
    render(AIConfidenceDiff, {
      props: {
        open: true,
        onToggle: vi.fn(),
        model: {
          summary: "Provider confidence metadata available.",
          unavailable: false,
          steps: [
            {
              operationIndex: 0,
              label: "subtract 6 months",
              scoreLabel: "58%",
              lowConfidence: true,
              sourceText: "6 months ago",
            },
          ],
        },
      },
    });
    expect(screen.getByText('From prompt: "6 months ago"')).toBeTruthy();
  });
});
