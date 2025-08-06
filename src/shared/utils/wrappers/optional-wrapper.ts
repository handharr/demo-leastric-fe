/**
 * Optional wrapper classes for more Swift-like syntax
 */

export class OptionalString {
  constructor(private value: string | null | undefined) {}

  orEmpty(): string {
    return this.value ?? "";
  }

  orDefault(defaultValue: string): string {
    return this.value ?? defaultValue;
  }

  isNullOrEmpty(): boolean {
    return this.value == null || this.value === "";
  }

  isNotNullOrEmpty(): boolean {
    return !this.isNullOrEmpty();
  }

  ifPresent(action: (value: string) => void): OptionalString {
    if (this.value != null) {
      action(this.value);
    }
    return this;
  }

  map<R>(mapper: (value: string) => R): R | null {
    return this.value != null ? mapper(this.value) : null;
  }

  get(): string | null | undefined {
    return this.value;
  }
}

export class OptionalNumber {
  constructor(private value: number | null | undefined) {}

  orZero(): number {
    return this.value ?? 0;
  }

  orDefault(defaultValue: number): number {
    return this.value ?? defaultValue;
  }

  isValid(): boolean {
    return this.value != null && !isNaN(this.value) && isFinite(this.value);
  }

  ifPresent(action: (value: number) => void): OptionalNumber {
    if (this.value != null) {
      action(this.value);
    }
    return this;
  }

  map<R>(mapper: (value: number) => R): R | null {
    return this.value != null ? mapper(this.value) : null;
  }

  get(): number | null | undefined {
    return this.value;
  }
}

export class OptionalBoolean {
  constructor(private value: boolean | null | undefined) {}

  orFalse(): boolean {
    return this.value ?? false;
  }

  orTrue(): boolean {
    return this.value ?? true;
  }

  orDefault(defaultValue: boolean): boolean {
    return this.value ?? defaultValue;
  }

  ifPresent(action: (value: boolean) => void): OptionalBoolean {
    if (this.value != null) {
      action(this.value);
    }
    return this;
  }

  get(): boolean | null | undefined {
    return this.value;
  }
}

// Factory functions for creating optionals
export function optional(value: string | null | undefined): OptionalString;
export function optional(value: number | null | undefined): OptionalNumber;
export function optional(value: boolean | null | undefined): OptionalBoolean;
export function optional(value: unknown): unknown {
  const valueType = typeof value;

  if (valueType === "string" || value === null || value === undefined) {
    return new OptionalString(value as string | null | undefined);
  }
  if (valueType === "number" || value === null || value === undefined) {
    return new OptionalNumber(value as number | null | undefined);
  }
  if (valueType === "boolean" || value === null || value === undefined) {
    return new OptionalBoolean(value as boolean | null | undefined);
  }

  // For other types, return as-is
  return value;
}
