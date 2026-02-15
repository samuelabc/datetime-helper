import type { OperationDirection, OperationRowState } from "./types";

export interface UrlCalculatorState {
  startDateInput: string;
  operations: OperationRowState[];
}

export class UrlStateError extends Error {
  readonly code: "MALFORMED" | "INVALID";

  constructor(code: "MALFORMED" | "INVALID", message: string) {
    super(message);
    this.code = code;
  }
}

const validDirections: OperationDirection[] = ["add", "subtract", "snap"];
const validUnits = [
  "years",
  "months",
  "days",
  "hours",
  "minutes",
  "seconds",
  "startOfDay",
  "endOfDay",
  "startOfMonth",
  "endOfMonth",
] as const;

export function encodeUrlState(state: UrlCalculatorState): string {
  const params = new URLSearchParams();
  params.set("s", state.startDateInput);

  state.operations.forEach((operation, index) => {
    params.set(`o${index}`, `${operation.direction}:${operation.amount}:${operation.unit}`);
  });

  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const canonical = new URLSearchParams();
  entries.forEach(([key, value]) => canonical.append(key, value));
  return canonical.toString();
}

export function decodeUrlState(
  search: string,
  fallback: UrlCalculatorState,
): { state: UrlCalculatorState; error?: UrlStateError } {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const operationEntries = [...params.entries()]
    .filter(([key]) => /^o\d+$/.test(key))
    .sort(([a], [b]) => Number.parseInt(a.slice(1), 10) - Number.parseInt(b.slice(1), 10));

  if (!params.has("s") && operationEntries.length === 0) {
    return { state: fallback };
  }

  if (!params.has("s")) {
    return {
      state: fallback,
      error: new UrlStateError("INVALID", "Missing start-date state in URL."),
    };
  }
  const startDateInput = params.get("s") ?? fallback.startDateInput;
  if (startDateInput.trim().length === 0) {
    return {
      state: fallback,
      error: new UrlStateError("INVALID", "Empty start-date state in URL."),
    };
  }

  const operations: OperationRowState[] = [];
  for (const [_, value] of operationEntries) {
    const [direction, amountRaw, unit] = value.split(":");
    const amount = Number.parseInt(amountRaw ?? "", 10);

    if (!direction || !validDirections.includes(direction as OperationDirection)) {
      return { state: fallback, error: new UrlStateError("MALFORMED", "Invalid direction in URL state.") };
    }
    if (!unit || !validUnits.includes(unit as (typeof validUnits)[number])) {
      return { state: fallback, error: new UrlStateError("MALFORMED", "Invalid unit in URL state.") };
    }
    if (!Number.isInteger(amount) || amount < 0) {
      return { state: fallback, error: new UrlStateError("MALFORMED", "Invalid amount in URL state.") };
    }

    operations.push({
      id: operations.length + 1,
      direction: direction as OperationDirection,
      amount,
      unit,
    });
  }

  return {
    state: {
      startDateInput,
      operations: operations.length > 0 ? operations : fallback.operations,
    },
  };
}
