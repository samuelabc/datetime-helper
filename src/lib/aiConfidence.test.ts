import { describe, expect, it } from "vitest";
import { toConfidenceViewModel } from "./aiConfidence";

describe("aiConfidence", () => {
  it("returns unavailable fallback when confidence metadata is missing", () => {
    const model = toConfidenceViewModel({
      startDateIntent: { kind: "now" },
      operations: [{ direction: "add", amount: 1, unit: "days" }],
    });
    expect(model.unavailable).toBe(true);
    expect(model.summary).toMatch(/unavailable/i);
  });

  it("flags low-confidence steps", () => {
    const model = toConfidenceViewModel({
      startDateIntent: { kind: "now" },
      operations: [{ direction: "add", amount: 1, unit: "days" }],
      confidence: {
        summary: "provider",
        steps: [{ operationIndex: 0, score: 0.5, sourceText: "add one day" }],
      },
    });
    expect(model.steps[0]?.lowConfidence).toBe(true);
    expect(model.steps[0]?.scoreLabel).toBe("50%");
  });
});
