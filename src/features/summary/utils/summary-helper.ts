import {
  ElectricityUsageModel,
  PeriodValueData,
} from "@/features/summary/domain/entities/summary-models";

export function aggregateElectricityUsageByPeriod(
  usageData: ElectricityUsageModel[]
): PeriodValueData[] {
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
  const result: PeriodValueData[] = [];

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
