import { describe, expect, it } from "vitest";
import { timeZonesNames } from "@vvo/tzdb";
import { GENERATED_IANA_TIMEZONES } from "./generated/ianaTimezones";

const compareTimezones = (a: string, b: string): number => (a === b ? 0 : a < b ? -1 : 1);
const normalizeTimezones = (zones: string[]): string[] =>
  Array.from(new Set(zones.filter((name) => typeof name === "string" && name.length > 0))).sort(compareTimezones);

describe("generated IANA timezone data", () => {
  it("is non-empty, unique, and sorted", () => {
    expect(GENERATED_IANA_TIMEZONES.length).toBeGreaterThan(100);

    const normalized = normalizeTimezones([...GENERATED_IANA_TIMEZONES]);
    expect(GENERATED_IANA_TIMEZONES).toEqual(normalized);
    expect(GENERATED_IANA_TIMEZONES).toContain("America/New_York");
  });

  it("matches the @vvo/tzdb source list", () => {
    const expected = normalizeTimezones([...timeZonesNames]);
    expect(GENERATED_IANA_TIMEZONES).toEqual(expected);
  });
});
