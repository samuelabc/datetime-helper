import { describe, expect, it } from "vitest";
import { getCountdownValue } from "./countdown";

describe("countdown", () => {
  it("returns until mode for future target", () => {
    const value = getCountdownValue("2026-02-16T00:00:00Z", "2026-02-17T00:00:00Z");
    expect(value.mode).toBe("until");
    expect(value.label).toBe("1d 0h 0m 0s");
  });

  it("returns since mode for past target", () => {
    const value = getCountdownValue("2026-02-17T00:00:00Z", "2026-02-16T00:00:00Z");
    expect(value.mode).toBe("since");
    expect(value.label).toBe("1d 0h 0m 0s");
  });
});
