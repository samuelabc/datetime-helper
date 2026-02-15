/**
 * Wasm Bridge — typed wrappers around the datetime-engine Wasm module.
 *
 * This module handles Wasm initialization and provides type-safe functions
 * for calling into the Rust datetime engine. All computation happens in Wasm;
 * the JavaScript Date API is never used for datetime calculations.
 */

import type { FormattedResult, Operation, ValidationResult } from "./types";

/** Wasm module instance (loaded lazily) */
let wasmModule: {
  init: () => void;
  calculate: (startDate: string, operationsJson: string) => string;
  validate_date: (input: string) => string;
  now_unix: () => number;
} | null = null;

/** Whether the Wasm module has been initialized */
let isInitialized = false;

/**
 * Initialize the Wasm module. Must be called before any other functions.
 * Safe to call multiple times (subsequent calls are no-ops).
 *
 * @throws Error if the Wasm module fails to load or initialize
 */
export async function init(): Promise<void> {
  if (isInitialized) return;

  try {
    // Dynamic import of the wasm-pack generated module.
    // The path will be resolved at build time by Vite/Astro.
    const wasm = await import(
      "../../crates/datetime-engine/pkg/datetime_engine.js"
    );
    await wasm.default();
    wasm.init();
    wasmModule = wasm;
    isInitialized = true;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error loading Wasm";
    throw new Error(`Failed to initialize Wasm module: ${message}`);
  }
}

/**
 * Calculate formatted datetime result from a start date and operations.
 *
 * @param startDate - ISO 8601 date/datetime string (e.g., "2024-07-11" or "2024-07-11T14:30:00Z")
 * @param operations - Array of arithmetic operations to apply (empty array for no operations)
 * @returns FormattedResult with all four timestamp formats
 * @throws Error if Wasm is not initialized or calculation fails
 */
export function calculate(
  startDate: string,
  operations: Operation[] = [],
): FormattedResult {
  if (!wasmModule) {
    throw new Error("Wasm module not initialized. Call init() first.");
  }

  try {
    const operationsJson = JSON.stringify(operations);
    const resultJson = wasmModule.calculate(startDate, operationsJson);
    const parsed: FormattedResult | { error: string } = JSON.parse(resultJson);

    if ("error" in parsed) {
      throw new Error(parsed.error);
    }

    return parsed as FormattedResult;
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error(`Calculate failed: ${String(error)}`);
  }
}

/**
 * Validate a date input string.
 *
 * @param input - Date or datetime string to validate
 * @returns ValidationResult indicating whether the input is valid
 * @throws Error if Wasm is not initialized
 */
export function validateDate(input: string): ValidationResult {
  if (!wasmModule) {
    throw new Error("Wasm module not initialized. Call init() first.");
  }

  try {
    const resultJson = wasmModule.validate_date(input);
    return JSON.parse(resultJson) as ValidationResult;
  } catch (error: unknown) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : `Validation failed: ${String(error)}`,
    };
  }
}

/**
 * Get the current Unix timestamp from the Wasm module.
 *
 * @returns Current Unix timestamp as a number (seconds since epoch)
 * @throws Error if Wasm is not initialized
 */
export function nowUnix(): number {
  if (!wasmModule) {
    throw new Error("Wasm module not initialized. Call init() first.");
  }

  try {
    return wasmModule.now_unix();
  } catch (error: unknown) {
    throw new Error(
      `nowUnix failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
