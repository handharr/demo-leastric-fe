import { TimePeriod } from "@/shared/domain/enum/enums";
import { DateRange } from "@/shared/domain/entities/models";
export function getDateRangeByTimePeriod(timePeriod: TimePeriod): DateRange {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)
  const currentDate = now.getDate();

  switch (timePeriod) {
    case TimePeriod.Daily: {
      const startDate = new Date(
        currentYear,
        currentMonth,
        currentDate,
        0,
        0,
        0,
        0
      );
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
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }

    case TimePeriod.Weekly: {
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(
        currentYear,
        currentMonth,
        currentDate - currentDay,
        0,
        0,
        0,
        0
      );
      const endOfWeek = new Date(
        currentYear,
        currentMonth,
        currentDate - currentDay + 6,
        23,
        59,
        59,
        999
      );

      return {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      };
    }

    case TimePeriod.Monthly: {
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
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }

    case TimePeriod.Yearly: {
      const startDate = new Date(currentYear, 0, 1, 0, 0, 0, 0); // January 1st
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // December 31st

      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }

    default:
      throw new Error(`Unsupported time period: ${timePeriod}`);
  }
}
