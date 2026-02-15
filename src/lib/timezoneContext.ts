import type { FormattedResult } from "./types";

export type TimezoneMode = "utc" | "local" | "iana";

export interface TimezoneContextState {
  mode: TimezoneMode;
  ianaTimeZone?: string;
}

function toRfc2822(date: Date): string {
  return date.toUTCString().replace("GMT", "+0000");
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
  if (typeof Intl.supportedValuesOf !== "function") return false;
  try {
    return Intl.supportedValuesOf("timeZone").length > 0;
  } catch {
    return false;
  }
}

export function applyTimezoneContext(base: FormattedResult, context: TimezoneContextState): FormattedResult {
  const date = new Date(base.iso8601);
  if (Number.isNaN(date.getTime())) return base;

  if (context.mode === "utc") {
    return {
      unixTimestamp: base.unixTimestamp,
      iso8601: base.iso8601,
      rfc2822: base.rfc2822,
      localHuman: `${formatLocalHuman(date, "UTC")} UTC`,
    };
  }

  if (context.mode === "iana" && context.ianaTimeZone) {
    return {
      unixTimestamp: base.unixTimestamp,
      iso8601: base.iso8601,
      rfc2822: base.rfc2822,
      localHuman: `${formatLocalHuman(date, context.ianaTimeZone)} ${context.ianaTimeZone}`,
    };
  }

  return {
    unixTimestamp: base.unixTimestamp,
    iso8601: base.iso8601,
    rfc2822: base.rfc2822,
    localHuman: formatLocalHuman(date),
  };
}
