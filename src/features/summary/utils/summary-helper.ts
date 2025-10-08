import {
  ElectricityUsageModel,
  PeriodValueModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  EnergyUnit,
  RealTimeInterval,
  TimePeriod,
} from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getDateRangeFromString,
  getStartAndEndDateOfYear,
  getTimeStringFromDate,
  parseDateString,
  substractDateBySeconds,
} from "@/shared/utils/helpers/date-helpers";
import { RealTimeDataPoint } from "@/features/summary/presentation/types/ui";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

/**
 * Aggregates electricity usage data by grouping and summing values for the same period.
 *
 * @param usageData - Array of electricity usage models to aggregate
 * @returns Array of aggregated period value models sorted by period
 *
 * @example
 * ```typescript
 * const input = [
 *   { period: "2023-10-01", totalKwh: 5.2, totalEstBilling: 1.5, avgVoltage: 220 },
 *   { period: "2023-10-01", totalKwh: 3.8, totalEstBilling: 1.1, avgVoltage: 225 },
 *   { period: "2023-10-02", totalKwh: 4.5, totalEstBilling: 1.3, avgVoltage: 222 }
 * ];
 *
 * const result = aggregateElectricityUsageByPeriod(input);
 * // Output:
 * // [
 * //   { period: "2023-10-01", totalKwh: 9.0, totalEstBilling: 2.6, avgVoltage: 222.5 },
 * //   { period: "2023-10-02", totalKwh: 4.5, totalEstBilling: 1.3, avgVoltage: 222 }
 * // ]
 * ```
 */
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

/**
 * Gets the legend label for the current period in chart displays.
 *
 * @param period - The time period type
 * @returns Formatted legend label string
 *
 * @example
 * ```typescript
 * getLegendLabelForPeriod(TimePeriod.Daily); // "This month"
 * getLegendLabelForPeriod(TimePeriod.Weekly); // "This month"
 * getLegendLabelForPeriod(TimePeriod.Monthly); // "This year"
 * getLegendLabelForPeriod(TimePeriod.Yearly); // "This year"
 * ```
 */
export function getLegendLabelForPeriod(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
    case TimePeriod.Weekly:
      return "This month";
    default:
      return "This year";
  }
}

/**
 * Gets the legend label for the comparison period in chart displays.
 *
 * @param period - The time period type
 * @returns Formatted comparison legend label string
 *
 * @example
 * ```typescript
 * getComparedLegendLabelForPeriod(TimePeriod.Daily); // "Last month"
 * getComparedLegendLabelForPeriod(TimePeriod.Weekly); // "Last month"
 * getComparedLegendLabelForPeriod(TimePeriod.Monthly); // "Last year"
 * getComparedLegendLabelForPeriod(TimePeriod.Yearly); // "Last year"
 * ```
 */
export function getComparedLegendLabelForPeriod(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
    case TimePeriod.Weekly:
      return "Last month";
    default:
      return "Last year";
  }
}

/**
 * Generates X-Axis label based on selected period and period value for chart displays.
 * Formats period strings into short, readable chart labels.
 *
 * @param params - Object containing period type and value
 * @param params.period - The time period type (Daily, Weekly, Monthly, Yearly)
 * @param params.value - The period value string to format
 * @returns Formatted string for chart X-Axis label
 *
 * @example
 * ```typescript
 * // Daily period
 * getXAxisLabelForPeriod({ period: TimePeriod.Daily, value: "2023-10-01" }); // "01"
 * getXAxisLabelForPeriod({ period: TimePeriod.Daily, value: "2023-10-15" }); // "15"
 *
 * // Weekly period
 * getXAxisLabelForPeriod({ period: TimePeriod.Weekly, value: "2025-09-28 - 2025-10-04" }); // "W1"
 * getXAxisLabelForPeriod({ period: TimePeriod.Weekly, value: "2025-10-05 - 2025-10-11" }); // "W2"
 *
 * // Monthly period
 * getXAxisLabelForPeriod({ period: TimePeriod.Monthly, value: "2023-10" }); // "Oct"
 * getXAxisLabelForPeriod({ period: TimePeriod.Monthly, value: "2023-01" }); // "Jan"
 *
 * // Yearly period (fallback)
 * getXAxisLabelForPeriod({ period: TimePeriod.Yearly, value: "2023" }); // "2023"
 * ```
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
      // Extract week number from "2025-09-28 - 2025-10-04"
      // Return as "W{n}"
      const dateRange = getDateRangeFromString(value);
      if (dateRange) {
        const weekNumber = getWeekNumber(dateRange.startDate);
        return `W${weekNumber}`;
      }
      return value; // Fallback to original value if parsing fails
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

/**
 * Helper function to get week number within a month (1-5).
 * Calculates which week of the month a given date falls into.
 *
 * @param date - The date to calculate week number for
 * @returns Week number within the month (1-5)
 *
 * @example
 * ```typescript
 * getWeekNumber(new Date("2023-10-01")); // 1 (first week)
 * getWeekNumber(new Date("2023-10-08")); // 2 (second week)
 * getWeekNumber(new Date("2023-10-15")); // 3 (third week)
 * getWeekNumber(new Date("2023-10-31")); // 5 (fifth week)
 * ```
 */
function getWeekNumber(date: Date): number {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const weekNumber = Math.ceil((date.getDate() + startOfMonth.getDay()) / 7);
  return weekNumber;
}

/**
 * Merges current and last period data for comparison charts.
 * Aligns data points by period labels and handles missing data with undefined values.
 * Filters out future dates from current data and provides full period coverage on X-axis.
 *
 * @param params - Object containing current data, last data, period type, and electricity unit
 * @param params.currentData - Array of current period values
 * @param params.lastData - Array of last period values (nullable)
 * @param params.period - The time period type for proper alignment
 * @param params.electricityUnit - The unit of electricity measurement (default: KWH)
 * @returns Array of merged data objects with current and comparison values
 *
 * @example
 * ```typescript
 * const currentData = [
 *   { period: "2023-10-01", totalKwh: 5.2, avgVoltage: 220, avgCurrent: 2.5, avgRealPower: 550 },
 *   { period: "2023-10-02", totalKwh: 4.8, avgVoltage: 225, avgCurrent: 2.3, avgRealPower: 517 }
 * ];
 * const lastData = [
 *   { period: "2023-09-01", totalKwh: 4.5, avgVoltage: 218, avgCurrent: 2.1, avgRealPower: 458 },
 *   { period: "2023-09-03", totalKwh: 3.9, avgVoltage: 222, avgCurrent: 1.9, avgRealPower: 422 }
 * ];
 *
 * // Using KWH (default)
 * const resultKwh = mergeCurrentAndLastPeriodData({
 *   currentData,
 *   lastData,
 *   period: TimePeriod.Daily,
 *   electricityUnit: EnergyUnit.KWH
 * });
 * // Output:
 * // [
 * //   { period: "01", value: 5.2, comparedValue: 4.5 },
 * //   { period: "02", value: 4.8, comparedValue: undefined },
 * //   { period: "03", value: undefined, comparedValue: 3.9 },
 * //   ... // continues for all days in month
 * // ]
 *
 * // Using Voltage
 * const resultVolt = mergeCurrentAndLastPeriodData({
 *   currentData,
 *   lastData,
 *   period: TimePeriod.Daily,
 *   electricityUnit: EnergyUnit.Volt
 * });
 * // Output:
 * // [
 * //   { period: "01", value: 220, comparedValue: 218 },
 * //   { period: "02", value: 225, comparedValue: undefined },
 * //   { period: "03", value: undefined, comparedValue: 222 },
 * //   ... // continues for all days in month
 * // ]
 *
 * // Using Current
 * const resultAmpere = mergeCurrentAndLastPeriodData({
 *   currentData,
 *   lastData,
 *   period: TimePeriod.Daily,
 *   electricityUnit: EnergyUnit.Ampere
 * });
 * // Output:
 * // [
 * //   { period: "01", value: 2.5, comparedValue: 2.1 },
 * //   { period: "02", value: 2.3, comparedValue: undefined },
 * //   { period: "03", value: undefined, comparedValue: 1.9 },
 * //   ... // continues for all days in month
 * // ]
 *
 * // Using Power
 * const resultWatt = mergeCurrentAndLastPeriodData({
 *   currentData,
 *   lastData,
 *   period: TimePeriod.Daily,
 *   electricityUnit: EnergyUnit.Watt
 * });
 * // Output:
 * // [
 * //   { period: "01", value: 550, comparedValue: 458 },
 * //   { period: "02", value: 517, comparedValue: undefined },
 * //   { period: "03", value: undefined, comparedValue: 422 },
 * //   ... // continues for all days in month
 * // ]
 * ```
 */
export function mergeCurrentAndLastPeriodData({
  currentData,
  lastData,
  period,
  electricityUnit = EnergyUnit.KWH,
}: {
  currentData: PeriodValueModel[];
  lastData: PeriodValueModel[] | null;
  period: TimePeriod;
  electricityUnit: EnergyUnit;
}): {
  period: string;
  value: number | undefined;
  comparedValue: number | undefined;
}[] {
  if (!currentData) return [];
  const _currentData = currentData.filter((item) => item.totalKwh >= 0);
  const _lastData = optionalValue(lastData)
    .orEmptyArray()
    .filter((item) => item.totalKwh >= 0);

  // For daily period, we need special handling to align months with different day counts
  if (period === TimePeriod.Daily) {
    return mergeDailyDataWithAlignment(
      _currentData,
      _lastData,
      electricityUnit
    );
  }

  if (period === TimePeriod.Monthly) {
    return mergeMonthlyDataWithAlignment(
      _currentData,
      _lastData,
      electricityUnit
    );
  }

  if (period === TimePeriod.Weekly) {
    return mergeWeeklyDataWithAlignment(
      _currentData,
      _lastData,
      electricityUnit
    );
  }

  // For non-daily periods, use the original logic
  const mergedData: {
    period: string;
    value: number | undefined;
    comparedValue: number | undefined;
  }[] = _currentData.map((currentItem) => {
    return {
      period: getXAxisLabelForPeriod({ period, value: currentItem.period }),
      value: currentItem.totalKwh,
      comparedValue: undefined,
    };
  });

  if (_lastData && _lastData.length > 0) {
    _lastData.forEach((lastItem) => {
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

/**
 * Helper function to merge weekly data with proper alignment for chart display.
 * Filters data to show only current month's weeks and excludes future dates.
 * Always shows all possible weeks (W1-W5) on X-axis for consistent UX.
 *
 * @param currentData - Array of current period weekly data
 * @param lastData - Array of comparison period weekly data
 * @param electricityUnit - The unit of electricity measurement (default: KWH)
 * @returns Array of merged weekly data with proper alignment
 *
 * @example
 * ```typescript
 * const currentData = [
 *   { period: "2025-10-01 - 2025-10-07", totalKwh: 15.2, avgVoltage: 220, avgCurrent: 10.5, avgRealPower: 2310 }, // W1
 *   { period: "2025-10-08 - 2025-10-14", totalKwh: 18.5, avgVoltage: 225, avgCurrent: 12.1, avgRealPower: 2722 }  // W2
 * ];
 * const lastData = [
 *   { period: "2025-09-02 - 2025-09-08", totalKwh: 14.1, avgVoltage: 218, avgCurrent: 9.8, avgRealPower: 2136 }, // W1
 *   { period: "2025-09-23 - 2025-09-29", totalKwh: 16.8, avgVoltage: 222, avgCurrent: 11.2, avgRealPower: 2486 }  // W4
 * ];
 *
 * // Using KWH (default)
 * const resultKwh = mergeWeeklyDataWithAlignment(currentData, lastData, EnergyUnit.KWH);
 * // Output (assuming today is 2025-10-15):
 * // [
 * //   { period: "W1", value: 15.2, comparedValue: 14.1 },
 * //   { period: "W2", value: 18.5, comparedValue: undefined },
 * //   { period: "W3", value: undefined, comparedValue: undefined },
 * //   { period: "W4", value: undefined, comparedValue: 16.8 },
 * //   { period: "W5", value: undefined, comparedValue: undefined }
 * // ]
 *
 * // Using Voltage
 * const resultVolt = mergeWeeklyDataWithAlignment(currentData, lastData, EnergyUnit.Volt);
 * // Output (assuming today is 2025-10-15):
 * // [
 * //   { period: "W1", value: 220, comparedValue: 218 },
 * //   { period: "W2", value: 225, comparedValue: undefined },
 * //   { period: "W3", value: undefined, comparedValue: undefined },
 * //   { period: "W4", value: undefined, comparedValue: 222 },
 * //   { period: "W5", value: undefined, comparedValue: undefined }
 * // ]
 *
 * // Using Current
 * const resultAmpere = mergeWeeklyDataWithAlignment(currentData, lastData, EnergyUnit.Ampere);
 * // Output (assuming today is 2025-10-15):
 * // [
 * //   { period: "W1", value: 10.5, comparedValue: 9.8 },
 * //   { period: "W2", value: 12.1, comparedValue: undefined },
 * //   { period: "W3", value: undefined, comparedValue: undefined },
 * //   { period: "W4", value: undefined, comparedValue: 11.2 },
 * //   { period: "W5", value: undefined, comparedValue: undefined }
 * // ]
 *
 * // Using Power
 * const resultWatt = mergeWeeklyDataWithAlignment(currentData, lastData, EnergyUnit.Watt);
 * // Output (assuming today is 2025-10-15):
 * // [
 * //   { period: "W1", value: 2310, comparedValue: 2136 },
 * //   { period: "W2", value: 2722, comparedValue: undefined },
 * //   { period: "W3", value: undefined, comparedValue: undefined },
 * //   { period: "W4", value: undefined, comparedValue: 2486 },
 * //   { period: "W5", value: undefined, comparedValue: undefined }
 * // ]
 * ```
 */
function mergeWeeklyDataWithAlignment(
  currentData: PeriodValueModel[],
  lastData: PeriodValueModel[],
  electricityUnit: EnergyUnit = EnergyUnit.KWH
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

  // Create maps for both current and last data by week number for quick lookup
  const currentDataMap = new Map<string, number>();
  const lastDataMap = new Map<string, number>();

  // Collect all unique week labels from both datasets
  const allWeekLabels = new Set<string>();

  // Filter current data to only include dates from current month and <= today
  const filteredCurrentData = currentData.filter((item) => {
    const dateRange = getDateRangeFromString(item.period);
    if (!dateRange) return false;

    // Check if the week overlaps with the current month and is not in the future
    return (
      (dateRange.startDate.getMonth() === currentMonth ||
        dateRange.endDate.getMonth() === currentMonth) &&
      dateRange.endDate <= today
    );
  });

  filteredCurrentData.forEach((item) => {
    const dateRange = getDateRangeFromString(item.period);
    if (dateRange) {
      const weekNumber = getWeekNumber(dateRange.startDate);
      const weekLabel = `W${weekNumber}`;
      switch (electricityUnit) {
        case EnergyUnit.KWH:
          currentDataMap.set(weekLabel, item.totalKwh);
          break;
        case EnergyUnit.Ampere:
          currentDataMap.set(weekLabel, item.avgCurrent);
          break;
        case EnergyUnit.Volt:
          currentDataMap.set(weekLabel, item.avgVoltage);
          break;
        case EnergyUnit.Watt:
          currentDataMap.set(weekLabel, item.avgRealPower);
          break;
      }
      allWeekLabels.add(weekLabel);
    }
  });

  // Process last data (comparison data)
  lastData.forEach((item) => {
    const dateRange = getDateRangeFromString(item.period);
    if (dateRange) {
      const weekNumber = getWeekNumber(dateRange.startDate);
      const weekLabel = `W${weekNumber}`;
      switch (electricityUnit) {
        case EnergyUnit.KWH:
          lastDataMap.set(weekLabel, item.totalKwh);
          break;
        case EnergyUnit.Ampere:
          lastDataMap.set(weekLabel, item.avgCurrent);
          break;
        case EnergyUnit.Volt:
          lastDataMap.set(weekLabel, item.avgVoltage);
          break;
        case EnergyUnit.Watt:
          lastDataMap.set(weekLabel, item.avgRealPower);
          break;
      }
      allWeekLabels.add(weekLabel);
    }
  });

  // Always include all weeks of the month (1-5) on X-axis for better UX
  // This ensures the X-axis shows the full month even when comparison is disabled
  for (let week = 1; week <= 5; week++) {
    const weekLabel = `W${week}`;
    allWeekLabels.add(weekLabel);
  }

  // Convert to array and sort by week number
  const sortedWeekLabels = Array.from(allWeekLabels).sort((a, b) => {
    const weekA = parseInt(a.replace("W", ""));
    const weekB = parseInt(b.replace("W", ""));
    return weekA - weekB;
  });

  // Create merged data for all weeks from both periods
  const mergedData = sortedWeekLabels.map((weekLabel) => {
    return {
      period: weekLabel,
      value: currentDataMap.get(weekLabel), // Will be undefined if week doesn't exist in current month or is in the future
      comparedValue: lastDataMap.get(weekLabel), // Will be undefined if week doesn't exist in last month
    };
  });

  return mergedData;
}

/**
 * Helper function to merge monthly data with proper alignment for chart display.
 * Filters data to show only current year's months and excludes future dates.
 * Always shows all months (Jan-Dec) on X-axis for consistent UX.
 *
 * @param currentData - Array of current year monthly data
 * @param lastData - Array of comparison year monthly data
 * @param electricityUnit - The unit of electricity measurement (default: KWH)
 * @returns Array of merged monthly data with proper alignment
 *
 * @example
 * ```typescript
 * const currentData = [
 *   { period: "2023-01", totalKwh: 150.2, avgVoltage: 220, avgCurrent: 45.5, avgRealPower: 10010 },
 *   { period: "2023-03", totalKwh: 180.5, avgVoltage: 225, avgCurrent: 52.1, avgRealPower: 11722 }
 * ];
 * const lastData = [
 *   { period: "2022-01", totalKwh: 140.1, avgVoltage: 218, avgCurrent: 42.8, avgRealPower: 9330 },
 *   { period: "2022-02", totalKwh: 165.8, avgVoltage: 222, avgCurrent: 48.9, avgRealPower: 10856 }
 * ];
 *
 * // Using KWH (default)
 * const resultKwh = mergeMonthlyDataWithAlignment(currentData, lastData, EnergyUnit.KWH);
 * // Output (assuming today is 2023-03-15):
 * // [
 * //   { period: "Jan", value: 150.2, comparedValue: 140.1 },
 * //   { period: "Feb", value: undefined, comparedValue: 165.8 },
 * //   { period: "Mar", value: 180.5, comparedValue: undefined },
 * //   { period: "Apr", value: undefined, comparedValue: undefined },
 * //   ... // continues for all months
 * // ]
 *
 * // Using Voltage
 * const resultVolt = mergeMonthlyDataWithAlignment(currentData, lastData, EnergyUnit.Volt);
 * // Output (assuming today is 2023-03-15):
 * // [
 * //   { period: "Jan", value: 220, comparedValue: 218 },
 * //   { period: "Feb", value: undefined, comparedValue: 222 },
 * //   { period: "Mar", value: 225, comparedValue: undefined },
 * //   { period: "Apr", value: undefined, comparedValue: undefined },
 * //   ... // continues for all months
 * // ]
 *
 * // Using Current
 * const resultAmpere = mergeMonthlyDataWithAlignment(currentData, lastData, EnergyUnit.Ampere);
 * // Output (assuming today is 2023-03-15):
 * // [
 * //   { period: "Jan", value: 45.5, comparedValue: 42.8 },
 * //   { period: "Feb", value: undefined, comparedValue: 48.9 },
 * //   { period: "Mar", value: 52.1, comparedValue: undefined },
 * //   { period: "Apr", value: undefined, comparedValue: undefined },
 * //   ... // continues for all months
 * // ]
 *
 * // Using Power
 * const resultWatt = mergeMonthlyDataWithAlignment(currentData, lastData, EnergyUnit.Watt);
 * // Output (assuming today is 2023-03-15):
 * // [
 * //   { period: "Jan", value: 10010, comparedValue: 9330 },
 * //   { period: "Feb", value: undefined, comparedValue: 10856 },
 * //   { period: "Mar", value: 11722, comparedValue: undefined },
 * //   { period: "Apr", value: undefined, comparedValue: undefined },
 * //   ... // continues for all months
 * // ]
 * ```
 */
function mergeMonthlyDataWithAlignment(
  currentData: PeriodValueModel[],
  lastData: PeriodValueModel[],
  electricityUnit: EnergyUnit = EnergyUnit.KWH
): {
  period: string;
  value: number | undefined;
  comparedValue: number | undefined;
}[] {
  // Get today's date for filtering
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today to include today
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0 = January, 11 = December)
  // Create maps for both current and last data by month number for quick lookup
  const currentDataMap = new Map<string, number>();
  const lastDataMap = new Map<string, number>();
  // Collect all unique month labels from both datasets
  const allMonthLabels = new Set<string>();
  // Filter current data to only include dates from current year and <= today
  const filteredCurrentData = currentData.filter((item) => {
    const itemDate = optionalValue(parseDateString(item.period)).orToday(); // Append day to create valid date
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth();
    // Must be same year as today, and not in the future
    return itemYear === currentYear && itemMonth <= currentMonth;
  });
  filteredCurrentData.forEach((item) => {
    const monthLabel = getXAxisLabelForPeriod({
      period: TimePeriod.Monthly,
      value: item.period,
    });
    switch (electricityUnit) {
      case EnergyUnit.KWH:
        currentDataMap.set(monthLabel, item.totalKwh);
        break;
      case EnergyUnit.Ampere:
        currentDataMap.set(monthLabel, item.avgCurrent);
        break;
      case EnergyUnit.Volt:
        currentDataMap.set(monthLabel, item.avgVoltage);
        break;
      case EnergyUnit.Watt:
        currentDataMap.set(monthLabel, item.avgRealPower);
        break;
    }
    allMonthLabels.add(monthLabel);
  });
  // Process last data (comparison data)
  lastData.forEach((item) => {
    const monthLabel = getXAxisLabelForPeriod({
      period: TimePeriod.Monthly,
      value: item.period,
    });
    switch (electricityUnit) {
      case EnergyUnit.KWH:
        lastDataMap.set(monthLabel, item.totalKwh);
        break;
      case EnergyUnit.Ampere:
        lastDataMap.set(monthLabel, item.avgCurrent);
        break;
      case EnergyUnit.Volt:
        lastDataMap.set(monthLabel, item.avgVoltage);
        break;
      case EnergyUnit.Watt:
        lastDataMap.set(monthLabel, item.avgRealPower);
        break;
    }
    allMonthLabels.add(monthLabel);
  });
  // Always include all months of the year (1-12) on X-axis for better UX
  // This ensures the X-axis shows the full year even when comparison is disabled
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 1);
    const monthLabel = date.toLocaleString("default", { month: "short" }); // e.g., "Jan"
    allMonthLabels.add(monthLabel);
  }
  // Convert to array and sort by month order
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const sortedMonthLabels = Array.from(allMonthLabels).sort((a, b) => {
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });
  // Create merged data for all months from both periods
  return sortedMonthLabels.map((monthLabel) => {
    return {
      period: monthLabel,
      value: currentDataMap.get(monthLabel), // Will be undefined if month doesn't exist in current year or is in the future
      comparedValue: lastDataMap.get(monthLabel), // Will be undefined if month doesn't exist in last year
    };
  });
}

/**
 * Helper function to merge daily data with proper alignment for chart display.
 * Ensures day 1 of current month aligns with day 1 of comparison month.
 * Filters data to show only current month's days and excludes future dates.
 * Always shows all days of current month on X-axis for consistent UX.
 *
 * @param currentData - Array of current month daily data
 * @param lastData - Array of comparison month daily data
 * @param electricityUnit - The unit of electricity measurement (default: KWH)
 * @returns Array of merged daily data with proper day alignment
 *
 * @example
 * ```typescript
 * const currentData = [
 *   { period: "2023-10-01", totalKwh: 5.2, avgVoltage: 220, avgCurrent: 2.5, avgRealPower: 550 },
 *   { period: "2023-10-02", totalKwh: 4.8, avgVoltage: 225, avgCurrent: 2.3, avgRealPower: 517 },
 *   { period: "2023-10-04", totalKwh: 6.1, avgVoltage: 218, avgCurrent: 2.8, avgRealPower: 610 }
 * ];
 * const lastData = [
 *   { period: "2023-09-01", totalKwh: 4.5, avgVoltage: 222, avgCurrent: 2.1, avgRealPower: 466 },
 *   { period: "2023-09-02", totalKwh: 5.1, avgVoltage: 219, avgCurrent: 2.4, avgRealPower: 525 },
 *   { period: "2023-09-03", totalKwh: 3.9, avgVoltage: 223, avgCurrent: 1.9, avgRealPower: 423 }
 * ];
 *
 * // Using KWH (default)
 * const resultKwh = mergeDailyDataWithAlignment(currentData, lastData, EnergyUnit.KWH);
 * // Output (assuming today is 2023-10-05):
 * // [
 * //   { period: "01", value: 5.2, comparedValue: 4.5 },
 * //   { period: "02", value: 4.8, comparedValue: 5.1 },
 * //   { period: "03", value: undefined, comparedValue: 3.9 },
 * //   { period: "04", value: 6.1, comparedValue: undefined },
 * //   { period: "05", value: undefined, comparedValue: undefined },
 * //   ... // continues for all days in current month
 * // ]
 *
 * // Using Voltage
 * const resultVolt = mergeDailyDataWithAlignment(currentData, lastData, EnergyUnit.Volt);
 * // Output (assuming today is 2023-10-05):
 * // [
 * //   { period: "01", value: 220, comparedValue: 222 },
 * //   { period: "02", value: 225, comparedValue: 219 },
 * //   { period: "03", value: undefined, comparedValue: 223 },
 * //   { period: "04", value: 218, comparedValue: undefined },
 * //   { period: "05", value: undefined, comparedValue: undefined },
 * //   ... // continues for all days in current month
 * // ]
 *
 * // Using Current
 * const resultAmpere = mergeDailyDataWithAlignment(currentData, lastData, EnergyUnit.Ampere);
 * // Output (assuming today is 2023-10-05):
 * // [
 * //   { period: "01", value: 2.5, comparedValue: 2.1 },
 * //   { period: "02", value: 2.3, comparedValue: 2.4 },
 * //   { period: "03", value: undefined, comparedValue: 1.9 },
 * //   { period: "04", value: 2.8, comparedValue: undefined },
 * //   { period: "05", value: undefined, comparedValue: undefined },
 * //   ... // continues for all days in current month
 * // ]
 *
 * // Using Power
 * const resultWatt = mergeDailyDataWithAlignment(currentData, lastData, EnergyUnit.Watt);
 * // Output (assuming today is 2023-10-05):
 * // [
 * //   { period: "01", value: 550, comparedValue: 466 },
 * //   { period: "02", value: 517, comparedValue: 525 },
 * //   { period: "03", value: undefined, comparedValue: 423 },
 * //   { period: "04", value: 610, comparedValue: undefined },
 * //   { period: "05", value: undefined, comparedValue: undefined },
 * //   ... // continues for all days in current month
 * // ]
 * ```
 */
function mergeDailyDataWithAlignment(
  currentData: PeriodValueModel[],
  lastData: PeriodValueModel[],
  electricityUnit: EnergyUnit = EnergyUnit.KWH
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
    switch (electricityUnit) {
      case EnergyUnit.KWH:
        currentDataMap.set(dayLabel, item.totalKwh);
        break;
      case EnergyUnit.Ampere:
        currentDataMap.set(dayLabel, item.avgCurrent);
        break;
      case EnergyUnit.Volt:
        currentDataMap.set(dayLabel, item.avgVoltage);
        break;
      case EnergyUnit.Watt:
        currentDataMap.set(dayLabel, item.avgRealPower);
        break;
    }
    allDayLabels.add(dayLabel);
  });

  // Process last data (comparison data)
  lastData.forEach((item) => {
    const dayLabel = getXAxisLabelForPeriod({
      period: TimePeriod.Daily,
      value: item.period,
    });
    switch (electricityUnit) {
      case EnergyUnit.KWH:
        lastDataMap.set(dayLabel, item.totalKwh);
        break;
      case EnergyUnit.Ampere:
        lastDataMap.set(dayLabel, item.avgCurrent);
        break;
      case EnergyUnit.Volt:
        lastDataMap.set(dayLabel, item.avgVoltage);
        break;
      case EnergyUnit.Watt:
        lastDataMap.set(dayLabel, item.avgRealPower);
        break;
    }
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

/**
 * Gets formatted start and end dates for a given year in UTC format without milliseconds.
 *
 * @param year - The year to get date range for
 * @returns Object containing formatted start and end date strings
 *
 * @example
 * ```typescript
 * const result = getStartAndEndDateFormattedUTCWithoutMsFromYear(2023);
 * // Output:
 * // {
 * //   startDate: "2023-01-01T00:00:00Z",
 * //   endDate: "2023-12-31T23:59:59Z"
 * // }
 * ```
 */
export function getStartAndEndDateFormattedUTCWithoutMsFromYear(year: number) {
  const dateRange = getStartAndEndDateOfYear(year);

  return {
    startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
    endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
  };
}

/**
 * Gets a human-readable label for real-time data intervals.
 *
 * @param interval - The interval in seconds
 * @returns Formatted string describing the interval
 *
 * @example
 * ```typescript
 * getLabelFromRealTimeInterval(10); // "10 seconds"
 * getLabelFromRealTimeInterval(15); // "15 seconds"
 * getLabelFromRealTimeInterval(30); // "30 seconds"
 * getLabelFromRealTimeInterval(60); // "60 seconds"
 * getLabelFromRealTimeInterval(45); // "45 seconds"
 * ```
 */
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

/**
 * Converts kilowatt-hours (kWh) to watts (W).
 *
 * @param kwh - The energy value in kilowatt-hours
 * @returns The power value in watts, or undefined if input is undefined
 *
 * @example
 * ```typescript
 * convertKwhToWatt(1.5); // 1500
 * convertKwhToWatt(0.5); // 500
 * convertKwhToWatt(2.25); // 2250
 * convertKwhToWatt(undefined); // undefined
 * ```
 */
export function convertKwhToWatt(kwh: number | undefined): number | undefined {
  if (kwh === undefined) return undefined;
  return kwh * 1000;
}

/**
 * Maps electricity usage data to real-time data points for chart visualization.
 * Creates time series data with negative time offsets from the latest point (time 0).
 * Converts kWh values to watts for real-time display.
 *
 * @param usageData - Array of electricity usage models
 * @param interval - The time interval between data points in seconds
 * @returns Array of real-time data points with time and usage values
 *
 * @example
 * ```typescript
 * const usageData = [
 *   { totalKwh: 1.2 }, // oldest
 *   { totalKwh: 1.5 },
 *   { totalKwh: 1.8 }  // newest
 * ];
 *
 * const result = mapUsageDataToRealTimeDataPoints(usageData, 10);
 * // Output:
 * // [
 * //   { time: "-20", usage: 1200 }, // oldest (20 seconds ago)
 * //   { time: "-10", usage: 1500 }, // middle (10 seconds ago)
 * //   { time: "0", usage: 1800 }    // newest (now)
 * // ]
 * ```
 */
export function mapUsageDataToRealTimeDataPoints(
  usageData: ElectricityUsageModel[],
  interval: RealTimeInterval
): RealTimeDataPoint[] {
  if (!usageData || usageData.length === 0) {
    return [];
  }

  /// For time, the latest is 0, and the oldest is
  /// when the length is 0 the time is 0
  /// when the length is 1 the time is -10, 0
  /// when the length is 2 the time is -20, -10, 0
  /// the max usageData length is 10, so when the length is 10 the time from right to left will be:
  /// -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0
  return usageData.map((usage, index) => ({
    time: (-1 * (interval * (usageData.length - 1 - index))).toString(), // in seconds
    usage: optionalValue(convertKwhToWatt(usage.totalKwh)).orZero(), // in watt (kwh to watt)
  }));
}

/**
 * Gets a formatted time string from a date after subtracting specified seconds.
 * If seconds is 0, returns the time string from the original date.
 * Handles negative seconds by taking absolute value.
 *
 * @param date - The base date to subtract from
 * @param seconds - Number of seconds to subtract (negative values become positive)
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * const baseDate = new Date("2023-10-15T14:30:00");
 *
 * getDateStringAfterSubstractingSeconds(baseDate, 0); // "14:30:00"
 * getDateStringAfterSubstractingSeconds(baseDate, 60); // "14:29:00"
 * getDateStringAfterSubstractingSeconds(baseDate, 3600); // "13:30:00"
 * getDateStringAfterSubstractingSeconds(baseDate, -60); // "14:29:00" (negative becomes positive)
 * ```
 */
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
