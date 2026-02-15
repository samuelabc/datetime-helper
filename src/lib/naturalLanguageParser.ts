import type { OperationDirection, OperationRowState, OperationUnit } from "./types";

export type StartDateIntent = { kind: "now" } | { kind: "explicit"; value: string };

export interface NaturalLanguageParseResult {
  startDateIntent: StartDateIntent;
  operations: Array<{
    direction: OperationDirection;
    amount: number;
    unit: OperationUnit;
  }>;
  confidence?: {
    summary: string;
    steps: Array<{
      operationIndex: number;
      score: number;
      sourceText: string;
    }>;
  };
}

export type ParseErrorCode =
  | "EMPTY_PROMPT"
  | "AMBIGUOUS"
  | "INVALID_OPERATION"
  | "UNSUPPORTED";

export class NaturalLanguageParseError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export interface AiProviderOperation {
  direction: "add" | "subtract";
  amount: number;
  unit: OperationUnit;
}

export interface AiProviderParseOutput {
  startDate?: string;
  operations?: AiProviderOperation[];
  confidence?: {
    summary?: string;
    steps?: Array<{
      operationIndex: number;
      score: number;
      sourceText: string;
    }>;
  };
}

const unitMap: Record<string, OperationUnit> = {
  day: "days",
  days: "days",
  month: "months",
  months: "months",
  year: "years",
  years: "years",
  hour: "hours",
  hours: "hours",
  minute: "minutes",
  minutes: "minutes",
  second: "seconds",
  seconds: "seconds",
};

const unitPattern = "(day|days|month|months|year|years|hour|hours|minute|minutes|second|seconds)";

function buildOperation(
  amountRaw: string | undefined,
  unitRaw: string | undefined,
  direction: OperationDirection,
): { direction: OperationDirection; amount: number; unit: OperationUnit } | null {
  const amount = Number.parseInt(amountRaw ?? "", 10);
  const unit = unitMap[unitRaw ?? ""];
  if (!Number.isInteger(amount) || amount < 0 || !unit) return null;
  return { direction, amount, unit };
}

function parseSegment(segment: string): { direction: OperationDirection; amount: number; unit: OperationUnit } | null {
  const normalized = segment.trim().toLowerCase();
  if (!normalized) return null;

  const agoMatch = normalized.match(new RegExp(`(\\d+)\\s+${unitPattern}\\s+ago`));
  if (agoMatch) {
    return buildOperation(agoMatch[1], agoMatch[2], "subtract");
  }

  const earlierMatch = normalized.match(new RegExp(`(\\d+)\\s+${unitPattern}\\s+earlier`));
  if (earlierMatch) {
    return buildOperation(earlierMatch[1], earlierMatch[2], "subtract");
  }

  const inMatch = normalized.match(new RegExp(`in\\s+(\\d+)\\s+${unitPattern}`));
  if (inMatch) {
    return buildOperation(inMatch[1], inMatch[2], "add");
  }

  const laterMatch = normalized.match(new RegExp(`(\\d+)\\s+${unitPattern}\\s+later`));
  if (laterMatch) {
    return buildOperation(laterMatch[1], laterMatch[2], "add");
  }

  const fromNowMatch = normalized.match(new RegExp(`(\\d+)\\s+${unitPattern}\\s+from\\s+now`));
  if (fromNowMatch) {
    return buildOperation(fromNowMatch[1], fromNowMatch[2], "add");
  }

  const addMatch = normalized.match(new RegExp(`(?:add|plus|\\+)\\s*(\\d+)\\s+${unitPattern}`));
  if (addMatch) {
    return buildOperation(addMatch[1], addMatch[2], "add");
  }

  const compactAddMatch = normalized.match(new RegExp(`\\+(\\d+)\\s*${unitPattern}`));
  if (compactAddMatch) {
    return buildOperation(compactAddMatch[1], compactAddMatch[2], "add");
  }

  const subtractMatch = normalized.match(new RegExp(`(?:subtract|minus|-)\\s*(\\d+)\\s+${unitPattern}`));
  if (subtractMatch) {
    return buildOperation(subtractMatch[1], subtractMatch[2], "subtract");
  }

  const compactSubtractMatch = normalized.match(new RegExp(`-(\\d+)\\s*${unitPattern}`));
  if (compactSubtractMatch) {
    return buildOperation(compactSubtractMatch[1], compactSubtractMatch[2], "subtract");
  }

  return null;
}

export function parseNaturalLanguagePrompt(prompt: string): NaturalLanguageParseResult {
  const normalized = prompt.trim().toLowerCase();
  if (!normalized) {
    throw new NaturalLanguageParseError("EMPTY_PROMPT", "Enter a prompt to parse.");
  }

  const segments = normalized
    .split(/\b(?:then|and|,)\b/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const parsedSegments = segments
    .map((segment, index) => {
      const operation = parseSegment(segment);
      if (!operation) return null;
      return {
        operation,
        sourceText: segment,
        operationIndex: index,
      };
    })
    .filter((segment): segment is NonNullable<typeof segment> => segment !== null);
  const operations = parsedSegments.map((item) => item.operation);

  if (operations.length === 0) {
    const hasDateSignals = /\b(today|tomorrow|yesterday|now|\d{4}-\d{2}-\d{2})\b/.test(normalized);
    if (hasDateSignals) {
      throw new NaturalLanguageParseError("AMBIGUOUS", "Prompt includes date intent but no actionable operation.");
    }
    throw new NaturalLanguageParseError(
      "UNSUPPORTED",
      "Prompt is ambiguous or unsupported. Try phrases like '6 months ago from now'.",
    );
  }

  if (operations.some((operation) => !Number.isInteger(operation.amount) || operation.amount < 0)) {
    throw new NaturalLanguageParseError("INVALID_OPERATION", "Invalid operation detected in prompt.");
  }

  const explicitIsoMatch = normalized.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const explicitNaturalDateMatch = normalized.match(/\b(from|starting)\s+([a-z]+\s+\d{1,2}(?:,\s*\d{4})?)\b/);
  const startDateIntent: StartDateIntent = explicitIsoMatch
    ? { kind: "explicit", value: explicitIsoMatch[1] as string }
    : explicitNaturalDateMatch
      ? { kind: "explicit", value: explicitNaturalDateMatch[2] as string }
      : { kind: "now" };

  return {
    startDateIntent,
    operations,
    confidence: {
      summary: "Heuristic parse confidence available.",
      steps: parsedSegments.map((segment, index) => ({
        operationIndex: index,
        score: 0.92,
        sourceText: segment.sourceText,
      })),
    },
  };
}

export function parsedOperationsToRows(operations: NaturalLanguageParseResult["operations"]): OperationRowState[] {
  return operations.map((operation, index) => ({
    id: index + 1,
    direction: operation.direction,
    amount: operation.amount,
    unit: operation.unit,
  }));
}

export function parseAiProviderOutput(output: AiProviderParseOutput): NaturalLanguageParseResult {
  if (!output || !Array.isArray(output.operations) || output.operations.length === 0) {
    throw new NaturalLanguageParseError("AMBIGUOUS", "AI output did not contain actionable operations.");
  }

  const operations = output.operations.map((operation) => {
    if (
      (operation.direction !== "add" && operation.direction !== "subtract") ||
      !Number.isInteger(operation.amount) ||
      operation.amount < 0
    ) {
      throw new NaturalLanguageParseError("INVALID_OPERATION", "AI output contains invalid operation fields.");
    }
    return operation;
  });

  const startDateIntent: StartDateIntent =
    typeof output.startDate === "string" && output.startDate.trim().length > 0
      ? { kind: "explicit", value: output.startDate.trim() }
      : { kind: "now" };

  return {
    startDateIntent,
    operations,
    confidence: output.confidence
      ? {
          summary: output.confidence.summary ?? "Provider confidence metadata available.",
          steps: Array.isArray(output.confidence.steps) ? output.confidence.steps : [],
        }
      : undefined,
  };
}
