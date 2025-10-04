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

  // String methods
  orEmpty(): string {
    if (typeof this.value === "string") {
      return this.value;
    }
    return "";
  }

  isNullOrEmpty(): boolean {
    if (typeof this.value === "string") {
      return this.value == null || this.value === "";
    }
    return this.value == null;
  }

  isNotNullOrEmpty(): boolean {
    return !this.isNullOrEmpty();
  }

  ifStringPresent(action: (value: string) => void): OptionalWrapper<T> {
    if (
      typeof this.value === "string" &&
      this.value != null &&
      this.value !== ""
    ) {
      action(this.value);
    }
    return this;
  }

  // Date methods
  orToday(): Date {
    if (this.value instanceof Date) {
      return this.value;
    }
    return new Date();
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
