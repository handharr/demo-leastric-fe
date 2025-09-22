/**
 * Converts a number to a string with a maximum of 2 decimal places
 * Removes trailing zeros
 */
export function toMaxTwoDecimals(value: number): string {
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Converts a number to a string with a maximum of n decimal places
 * Removes trailing zeros
 */
export function toMaxNDecimals(value: number, maxDecimals: number): string {
  return parseFloat(value.toFixed(maxDecimals)).toString();
}

/**
 * Converts a number to a number with a maximum of 2 decimal places
 * Returns a number type
 */
export function roundToMaxTwoDecimals(value: number): number {
  return parseFloat(value.toFixed(2));
}

/**
 * Converts a number to a number with a maximum of n decimal places
 * Returns a number type
 */
export function roundToMaxNDecimals(
  value: number,
  maxDecimals: number
): number {
  return parseFloat(value.toFixed(maxDecimals));
}

// ...existing code...

/**
 * Formats a number as currency with 2 decimal places
 * @param value - The number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

/**
 * Formats a number as currency with custom decimal places
 * @param value - The number to format
 * @param maxDecimals - Maximum number of decimal places
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatCurrencyWithDecimals(
  value: number,
  maxDecimals: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/**
 * Formats a number as currency without the currency symbol
 * @param value - The number to format
 * @param maxDecimals - Maximum number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatCurrencyNumber(
  value: number,
  maxDecimals: number = 2,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/**
 * Formats a number as currency with currency symbol prefix
 * @param value - The number to format
 * @param currencySymbol - Currency symbol (default: '$')
 * @param maxDecimals - Maximum number of decimal places (default: 2)
 */
export function formatCurrencyWithSymbol(
  value: number,
  currencySymbol: string = "$",
  maxDecimals: number = 2
): string {
  const formattedNumber = formatCurrencyNumber(value, maxDecimals);
  return `${currencySymbol}${formattedNumber}`;
}

// ...existing code...

/**
 * Formats a number as Indonesian Rupiah (IDR)
 * Rupiah typically doesn't use decimal places
 * @param value - The number to format
 * @param locale - Locale for formatting (default: 'id-ID')
 */
export function formatRupiah(value: number, locale: string = "id-ID"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a number as Rupiah with custom symbol (Rp)
 * @param value - The number to format
 * @param withSpace - Add space after symbol (default: true)
 */
export function formatRupiahWithSymbol(
  value: number,
  withSpace: boolean = true
): string {
  const formattedNumber = new Intl.NumberFormat("id-ID").format(
    Math.round(value)
  );
  const separator = withSpace ? " " : "";
  return `Rp${separator}${formattedNumber}`;
}

/**
 * Formats a number as Rupiah number only (without symbol)
 * @param value - The number to format
 */
export function formatRupiahNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(value));
}
