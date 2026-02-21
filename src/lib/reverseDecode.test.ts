import { describe, it, expect } from "vitest";
import { decodeDatetimeInput, ReverseDecodeError } from "./reverseDecode";

describe("reverseDecode", () => {
  it("decodes unix timestamps", () => {
    const result = decodeDatetimeInput("1739634600");
    expect(result.unixTimestamp).toBe(1739634600);
    expect(result.unixTimestampMs).toBe(1739634600000);
    expect(result.iso8601).toContain("2025");
  });

  it("keeps exact millisecond precision for 13-digit unix timestamps", () => {
    const result = decodeDatetimeInput("1739634600123");
    expect(result.unixTimestampMs).toBe(1739634600123);
    expect(result.unixTimestamp).toBe(1739634600);
    expect(result.iso8601).toContain(".123Z");
  });

  it("decodes ISO 8601 inputs", () => {
    const result = decodeDatetimeInput("2026-02-15T14:30:00Z");
    expect(result.unixTimestamp).toBeGreaterThan(0);
    expect(result.rfc2822).toBe("Sun, 15 Feb 2026 14:30:00 +0000");
  });

  it("throws typed error for invalid values", () => {
    expect(() => decodeDatetimeInput("not-a-date")).toThrow(ReverseDecodeError);
  });
});
