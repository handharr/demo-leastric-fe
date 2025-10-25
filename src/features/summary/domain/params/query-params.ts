export interface GetUsageSummaryQueryParams {
  month?: number;
  year?: number;
  location?: string; // e.g., "Building A"
}

export interface GetElectricityUsageQueryParams {
  period?: string; // Yearly, monthly, daily, weekly
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  location?: string; // e.g., "Building A"
  sortOrder?: "ASC" | "DESC"; // Sort order
}

export interface GetElectricityUsageHistoryQueryParams {
  period?: string; // Yearly, monthly, daily, weekly
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  page?: number; // Page number for pagination
  size?: number; // Number of items per page
  location?: string; // e.g., "Building A"
  sortOrder?: "ASC" | "DESC"; // Sort order
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
