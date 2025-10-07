import { TimePeriod } from "@/shared/domain/enum/enums";
import { DateRange } from "@/shared/domain/entities/shared-models";

/**
 * Formats a Date object to UTC string without milliseconds in ISO 8601 format.
 *
 * @param date - The Date object to format
 * @returns Formatted UTC string without milliseconds
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 * formatDateToStringUTCWithoutMs(date); // "2023-10-15T14:30:25Z"
 *
 * const localDate = new Date(2023, 9, 15, 14, 30, 25); // October 15, 2023 (local time)
 * formatDateToStringUTCWithoutMs(localDate); // "2023-10-15T07:30:25Z" (assuming UTC+7)
 * ```
 */
export function formatDateToStringUTCWithoutMs(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

/**
 * Gets the start and end dates of a given year in UTC.
 * Returns January 1st 00:00:00 to December 31st 23:59:59.
 *
 * @param year - The year to get date range for
 * @returns DateRange object with start and end dates of the year
 *
 * @example
 * ```typescript
 * const range = getStartAndEndDateOfYear(2023);
 * // Output:
 * // {
 * //   startDate: Date("2023-01-01T00:00:00.000Z"),
 * //   endDate: Date("2023-12-31T23:59:59.999Z")
 * // }
 *
 * const range2024 = getStartAndEndDateOfYear(2024); // Leap year
 * // Output:
 * // {
 * //   startDate: Date("2024-01-01T00:00:00.000Z"),
 * //   endDate: Date("2024-12-31T23:59:59.999Z")
 * // }
 * ```
 */
export function getStartAndEndDateOfYear(year: number): DateRange {
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // January 1st
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // December 31st

  return {
    startDate,
    endDate,
  };
}

/**
 * Gets the start and end dates of the month containing the given date in UTC.
 * Returns the first day 00:00:00 to last day 23:59:59 of the month.
 *
 * @param date - The date to extract month range from
 * @returns DateRange object with start and end dates of the month
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:00Z");
 * const range = getStartAndEndDateOfMonthFromDate(date);
 * // Output:
 * // {
 * //   startDate: Date("2023-10-01T00:00:00.000Z"),
 * //   endDate: Date("2023-10-31T23:59:59.999Z")
 * // }
 *
 * const febDate = new Date("2024-02-15T12:00:00Z"); // Leap year
 * const febRange = getStartAndEndDateOfMonthFromDate(febDate);
 * // Output:
 * // {
 * //   startDate: Date("2024-02-01T00:00:00.000Z"),
 * //   endDate: Date("2024-02-29T23:59:59.999Z") // 29 days in leap year
 * // }
 * ```
 */
export function getStartAndEndDateOfMonthFromDate(date: Date): DateRange {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-based (0 = January, 11 = December)

  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // Last day of the month

  return {
    startDate,
    endDate,
  };
}

/**
 * Gets the start and end dates of the day containing the given date in UTC.
 * Returns 00:00:00 to 23:59:59 of the same day.
 *
 * @param date - The date to extract day range from
 * @returns DateRange object with start and end dates of the day
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 * const range = getStartAndEndDateOfDayFromDate(date);
 * // Output:
 * // {
 * //   startDate: Date("2023-10-15T00:00:00.000Z"),
 * //   endDate: Date("2023-10-15T23:59:59.999Z")
 * // }
 *
 * const localDate = new Date(2023, 9, 15, 23, 45); // Local time near midnight
 * const dayRange = getStartAndEndDateOfDayFromDate(localDate);
 * // Output will be the UTC day range, which might be different from local day
 * ```
 */
export function getStartAndEndDateOfDayFromDate(date: Date): DateRange {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-based (0 = January, 11 = December)
  const day = date.getUTCDate();

  const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return {
    startDate,
    endDate,
  };
}

/**
 * Gets date range based on time period type relative to current date.
 * - Daily: Current month (1st to last day)
 * - Weekly: Current week (Monday to Sunday)
 * - Monthly/Yearly: Current year (January 1st to December 31st)
 *
 * @param timePeriod - The time period type to get range for
 * @returns DateRange object with appropriate start and end dates
 *
 * @example
 * ```typescript
 * // Assuming today is October 15, 2023 (Sunday)
 *
 * const dailyRange = getDateRangeByTimePeriod(TimePeriod.Daily);
 * // Output:
 * // {
 * //   startDate: Date("2023-10-01T00:00:00.000"),
 * //   endDate: Date("2023-10-31T23:59:59.999")
 * // }
 *
 * const weeklyRange = getDateRangeByTimePeriod(TimePeriod.Weekly);
 * // Output (Monday Oct 9 to Sunday Oct 15):
 * // {
 * //   startDate: Date("2023-10-09T00:00:00.000"),
 * //   endDate: Date("2023-10-15T23:59:59.999")
 * // }
 *
 * const monthlyRange = getDateRangeByTimePeriod(TimePeriod.Monthly);
 * // Output:
 * // {
 * //   startDate: Date("2023-01-01T00:00:00.000"),
 * //   endDate: Date("2023-12-31T23:59:59.999")
 * // }
 * ```
 */
export function getDateRangeByTimePeriod(timePeriod: TimePeriod): DateRange {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)
  const currentDate = now.getDate();

  switch (timePeriod) {
    case TimePeriod.Daily: {
      const startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      const endDate = new Date(
        currentYear,
        currentMonth + 1,
        0,
        23,
        59,
        59,
        999
      ); // Last day of current month

      return {
        startDate: startDate,
        endDate: endDate,
      };
    }

    case TimePeriod.Weekly: {
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for Monday start

      const startDate = new Date(
        currentYear,
        currentMonth,
        currentDate - daysFromMonday,
        0,
        0,
        0,
        0
      ); // Monday of current week

      const endDate = new Date(
        currentYear,
        currentMonth,
        currentDate - daysFromMonday + 6,
        23,
        59,
        59,
        999
      ); // Sunday of current week

      return {
        startDate: startDate,
        endDate: endDate,
      };
    }

    case TimePeriod.Monthly:
    case TimePeriod.Yearly: {
      const startDate = new Date(currentYear, 0, 1, 0, 0, 0, 0); // January 1st
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // December 31st

      return {
        startDate: startDate,
        endDate: endDate,
      };
    }

    default:
      throw new Error(`Unsupported time period: ${timePeriod}`);
  }
}

/**
 * Gets date range from the 1st of current month until today.
 * Useful for getting month-to-date data excluding future dates.
 *
 * @returns DateRange object from start of current month to end of today
 *
 * @example
 * ```typescript
 * // Assuming today is October 15, 2023
 * const range = getCurrentMonthDateRangeUntilToday();
 * // Output:
 * // {
 * //   startDate: Date("2023-10-01T00:00:00.000"),
 * //   endDate: Date("2023-10-15T23:59:59.999")
 * // }
 *
 * // On the 1st of the month
 * // Assuming today is November 1, 2023
 * const range2 = getCurrentMonthDateRangeUntilToday();
 * // Output:
 * // {
 * //   startDate: Date("2023-11-01T00:00:00.000"),
 * //   endDate: Date("2023-11-01T23:59:59.999")
 * // }
 * ```
 */
export function getCurrentMonthDateRangeUntilToday(): DateRange {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 11 = December)
  const currentDate = now.getDate();

  const startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
  const endDate = new Date(
    currentYear,
    currentMonth,
    currentDate,
    23,
    59,
    59,
    999
  );

  return {
    startDate,
    endDate,
  };
}

/**
 * Gets an array of year strings going back 10 years from current year.
 * Returns years in descending order (most recent first).
 *
 * @returns Array of year strings from current year to 9 years ago
 *
 * @example
 * ```typescript
 * // Assuming current year is 2023
 * const years = get10YearsRangeFromCurrentYear();
 * // Output: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014"]
 *
 * // In year 2025
 * const years2025 = get10YearsRangeFromCurrentYear();
 * // Output: ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"]
 * ```
 */
export function get10YearsRangeFromCurrentYear(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let i = 0; i < 10; i++) {
    years.push((currentYear - i).toString());
  }

  return years;
}

/**
 * Converts a Date object to formatted date string.
 * Default format is YYYY-MM-DD, optionally includes time as YYYY-MM-DD HH:mm:ss.
 *
 * @param date - The Date object to format
 * @param withTime - Whether to include time in the output (default: false)
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 *
 * getDateStringFromDate(date); // "2023-10-15"
 * getDateStringFromDate(date, false); // "2023-10-15"
 * getDateStringFromDate(date, true); // "2023-10-15 14:30:25"
 *
 * const localDate = new Date(2023, 9, 15, 9, 30, 45); // Local time
 * getDateStringFromDate(localDate, true); // "2023-10-15 09:30:45"
 * ```
 */
export function getDateStringFromDate(
  date: Date,
  withTime: boolean = false
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (withTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Subtracts specified number of seconds from a date and returns new Date object.
 * Does not modify the original date object.
 *
 * @param date - The original Date object
 * @param seconds - Number of seconds to subtract
 * @returns New Date object with subtracted seconds
 *
 * @example
 * ```typescript
 * const originalDate = new Date("2023-10-15T14:30:25Z");
 *
 * const oneMinuteAgo = substractDateBySeconds(originalDate, 60);
 * // Output: Date("2023-10-15T14:29:25Z")
 *
 * const oneHourAgo = substractDateBySeconds(originalDate, 3600);
 * // Output: Date("2023-10-15T13:30:25Z")
 *
 * const tenSecondsAgo = substractDateBySeconds(originalDate, 10);
 * // Output: Date("2023-10-15T14:30:15Z")
 *
 * // Original date remains unchanged
 * console.log(originalDate); // Still "2023-10-15T14:30:25Z"
 * ```
 */
export function substractDateBySeconds(date: Date, seconds: number): Date {
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() - seconds);
  return newDate;
}

/**
 * Extracts time portion from a Date object and returns as HH:mm:ss string.
 * Uses 24-hour format with leading zeros.
 *
 * @param date - The Date object to extract time from
 * @returns Time string in HH:mm:ss format
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 * getTimeStringFromDate(date); // "14:30:25"
 *
 * const morningDate = new Date("2023-10-15T09:05:03Z");
 * getTimeStringFromDate(morningDate); // "09:05:03"
 *
 * const midnightDate = new Date("2023-10-15T00:00:00Z");
 * getTimeStringFromDate(midnightDate); // "00:00:00"
 *
 * const localDate = new Date(2023, 9, 15, 23, 45, 12); // Local time
 * getTimeStringFromDate(localDate); // "23:45:12"
 * ```
 */
export function getTimeStringFromDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Parses various date string formats and returns a Date object.
 * Supports ISO 8601, YYYY-MM-DD, YYYY/MM/DD, YYYY-MM, and YYYY/MM formats.
 * Returns null if parsing fails.
 *
 * @param dateString - The date string to parse
 * @returns Parsed Date object or null if parsing fails
 *
 * @example
 * ```typescript
 * // ISO 8601 format
 * parseDateString("2023-10-15T14:30:25Z"); // Date("2023-10-15T14:30:25.000Z")
 * parseDateString("2023-10-15T14:30:25.123Z"); // Date("2023-10-15T14:30:25.123Z")
 *
 * // Date only formats
 * parseDateString("2023-10-15"); // Date("2023-10-15T00:00:00.000Z")
 * parseDateString("2023/10/15"); // Date("2023-10-15T00:00:00.000Z")
 *
 * // Month only formats (defaults to 1st day)
 * parseDateString("2023-10"); // Date("2023-10-01T00:00:00.000Z")
 * parseDateString("2023/10"); // Date("2023-10-01T00:00:00.000Z")
 *
 * // Invalid formats
 * parseDateString("invalid-date"); // null
 * parseDateString("2023-13-01"); // null (invalid month)
 * parseDateString(""); // null
 * ```
 */
export function parseDateString(dateString: string): Date | null {
  // Try to parse ISO 8601 format first
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try to parse YYYY-MM-DD or YYYY/MM/DD
  const dateOnlyRegex = /^\d{4}[-/]\d{2}[-/]\d{2}$/;
  if (dateOnlyRegex.test(dateString)) {
    const parts = dateString.split(/[-/]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const day = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }

  // Try to parse YYYY-MM or YYYY/MM
  const monthOnlyRegex = /^\d{4}[-/]\d{2}$/;
  if (monthOnlyRegex.test(dateString)) {
    const parts = dateString.split(/[-/]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    return new Date(Date.UTC(year, month, 1));
  }

  // If all parsing attempts fail, return null
  return null;
}

/**
 * Parses a date range string in "YYYY-MM-DD - YYYY-MM-DD" format.
 * Returns DateRange object with parsed start and end dates, or null if parsing fails.
 *
 * @param dateRangeString - The date range string to parse
 * @returns DateRange object with start and end dates, or null if parsing fails
 *
 * @example
 * ```typescript
 * // Valid date range
 * getDateRangeFromString("2023-10-01 - 2023-10-07");
 * // Output:
 * // {
 * //   startDate: Date("2023-10-01T00:00:00.000Z"),
 * //   endDate: Date("2023-10-07T00:00:00.000Z")
 * // }
 *
 * // Different date formats
 * getDateRangeFromString("2023/10/01 - 2023/10/31");
 * // Output:
 * // {
 * //   startDate: Date("2023-10-01T00:00:00.000Z"),
 * //   endDate: Date("2023-10-31T00:00:00.000Z")
 * // }
 *
 * // Invalid formats
 * getDateRangeFromString("2023-10-01"); // null (missing end date)
 * getDateRangeFromString("invalid - range"); // null (invalid dates)
 * getDateRangeFromString("2023-10-01 to 2023-10-07"); // null (wrong separator)
 * ```
 */
export function getDateRangeFromString(
  dateRangeString: string
): DateRange | null {
  const parts = dateRangeString.split(" - ");
  if (parts.length !== 2) {
    return null;
  }

  const startDate = parseDateString(parts[0]);
  const endDate = parseDateString(parts[1]);

  if (!startDate || !endDate) {
    return null;
  }

  return {
    startDate,
    endDate,
  };
}

/**
 * Sets a date to the end of the day (23:59:59.999).
 * Returns a new Date object without modifying the original.
 *
 * @param date - The Date object to set to end of day
 * @returns New Date object set to end of the same day
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 * const endOfDay = getDateEndOfDate(date);
 * // Output: Date("2023-10-15T23:59:59.999Z")
 *
 * const morningDate = new Date("2023-10-15T09:15:30Z");
 * const endOfMorningDay = getDateEndOfDate(morningDate);
 * // Output: Date("2023-10-15T23:59:59.999Z")
 *
 * // Original date remains unchanged
 * console.log(date); // Still "2023-10-15T14:30:25.123Z"
 * ```
 */
export function getDateEndOfDate(date: Date): Date {
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

/**
 * Sets a date to the start of the day (00:00:00.000).
 * Returns a new Date object without modifying the original.
 *
 * @param date - The Date object to set to start of day
 * @returns New Date object set to start of the same day
 *
 * @example
 * ```typescript
 * const date = new Date("2023-10-15T14:30:25.123Z");
 * const startOfDay = getDateStartOfDate(date);
 * // Output: Date("2023-10-15T00:00:00.000Z")
 *
 * const nightDate = new Date("2023-10-15T23:45:30Z");
 * const startOfNightDay = getDateStartOfDate(nightDate);
 * // Output: Date("2023-10-15T00:00:00.000Z")
 *
 * // Original date remains unchanged
 * console.log(date); // Still "2023-10-15T14:30:25.123Z"
 * ```
 */
export function getDateStartOfDate(date: Date): Date {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}
