import { beforeEach, describe, expect, it } from "vitest";
import { clearAiTelemetryEvents, emitAiTelemetry, getAiTelemetryEvents } from "./aiTelemetry";

describe("aiTelemetry", () => {
  beforeEach(() => {
    clearAiTelemetryEvents();
  });

  it("stores metadata-only events when enabled", () => {
    emitAiTelemetry({ source: "gemini", status: "success", durationMs: 50 }, true);
    expect(getAiTelemetryEvents()).toEqual([{ source: "gemini", status: "success", durationMs: 50 }]);
  });

  it("does not record events when disabled", () => {
    emitAiTelemetry({ source: "gemini", status: "success", durationMs: 50 }, false);
    expect(getAiTelemetryEvents()).toEqual([]);
  });

  it("caps telemetry buffer size to prevent unbounded growth", () => {
    for (let i = 0; i < 205; i += 1) {
      emitAiTelemetry({ source: "gemini", status: "success", durationMs: i }, true);
    }
    const events = getAiTelemetryEvents();
    expect(events.length).toBe(200);
    expect(events[0]?.durationMs).toBe(5);
  });
});
