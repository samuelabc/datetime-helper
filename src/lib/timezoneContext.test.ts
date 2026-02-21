import { describe, it, expect } from "vitest";
import { applyTimezoneContext } from "./timezoneContext";

const base = {
  unixTimestamp: 1739634600,
  unixTimestampMs: 1739634600123,
  iso8601: "2025-02-15T14:30:00.000Z",
  rfc2822: "Sat, 15 Feb 2025 14:30:00 +0000",
  localHuman: "February 15, 2025 2:30:00 PM",
};

describe("timezoneContext", () => {
  it("keeps instant identity in UTC mode", () => {
    const formatted = applyTimezoneContext(base, { mode: "utc" });
    expect(formatted.unixTimestamp).toBe(base.unixTimestamp);
    expect(formatted.unixTimestampMs).toBe(base.unixTimestampMs);
    expect(formatted.rfc2822).toBe("Sat, 15 Feb 2025 14:30:00 +0000");
    expect(formatted.localHuman).toContain("UTC");
  });

  it("updates RFC 2822 offset for iana rendering", () => {
    const formatted = applyTimezoneContext(base, { mode: "iana", ianaTimeZone: "America/New_York" });
    expect(formatted.unixTimestamp).toBe(base.unixTimestamp);
    expect(formatted.unixTimestampMs).toBe(base.unixTimestampMs);
    expect(formatted.rfc2822).toBe("Sat, 15 Feb 2025 09:30:00 -0500");
    expect(formatted.localHuman).toContain("America/New_York");
  });
});
