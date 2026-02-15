/**
 * Formatted result returned from the Wasm datetime engine.
 * All four fields represent the exact same instant in time.
 */
export interface FormattedResult {
  /** Unix timestamp in seconds (can be negative for pre-epoch dates) */
  unixTimestamp: number;
  /** ISO 8601 / RFC 3339 formatted string (e.g., "2024-07-11T00:00:00Z") */
  iso8601: string;
  /** RFC 2822 formatted string (e.g., "Thu, 11 Jul 2024 00:00:00 +0000") */
  rfc2822: string;
  /** Human-readable format in UTC (e.g., "July 11, 2024 12:00:00 AM UTC") */
  localHuman: string;
}

/**
 * Result of validating a date input string.
 */
export interface ValidationResult {
  /** Whether the input is a valid date */
  valid: boolean;
  /** Error message when valid is false */
  error?: string;
  /** Normalized date string when valid is true */
  normalized?: string;
}

/**
 * A single arithmetic operation to apply to a datetime.
 */
export interface Operation {
  /** Operation type: "add" or "subtract" */
  type: "add" | "subtract" | "snap";
  /** Time unit for the operation */
  unit:
    | "years"
    | "months"
    | "days"
    | "hours"
    | "minutes"
    | "seconds"
    | "startOfDay"
    | "endOfDay"
    | "startOfMonth"
    | "endOfMonth";
  /** Numeric value for the operation */
  value: number;
}

export type OperationDirection = "add" | "subtract" | "snap";

export type OperationUnit =
  | "years"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";

export type SnapUnit = "startOfDay" | "endOfDay" | "startOfMonth" | "endOfMonth";

export interface OperationRowState {
  id: number;
  direction: OperationDirection;
  amount: number;
  unit: OperationUnit | SnapUnit;
}

/**
 * State of the calculator UI.
 */
export interface CalculatorState {
  /** The start date/time input (ISO string or civil date) */
  startDate: string;
  /** List of operations to apply */
  operations: Operation[];
  /** The computed result, or null if not yet computed */
  result: FormattedResult | null;
  /** Error message if computation failed */
  error: string | null;
  /** Whether the Wasm module is initialized and ready */
  isReady: boolean;
}
