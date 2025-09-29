import {
  ElectricityUsageModel,
  PeriodValueModel,
} from "@/features/summary/domain/entities/summary-models";
import { TimePeriod } from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfYear,
} from "@/shared/utils/helpers/date-helpers";

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
}): { period: string; value: number | null; comparedValue: number | null }[] {
  if (!currentData) return [];
  const mergedData = currentData.map((currentItem, index) => {
    const lastItem = lastData?.[index];
    return {
      period: getXAxisLabelForPeriod({ period, value: currentItem.period }),
      value: currentItem.totalKwh,
      comparedValue: lastItem ? lastItem.totalKwh : null,
    };
  });
  return mergedData;
}

export function getStartAndEndDateFormattedUTCWithoutMsFromYear(year: number) {
  const dateRange = getStartAndEndDateOfYear(year);

  return {
    startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
    endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
  };
}
