/**
 * Converts an array of strings to a delimited string with optional filtering
 * @param params - Configuration object
 * @param params.array - Array of strings to convert
 * @param params.delimiter - Custom delimiter (default: ",")
 * @param params.excludeValues - Array of values to exclude from the result
 * @returns Delimited string
 * @example
 * arrayStringToDelimitedString({
 *   array: ["Car", "Airplane", "All"],
 *   delimiter: ",",
 *   excludeValues: ["All"]
 * }) // "Car,Airplane"
 */
export function arrayStringToDelimitedString(params: {
  array: string[];
  delimiter?: string;
  excludeValues?: string[];
}): string {
  const { array, delimiter = ",", excludeValues = [] } = params;

  if (excludeValues.length === 0) {
    return array.join(delimiter);
  }

  return array.filter((item) => !excludeValues.includes(item)).join(delimiter);
}
