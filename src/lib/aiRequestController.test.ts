import { describe, it, expect } from "vitest";
import { AiRequestController } from "./aiRequestController";

describe("AiRequestController", () => {
  it("marks only latest request as mutable", () => {
    const controller = new AiRequestController();
    const first = controller.begin();
    const second = controller.begin();

    expect(controller.isLatest(first)).toBe(false);
    expect(controller.isLatest(second)).toBe(true);
  });

  it("cancels previous in-flight request when a new one begins", () => {
    const controller = new AiRequestController();
    const first = controller.begin();
    controller.begin();

    expect(first.signal.aborted).toBe(true);
  });
});
