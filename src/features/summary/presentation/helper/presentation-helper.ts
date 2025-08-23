import { TimePeriod } from "@/features/summary/presentation/types/ui";

export function getTimePeriodPastLabel(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
      return "Yesterday";
    case TimePeriod.Weekly:
      return "Last week";
    case TimePeriod.Monthly:
      return "Last month";
    default:
      return "";
  }
}

export function getTimePeriodCurrentLabel(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
      return "Today";
    case TimePeriod.Weekly:
      return "This week";
    case TimePeriod.Monthly:
      return "This month";
    default:
      return "";
  }
}
