import {
  GetElectricityUsageModel,
  PeriodValueData,
} from "@/features/summary/domain/entities/summary-models";

/**
 * Converts electricity usage data to aggregated period-value format
 * Aggregates all numeric values from devices (both three-phase and single-phase) for each period
 * @param electricityUsage - The electricity usage response data
 * @returns Array of period-value pairs with all aggregated numeric values across all devices
 */
export function convertToAggregatedPeriodicData(
  electricityUsage: GetElectricityUsageModel | null
): PeriodValueData[] {
  if (!electricityUsage?.usage) {
    return [];
  }

  // Step 1: Group all phases into one list
  const { threePhase = [], singlePhase = [] } = electricityUsage.usage;
  const allDevices = [...threePhase, ...singlePhase];

  // Step 2: Group by period and aggregate all numeric values
  const periodMap = new Map<
    string,
    {
      value: number;
      avgVoltage: number;
      avgVoltageLine: number;
      avgCurrent: number;
      avgRealPower: number;
      totalKwh: number;
      totalEstBilling: number;
      totalCO2Emission: number;
      deviceCount: number;
    }
  >();

  allDevices.forEach((device) => {
    const { period } = device;

    const currentData = periodMap.get(period) || {
      value: 0,
      avgVoltage: 0,
      avgVoltageLine: 0,
      avgCurrent: 0,
      avgRealPower: 0,
      totalKwh: 0,
      totalEstBilling: 0,
      totalCO2Emission: 0,
      deviceCount: 0,
    };

    // Sum totals and accumulate averages for later calculation
    periodMap.set(period, {
      value: currentData.value + (device.value || 0),
      avgVoltage: currentData.avgVoltage + (device.avgVoltage || 0),
      avgVoltageLine: currentData.avgVoltageLine + (device.avgVoltageLine || 0),
      avgCurrent: currentData.avgCurrent + (device.avgCurrent || 0),
      avgRealPower: currentData.avgRealPower + (device.avgRealPower || 0),
      totalKwh: currentData.totalKwh + (device.totalKwh || 0),
      totalEstBilling:
        currentData.totalEstBilling + (device.totalEstBilling || 0),
      totalCO2Emission:
        currentData.totalCO2Emission + (device.totalCO2Emission || 0),
      deviceCount: currentData.deviceCount + 1,
    });
  });

  // Convert to final format, calculate averages, and sort by period chronologically
  return Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      value: data.value,
      avgVoltage: data.deviceCount > 0 ? data.avgVoltage / data.deviceCount : 0,
      avgVoltageLine:
        data.deviceCount > 0 ? data.avgVoltageLine / data.deviceCount : 0,
      avgCurrent: data.deviceCount > 0 ? data.avgCurrent / data.deviceCount : 0,
      avgRealPower:
        data.deviceCount > 0 ? data.avgRealPower / data.deviceCount : 0,
      totalKwh: data.totalKwh,
      totalEstBilling: data.totalEstBilling,
      totalCO2Emission: data.totalCO2Emission,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
