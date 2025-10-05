import { TimePeriod } from "@/shared/domain/enum/enums";
import { DateRange } from "@/shared/domain/entities/shared-models";

export function formatDateToStringUTCWithoutMs(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

export function getStartAndEndDateOfYear(year: number): DateRange {
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // January 1st
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // December 31st

  return {
    startDate,
    endDate,
  };
}

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

/// Get range of current month dates starting from 1 to current date
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

export function get10YearsRangeFromCurrentYear(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let i = 0; i < 10; i++) {
    years.push((currentYear - i).toString());
  }

  return years;
}

/// Get date string with format String
/// YYYY-MM-DD for default
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

// Substract date by seconds
export function substractDateBySeconds(date: Date, seconds: number): Date {
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() - seconds);
  return newDate;
}

// Get date string eg: 19:45:30
export function getTimeStringFromDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

// Convert date string to Date object with some possibility format
// Supported format: YYYY-MM-DD, YYYY/MM/DD, YYYY-MM, YYYY/MM/DDTHH:mm:ssZ
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

// Get date range from "YYYY-MM-DD - YYYY-MM-DD"
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

// Get date end of date
export function getDateEndOfDate(date: Date): Date {
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

// Get date start of date
export function getDateStartOfDate(date: Date): Date {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}
