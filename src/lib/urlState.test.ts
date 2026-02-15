import { describe, it, expect } from "vitest";
import { decodeUrlState, encodeUrlState } from "./urlState";

const fallback = {
  startDateInput: "now",
  operations: [{ id: 1, direction: "subtract" as const, amount: 0, unit: "days" as const }],
};

describe("urlState", () => {
  it("encodes with deterministic ordering", () => {
    const query = encodeUrlState({
      startDateInput: "2026-01-31",
      operations: [
        { id: 1, direction: "add", amount: 1, unit: "months" },
        { id: 2, direction: "subtract", amount: 3, unit: "days" },
      ],
    });

    expect(query).toBe("o0=add%3A1%3Amonths&o1=subtract%3A3%3Adays&s=2026-01-31");
  });

  it("decodes canonical query and preserves order", () => {
    const decoded = decodeUrlState("?o0=add%3A1%3Amonths&o1=subtract%3A3%3Adays&s=2026-01-31", fallback);
    expect(decoded.error).toBeUndefined();
    expect(decoded.state.operations[0]?.unit).toBe("months");
    expect(decoded.state.operations[1]?.unit).toBe("days");
  });

  it("falls back with typed error for malformed state", () => {
    const decoded = decodeUrlState("?o0=add%3A-1%3Adays&s=now", fallback);
    expect(decoded.error?.message).toContain("Invalid amount");
    expect(decoded.error?.code).toBe("MALFORMED");
    expect(decoded.state).toEqual(fallback);
  });

  it("returns INVALID when operation state is missing start date key", () => {
    const decoded = decodeUrlState("?o0=add%3A1%3Adays", fallback);
    expect(decoded.error?.code).toBe("INVALID");
    expect(decoded.state).toEqual(fallback);
  });
});
