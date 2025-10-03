import {
  ElectricityUsageModel,
  PeriodValueModel,
} from "@/features/summary/domain/entities/summary-models";
import { RealTimeInterval, TimePeriod } from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfYear,
  getTimeStringFromDate,
  substractDateBySeconds,
} from "@/shared/utils/helpers/date-helpers";
import { RealTimeDataPoint } from "../presentation/types/ui";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export function aggregateElectricityUsageByPeriod(
  usageData: ElectricityUsageModel[]
): PeriodValueModel[] {
  if (!usageData || usageData.length === 0) {
    return [];
  }

  const groupedData = new Map<string, ElectricityUsageModel[]>();

  // Group data by the existing period property
  usageData.forEach((usage) => {
    const periodKey = usage.period;

    if (!groupedData.has(periodKey)) {
      groupedData.set(periodKey, []);
    }
    groupedData.get(periodKey)!.push(usage);
  });

  // Aggregate grouped data
  const result: PeriodValueModel[] = [];

  groupedData.forEach((usages, periodKey) => {
    const totalKwh = usages.reduce(
      (sum, usage) => sum + (usage.totalKwh || 0),
      0
    );
    const totalEstBilling = usages.reduce(
      (sum, usage) => sum + (usage.totalEstBilling || 0),
      0
    );
    const totalCO2Emission = usages.reduce(
      (sum, usage) => sum + (usage.totalCO2Emission || 0),
      0
    );

    // Calculate averages for voltage, voltage line, current, and real power
    const avgVoltage =
      usages.reduce((sum, usage) => sum + (usage.avgVoltage || 0), 0) /
      usages.length;

    const avgVoltageLine =
      usages.reduce((sum, usage) => sum + (usage.avgVoltageLine || 0), 0) /
      usages.length;

    const avgCurrent =
      usages.reduce((sum, usage) => sum + (usage.avgCurrent || 0), 0) /
      usages.length;

    const avgRealPower =
      usages.reduce((sum, usage) => sum + (usage.avgRealPower || 0), 0) /
      usages.length;

    result.push({
      period: periodKey,
      avgVoltage,
      avgVoltageLine,
      avgCurrent,
      avgRealPower,
      totalKwh,
      totalEstBilling,
      totalCO2Emission,
    });
  });

  // Sort by period (assuming date string format can be sorted lexicographically)
  return result.sort((a, b) => a.period.localeCompare(b.period));
}

export function getLegendLabelForPeriod(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
    case TimePeriod.Weekly:
      return "This month";
    default:
      return "This year";
  }
}

export function getComparedLegendLabelForPeriod(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
    case TimePeriod.Weekly:
      return "Last month";
    default:
      return "Last year";
  }
}

/*
  Generate X-Axis label based on selected period and value
  Input: 
  - Daily: Usage "2023-10-01"
  - Monthly Usage "2023-10"
  - Weekly Usage "Week 3 - 2025-09"
  - Yearly (Ignored, as yearly data is not displayed in chart)
  returns formatted string for chart X-Axis label: 
  - Daily: "01"
  - Monthly: "Oct"
  - Weekly: "Week 3"
*/
export function getXAxisLabelForPeriod({
  period,
  value,
}: {
  period: TimePeriod;
  value: string;
}): string {
  switch (period) {
    case TimePeriod.Daily: {
      // Extract day from "2023-10-01"
      const date = new Date(value);
      return date.getDate().toString().padStart(2, "0");
    }
    case TimePeriod.Weekly: {
      // Extract week number from "Week 3 - 2025-09"
      const match = value.match(/Week (\d+)/);
      return match ? `W${match[1]}` : value;
    }
    case TimePeriod.Monthly: {
      // Extract month from "2023-10"
      const date = new Date(value + "-01"); // Append day to create valid date
      return date.toLocaleString("default", { month: "short" }); // e.g., "Oct"
    }
    default:
      return value; // For yearly or unknown periods, return the original value
  }
}

/*
  Function to merge current and last period data for comparison
  Input:
  - currentData: PeriodValueData[] for current period
  - lastData: PeriodValueData[] for last period
  - period: TimePeriod
  Output:
  - Merged array of objects with structure:
    {
      period: string; // x-axis label from getXAxisLabelForPeriod
      value: number | null; // current period value
      comparedValue: number | null; // last period value
    }[]
*/
export function mergeCurrentAndLastPeriodData({
  currentData,
  lastData,
  period,
}: {
  currentData: PeriodValueModel[];
  lastData: PeriodValueModel[] | null;
  period: TimePeriod;
}): {
  period: string;
  value: number | undefined;
  comparedValue: number | undefined;
}[] {
  if (!currentData) return [];

  // For daily period, we need special handling to align months with different day counts
  if (period === TimePeriod.Daily) {
    return mergeDailyDataWithAlignment(currentData, lastData || []);
  }

  // For non-daily periods, use the original logic
  const mergedData: {
    period: string;
    value: number | undefined;
    comparedValue: number | undefined;
  }[] = currentData.map((currentItem) => {
    return {
      period: getXAxisLabelForPeriod({ period, value: currentItem.period }),
      value: currentItem.totalKwh,
      comparedValue: undefined,
    };
  });

  if (lastData && lastData.length > 0) {
    lastData.forEach((lastItem) => {
      const periodLabel = getXAxisLabelForPeriod({
        period,
        value: lastItem.period,
      });
      const existingIndex = mergedData.findIndex(
        (item) => item.period === periodLabel
      );
      if (existingIndex !== -1) {
        // If exists, update comparedValue
        mergedData[existingIndex].comparedValue = lastItem.totalKwh;
      } else {
        // If not exists, add new entry with null value
        mergedData.push({
          period: periodLabel,
          value: undefined,
          comparedValue: lastItem.totalKwh,
        });
      }
    });
  }
  return mergedData;
}

/*
  Helper function to merge daily data with proper alignment for months with different day counts
  This ensures that day 1 of current month aligns with day 1 of last month, etc.
  Shows all days from both current and comparison months, with appropriate undefined values
  Filters out future dates from current data (only shows dates <= today)
  Always shows full month X-axis (1-31) even when comparison is disabled
*/
function mergeDailyDataWithAlignment(
  currentData: PeriodValueModel[],
  lastData: PeriodValueModel[]
): {
  period: string;
  value: number | undefined;
  comparedValue: number | undefined;
}[] {
  // Get today's date for filtering
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today to include today

  // Get current month and year for filtering
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Create maps for both current and last data by day number for quick lookup
  const currentDataMap = new Map<string, number>();
  const lastDataMap = new Map<string, number>();

  // Collect all unique day labels from both datasets
  const allDayLabels = new Set<string>();

  // Filter current data to only include dates from current month and <= today
  const filteredCurrentData = currentData.filter((item) => {
    const itemDate = new Date(item.period);
    const itemMonth = itemDate.getMonth();
    const itemYear = itemDate.getFullYear();

    // Must be same month and year as today, and not in the future
    return (
      itemYear === currentYear &&
      itemMonth === currentMonth &&
      itemDate <= today
    );
  });

  filteredCurrentData.forEach((item) => {
    const dayLabel = getXAxisLabelForPeriod({
      period: TimePeriod.Daily,
      value: item.period,
    });
    currentDataMap.set(dayLabel, item.totalKwh);
    allDayLabels.add(dayLabel);
  });

  // Process last data (comparison data)
  lastData.forEach((item) => {
    const dayLabel = getXAxisLabelForPeriod({
      period: TimePeriod.Daily,
      value: item.period,
    });
    lastDataMap.set(dayLabel, item.totalKwh);
    allDayLabels.add(dayLabel);
  });

  // Always include all days of current month (1-31) on X-axis for better UX
  // This ensures the X-axis shows the full month even when comparison is disabled
  const daysInCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dayLabel = day.toString().padStart(2, "0");
    allDayLabels.add(dayLabel);
  }

  // Convert to array and sort numerically by day number
  const sortedDayLabels = Array.from(allDayLabels).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  // Create merged data for all days from both periods
  return sortedDayLabels.map((dayLabel) => {
    return {
      period: dayLabel,
      value: currentDataMap.get(dayLabel), // Will be undefined if day doesn't exist in current month or is in the future
      comparedValue: lastDataMap.get(dayLabel), // Will be undefined if day doesn't exist in last month
    };
  });
}

export function getStartAndEndDateFormattedUTCWithoutMsFromYear(year: number) {
  const dateRange = getStartAndEndDateOfYear(year);

  return {
    startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
    endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
  };
}

export function getLabelFromRealTimeInterval(interval: number): string {
  switch (interval) {
    case 10:
      return "10 seconds";
    case 15:
      return "15 seconds";
    case 30:
      return "30 seconds";
    case 60:
      return "60 seconds";
    default:
      return `${interval} seconds`;
  }
}

export function mapUsageDataToRealTimeDataPoints(
  usageData: ElectricityUsageModel[],
  interval: RealTimeInterval
): RealTimeDataPoint[] {
  if (!usageData || usageData.length === 0) {
    return [];
  }

  /// For time, the latest is 0, and the oldest is
  /// e.g., for 10 interval:
  /// when the length is 0 the time is 0
  /// when the length is 1 the time is -10, 0
  /// when the length is 2 the time is -20, -10, 0
  /// the max usageData length is 10, so when the length is 10 the time from right to left will be:
  /// -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0
  /// for 15 interval:
  /// when the length is 0 the time is 0
  /// when the length is 1 the time is -15, 0
  /// when the length is 2 the time is -30, -15, 0
  /// the max usageData length is 15, so when the length is 15 the time from right to left will be:
  /// -225, -210, -195, -180, -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0
  /// and so on for 30 and 60 interval
  return usageData.map((usage, index) => ({
    time: (-1 * (interval * (usageData.length - 1 - index))).toString(), // in seconds
    usage: optionalValue(usage.totalKwh).orZero(),
  }));
}

export function getDateStringAfterSubstractingSeconds(
  date: Date,
  seconds: number
): string {
  // If seconds is 0, return time string from date
  if (seconds === 0) {
    return getTimeStringFromDate(date);
  }
  // check seconds if less than 0 then give absolute value
  if (seconds < 0) {
    seconds = Math.abs(seconds);
  }
  const substractedDate = substractDateBySeconds(date, seconds);
  return getTimeStringFromDate(substractedDate);
}
