import type { FormattedResult } from "./types";

export class ReverseDecodeError extends Error {}

function formatLocalHuman(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "long",
    timeStyle: "medium",
    hour12: true,
  }).format(date);
}

function toRfc2822(date: Date): string {
  return date.toUTCString().replace("GMT", "+0000");
}

export function decodeDatetimeInput(input: string): FormattedResult {
  const trimmed = input.trim();
  if (!trimmed) throw new ReverseDecodeError("Enter a Unix timestamp or ISO 8601 value.");

  let date: Date;
  if (/^-?\d{10,13}$/.test(trimmed)) {
    const asNumber = Number.parseInt(trimmed, 10);
    const ms = trimmed.length === 13 ? asNumber : asNumber * 1000;
    date = new Date(ms);
  } else {
    date = new Date(trimmed);
  }

  if (Number.isNaN(date.getTime())) {
    throw new ReverseDecodeError("Invalid reverse decode input.");
  }

  return {
    unixTimestamp: Math.floor(date.getTime() / 1000),
    unixTimestampMs: date.getTime(),
    iso8601: date.toISOString(),
    rfc2822: toRfc2822(date),
    localHuman: formatLocalHuman(date),
  };
}
