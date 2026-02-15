import type { OperationRowState, SnapUnit } from "./types";

export class SnapOperationError extends Error {}

function isSnapOperation(operation: OperationRowState): operation is OperationRowState & { unit: SnapUnit } {
  return operation.direction === "snap";
}

function applySnap(date: Date, unit: SnapUnit): Date {
  const next = new Date(date);
  if (unit === "startOfDay") next.setUTCHours(0, 0, 0, 0);
  else if (unit === "endOfDay") next.setUTCHours(23, 59, 59, 999);
  else if (unit === "startOfMonth") {
    next.setUTCDate(1);
    next.setUTCHours(0, 0, 0, 0);
  } else if (unit === "endOfMonth") {
    next.setUTCMonth(next.getUTCMonth() + 1, 0);
    next.setUTCHours(23, 59, 59, 999);
  }

  if (Number.isNaN(next.getTime())) {
    throw new SnapOperationError(`Snap operation '${unit}' produced an invalid state.`);
  }
  return next;
}

function applyArithmetic(date: Date, operation: OperationRowState): Date {
  const next = new Date(date);
  const factor = operation.direction === "subtract" ? -1 : 1;

  if (operation.unit === "years") next.setUTCFullYear(next.getUTCFullYear() + factor * operation.amount);
  else if (operation.unit === "months") next.setUTCMonth(next.getUTCMonth() + factor * operation.amount);
  else if (operation.unit === "days") next.setUTCDate(next.getUTCDate() + factor * operation.amount);
  else if (operation.unit === "hours") next.setUTCHours(next.getUTCHours() + factor * operation.amount);
  else if (operation.unit === "minutes") next.setUTCMinutes(next.getUTCMinutes() + factor * operation.amount);
  else if (operation.unit === "seconds") next.setUTCSeconds(next.getUTCSeconds() + factor * operation.amount);

  if (Number.isNaN(next.getTime())) {
    throw new SnapOperationError("Operation chain produced an invalid intermediate datetime.");
  }
  return next;
}

export function applyOperationChain(startIso: string, operations: OperationRowState[]): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    throw new SnapOperationError("Invalid base datetime for operation chain.");
  }

  const result = operations.reduce((current, operation) => {
    if (isSnapOperation(operation)) {
      return applySnap(current, operation.unit);
    }
    return applyArithmetic(current, operation);
  }, start);

  return result.toISOString();
}
