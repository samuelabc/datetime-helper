export class CronParseError extends Error {}

export interface CronRunInstant {
  iso: string;
  unixTimestamp: number;
}

export type CronReferenceTimezone = "UTC" | "LOCAL";

interface ParsedCron {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

function parseField(raw: string, min: number, max: number): (value: number) => boolean {
  if (raw === "*") return () => true;
  if (/^\*\/\d+$/.test(raw)) {
    const step = Number.parseInt(raw.slice(2), 10);
    if (step <= 0) throw new CronParseError("Invalid step");
    return (value) => value % step === 0;
  }
  if (/^\d+$/.test(raw)) {
    const expected = Number.parseInt(raw, 10);
    if (expected < min || expected > max) throw new CronParseError("Field out of range");
    return (value) => value === expected;
  }
  throw new CronParseError("Unsupported cron field");
}

export function parseCronExpression(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new CronParseError("Cron must have 5 fields");
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  parseField(minute as string, 0, 59);
  parseField(hour as string, 0, 23);
  parseField(dayOfMonth as string, 1, 31);
  parseField(month as string, 1, 12);
  parseField(dayOfWeek as string, 0, 6);
  return {
    minute: minute as string,
    hour: hour as string,
    dayOfMonth: dayOfMonth as string,
    month: month as string,
    dayOfWeek: dayOfWeek as string,
  };
}

export function getNextCronRuns(
  expression: string,
  startIso: string,
  count = 5,
  timezone: CronReferenceTimezone = "UTC",
): CronRunInstant[] {
  const parsed = parseCronExpression(expression);
  const minuteMatch = parseField(parsed.minute, 0, 59);
  const hourMatch = parseField(parsed.hour, 0, 23);
  const domMatch = parseField(parsed.dayOfMonth, 1, 31);
  const monthMatch = parseField(parsed.month, 1, 12);
  const dowMatch = parseField(parsed.dayOfWeek, 0, 6);

  const cursor = new Date(startIso);
  if (timezone === "UTC") {
    cursor.setUTCSeconds(0, 0);
  } else {
    cursor.setSeconds(0, 0);
  }
  const results: CronRunInstant[] = [];
  const maxIterations = 180000;

  for (let i = 0; i < maxIterations && results.length < count; i += 1) {
    if (timezone === "UTC") {
      cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
      if (!minuteMatch(cursor.getUTCMinutes())) continue;
      if (!hourMatch(cursor.getUTCHours())) continue;
      if (!domMatch(cursor.getUTCDate())) continue;
      if (!monthMatch(cursor.getUTCMonth() + 1)) continue;
      if (!dowMatch(cursor.getUTCDay())) continue;
    } else {
      cursor.setMinutes(cursor.getMinutes() + 1);
      if (!minuteMatch(cursor.getMinutes())) continue;
      if (!hourMatch(cursor.getHours())) continue;
      if (!domMatch(cursor.getDate())) continue;
      if (!monthMatch(cursor.getMonth() + 1)) continue;
      if (!dowMatch(cursor.getDay())) continue;
    }
    results.push({
      iso: cursor.toISOString(),
      unixTimestamp: Math.floor(cursor.getTime() / 1000),
    });
  }

  return results;
}
