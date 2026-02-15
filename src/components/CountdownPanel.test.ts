import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/svelte";
import CountdownPanel from "./CountdownPanel.svelte";

describe("CountdownPanel", () => {
  it("renders countdown label and value", () => {
    render(CountdownPanel, {
      props: {
        value: { mode: "until", totalSeconds: 60, label: "0d 0h 1m 0s" },
      },
    });
    expect(screen.getByText("Time until target")).toBeTruthy();
    expect(screen.getByText("0d 0h 1m 0s")).toBeTruthy();
  });

  it("renders since mode label", () => {
    render(CountdownPanel, {
      props: {
        value: { mode: "since", totalSeconds: 30, label: "0d 0h 0m 30s" },
      },
    });
    expect(screen.getByText("Time since target")).toBeTruthy();
  });
});
