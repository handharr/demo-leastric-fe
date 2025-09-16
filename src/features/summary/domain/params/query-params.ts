export interface GetUsageSummaryQueryParams {
  month?: number;
  year?: number;
}

export interface GetElectricityUsageQueryParams {
  period?: string; // Yearly, monthly, daily, weekly
  unit?: string; // kWh, Watt, Volt, Ampere
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}
