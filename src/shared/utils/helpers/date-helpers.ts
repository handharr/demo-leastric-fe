import { TimePeriod } from "@/shared/domain/enum/enums";
import { DateRange } from "@/shared/domain/entities/models";

export function formatDateToStringUTCWithoutMs(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
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
