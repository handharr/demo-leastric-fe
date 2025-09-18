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

export class OptionalArray<T> {
  constructor(private value: T[] | null | undefined) {}

  orEmpty(): T[] {
    return this.value ?? [];
  }

  orDefault(defaultValue: T[]): T[] {
    return this.value ?? defaultValue;
  }

  isNullOrEmpty(): boolean {
    return this.value == null || this.value.length === 0;
  }

  isNotNullOrEmpty(): boolean {
    return !this.isNullOrEmpty();
  }

  ifPresent(action: (value: T[]) => void): OptionalArray<T> {
    if (this.value != null) {
      action(this.value);
    }
    return this;
  }

  map<R>(mapper: (value: T[]) => R): R | null {
    return this.value != null ? mapper(this.value) : null;
  }

  get(): T[] | null | undefined {
    return this.value;
  }
}

// Factory functions for creating optionals
export function optional(value: string | null | undefined): OptionalString;
export function optional(value: number | null | undefined): OptionalNumber;
export function optional(value: boolean | null | undefined): OptionalBoolean;
export function optional<T>(value: T[] | null | undefined): OptionalArray<T>;
export function optional(value: unknown): unknown {
  const valueType = typeof value;

  if (Array.isArray(value) || value === null || value === undefined) {
    return new OptionalArray(value as unknown[]);
  }
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

export class OptionalWrapper<T> {
  constructor(private value: T | null | undefined) {}

  orZero(): number {
    if (typeof this.value === "number") {
      return this.value;
    }
    return 0;
  }

  orDefault(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  orNull(): T | null {
    return this.value ?? null;
  }

  // Boolean methods
  orFalse(): boolean {
    if (typeof this.value === "boolean") {
      return this.value;
    }
    return false;
  }

  orTrue(): boolean {
    if (typeof this.value === "boolean") {
      return this.value;
    }
    return true;
  }

  // Array methods
  orEmptyArray(): T extends readonly unknown[] ? T : T[] {
    if (Array.isArray(this.value)) {
      return this.value as T extends readonly unknown[] ? T : T[];
    }
    return [] as T extends readonly unknown[] ? T : T[];
  }

  isNullOrEmptyArray(): boolean {
    if (!Array.isArray(this.value)) {
      return this.value == null;
    }
    return this.value == null || this.value.length === 0;
  }

  isNotNullOrEmptyArray(): boolean {
    return !this.isNullOrEmptyArray();
  }

  arrayLength(): number {
    if (Array.isArray(this.value)) {
      return this.value.length;
    }
    return 0;
  }

  ifArrayPresent(
    action: (value: T extends readonly (infer U)[] ? U[] : T) => void
  ): OptionalWrapper<T> {
    if (Array.isArray(this.value) && this.value.length > 0) {
      action(this.value as T extends readonly (infer U)[] ? U[] : T);
    }
    return this;
  }

  isPresent(): boolean {
    return this.value != null;
  }

  isEmpty(): boolean {
    return this.value == null;
  }

  map<U>(fn: (value: T) => U): OptionalWrapper<U> {
    if (this.value != null) {
      return new OptionalWrapper(fn(this.value));
    }
    return new OptionalWrapper<U>(undefined);
  }
}

export function optionalValue<T>(
  value: T | null | undefined
): OptionalWrapper<T> {
  return new OptionalWrapper(value);
}
