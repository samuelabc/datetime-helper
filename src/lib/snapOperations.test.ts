import { describe, expect, it } from "vitest";
import { applyOperationChain, SnapOperationError } from "./snapOperations";
import type { OperationRowState } from "./types";

describe("snapOperations", () => {
  it("applies snap operations deterministically", () => {
    const operations: OperationRowState[] = [{ id: 1, direction: "snap", amount: 0, unit: "endOfMonth" }];
    const result = applyOperationChain("2026-02-15T14:30:00Z", operations);
    expect(result).toBe("2026-02-28T23:59:59.999Z");
  });

  it("preserves operation order for mixed chains", () => {
    const operations: OperationRowState[] = [
      { id: 1, direction: "add", amount: 1, unit: "months" },
      { id: 2, direction: "snap", amount: 0, unit: "startOfMonth" },
      { id: 3, direction: "subtract", amount: 1, unit: "days" },
    ];
    const result = applyOperationChain("2026-01-15T10:00:00Z", operations);
    expect(result).toBe("2026-01-31T00:00:00.000Z");
  });

  it("throws typed errors for invalid base state", () => {
    expect(() => applyOperationChain("not-a-date", [])).toThrow(SnapOperationError);
  });
});
