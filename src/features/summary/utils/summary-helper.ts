import {
  GetElectricityUsageModel,
  ElectricityUsageModel,
  PeriodValueData,
} from "@/features/summary/domain/entities/summary-models";

/**
 * Converts electricity usage data to a single aggregated period-value format
 * Sums all devices (both three-phase and single-phase) for each period
 * @param electricityUsage - The electricity usage response data
 * @param valueField - The field to extract as value (e.g., 'totalKwh', 'totalEstBilling', 'avgRealPower')
 * @returns Array of period-value pairs aggregated across all devices
 */
export function convertToAggregatedPeriodicData(
  electricityUsage: GetElectricityUsageModel | null,
  valueField: keyof Pick<
    ElectricityUsageModel,
    | "totalKwh"
    | "totalEstBilling"
    | "avgRealPower"
    | "avgVoltage"
    | "avgCurrent"
    | "totalCO2Emission"
    | "value"
  > = "totalKwh"
): PeriodValueData[] {
  console.log(
    "debugTest Converting electricity usage data:",
    electricityUsage,
    valueField
  );
  if (!electricityUsage?.usage) {
    return [];
  }

  // Step 1: Group all phases into one list
  const { threePhase = [], singlePhase = [] } = electricityUsage.usage;
  const allDevices = [...threePhase, ...singlePhase];

  // Step 2: Group by period and Step 3: sum values across all devices
  const periodMap = new Map<string, number>();

  allDevices.forEach((device) => {
    const { period } = device;
    const value = (device[valueField] as number) || 0;

    // Sum values for the same period
    const currentValue = periodMap.get(period) || 0;
    periodMap.set(period, currentValue + value);
  });

  console.log("debugTest Aggregated Period Map:", periodMap);

  // Convert to final format and sort by period chronologically
  return Array.from(periodMap.entries())
    .map(([period, value]) => ({ period, value }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
