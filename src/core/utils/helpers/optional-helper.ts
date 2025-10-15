/**
 * Utility functions for handling optional values (nullable/undefined)
 * Similar to Swift's optional extensions
 */

// String extensions
export function orEmpty(value: string | null | undefined): string {
  return value ?? "";
}

export function orDefault(
  value: string | null | undefined,
  defaultValue: string
): string {
  return value ?? defaultValue;
}

export function isNullOrEmpty(value: string | null | undefined): boolean {
  return value == null || value === "";
}

export function isNotNullOrEmpty(value: string | null | undefined): boolean {
  return !isNullOrEmpty(value);
}

// Number extensions
export function orZero(value: number | null | undefined): number {
  return value ?? 0;
}

export function orDefaultNumber(
  value: number | null | undefined,
  defaultValue: number
): number {
  return value ?? defaultValue;
}

export function isValidNumber(value: number | null | undefined): boolean {
  return value != null && !isNaN(value) && isFinite(value);
}

// Boolean extensions
export function orFalse(value: boolean | null | undefined): boolean {
  return value ?? false;
}

export function orTrue(value: boolean | null | undefined): boolean {
  return value ?? true;
}

export function orDefaultBoolean(
  value: boolean | null | undefined,
  defaultValue: boolean
): boolean {
  return value ?? defaultValue;
}

// Array extensions
export function orEmptyArray<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

export function orDefaultArray<T>(
  value: T[] | null | undefined,
  defaultValue: T[]
): T[] {
  return value ?? defaultValue;
}

export function isNullOrEmptyArray<T>(value: T[] | null | undefined): boolean {
  return value == null || value.length === 0;
}

// Generic optional handling
export function ifPresent<T>(
  value: T | null | undefined,
  action: (value: T) => void
): void {
  if (value != null) {
    action(value);
  }
}

export function ifPresentOrElse<T>(
  value: T | null | undefined,
  action: (value: T) => void,
  elseAction: () => void
): void {
  if (value != null) {
    action(value);
  } else {
    elseAction();
  }
}

export function map<T, R>(
  value: T | null | undefined,
  mapper: (value: T) => R
): R | null {
  return value != null ? mapper(value) : null;
}

export function flatMap<T, R>(
  value: T | null | undefined,
  mapper: (value: T) => R | null | undefined
): R | null {
  return value != null ? mapper(value) ?? null : null;
}
