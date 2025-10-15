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

export interface GetElectricityUsageHistoryQueryParams {
  period?: string; // Yearly, monthly, daily, weekly
  unit?: string; // kWh, Watt, Volt, Ampere
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  page?: number; // Page number for pagination
  size?: number; // Number of items per page
}

export interface GetExportToCsvQueryParams {
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export interface GetDevicesCurrentMqttLogQueryParams {
  location?: string; // e.g., "Building A"
}

export interface GetGeneratePdfReportQueryParams {
  startDate?: string;
  endDate?: string;
  companyName?: string;
}
