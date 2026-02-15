import { describe, expect, it } from "vitest";
import { CronParseError, getNextCronRuns, parseCronExpression } from "./cronDebugger";

describe("cronDebugger", () => {
  it("parses supported cron format", () => {
    expect(parseCronExpression("*/15 * * * *")).toEqual({
      minute: "*/15",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    });
  });

  it("throws for invalid cron field count", () => {
    expect(() => parseCronExpression("* * *")).toThrow(CronParseError);
  });

  it("returns deterministic upcoming runs", () => {
    const runs = getNextCronRuns("0 * * * *", "2026-02-16T10:10:00Z", 2);
    expect(runs.length).toBe(2);
    expect(runs[0]?.iso).toBe("2026-02-16T11:00:00.000Z");
  });

  it("supports local-time evaluation mode", () => {
    const runs = getNextCronRuns("*/30 * * * *", "2026-02-16T10:10:00Z", 1, "LOCAL");
    expect(runs.length).toBe(1);
  });
});
