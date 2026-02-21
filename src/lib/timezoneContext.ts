import type { FormattedResult } from "./types";
import { GENERATED_IANA_TIMEZONES } from "./generated/ianaTimezones";

export type TimezoneMode = "utc" | "local" | "iana";

export interface TimezoneContextState {
  mode: TimezoneMode;
  ianaTimeZone?: string;
}

const compareTimezones = (a: string, b: string): number => (a === b ? 0 : a < b ? -1 : 1);

function toRfc2822(date: Date): string {
  return date.toUTCString().replace("GMT", "+0000");
}

function toRfc2822InTimezone(date: Date, timeZone?: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "shortOffset",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const offsetRaw = get("timeZoneName");
  const offset = normalizeRfc2822Offset(offsetRaw);
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${offset}`;
}

function normalizeRfc2822Offset(offsetRaw: string): string {
  if (!offsetRaw) return "+0000";
  if (offsetRaw === "GMT" || offsetRaw === "UTC") return "+0000";

  const normalized = offsetRaw.replace("UTC", "GMT");
  const match = normalized.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return "+0000";

  const sign = match[1];
  const hours = match[2].padStart(2, "0");
  const minutes = (match[3] ?? "00").padStart(2, "0");
  return `${sign}${hours}${minutes}`;
}

function formatLocalHuman(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "long",
    timeStyle: "medium",
    hour12: true,
  }).format(date);
}

export function supportsIanaTimeZones(): boolean {
  return GENERATED_IANA_TIMEZONES.length > 0;
}

export function getAvailableIanaTimeZones(): string[] {
  const merged = new Set<string>(GENERATED_IANA_TIMEZONES);

  if (typeof Intl.supportedValuesOf === "function") {
    try {
      const zones = Intl.supportedValuesOf("timeZone");
      zones.forEach((zone) => merged.add(zone));
    } catch {
      // Use generated build-time timezone data.
    }
  }

  return Array.from(merged).sort(compareTimezones);
}

export function applyTimezoneContext(base: FormattedResult, context: TimezoneContextState): FormattedResult {
  const date = new Date(base.iso8601);
  if (Number.isNaN(date.getTime())) return base;

  if (context.mode === "utc") {
    return {
      unixTimestamp: base.unixTimestamp,
      unixTimestampMs: base.unixTimestampMs,
      iso8601: base.iso8601,
      rfc2822: toRfc2822(date),
      localHuman: `${formatLocalHuman(date, "UTC")} UTC`,
    };
  }

  if (context.mode === "iana" && context.ianaTimeZone) {
    return {
      unixTimestamp: base.unixTimestamp,
      unixTimestampMs: base.unixTimestampMs,
      iso8601: base.iso8601,
      rfc2822: toRfc2822InTimezone(date, context.ianaTimeZone),
      localHuman: `${formatLocalHuman(date, context.ianaTimeZone)} ${context.ianaTimeZone}`,
    };
  }

  return {
    unixTimestamp: base.unixTimestamp,
    unixTimestampMs: base.unixTimestampMs,
    iso8601: base.iso8601,
    rfc2822: toRfc2822InTimezone(date),
    localHuman: formatLocalHuman(date),
  };
}
