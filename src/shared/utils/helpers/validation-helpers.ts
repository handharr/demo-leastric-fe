/**
 * Converts validation error objects to Record<string, string> format
 */
export function mapValidationErrorsToRecord<T extends object>(
  errors: T
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(errors)) {
    if (value !== undefined && typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
}

export function hasValidationErrors<T extends object>(errors: T): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}
