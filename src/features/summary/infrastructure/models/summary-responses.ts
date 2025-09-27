export interface UsageSummaryResponse {
  estUsage?: number; // in kWh
  estBill?: number; // in local currency
  totalCO2Emission?: number; // in kgCO2e
  deviceStatus?: {
    activeDevices?: number;
    inactiveDevices?: number;
    totalDevices?: number;
  };
}

export interface ElectricityUsageResponse {
  deviceId?: string;
  deviceName?: string;
  deviceType?: string; // e.g., "three_phase"
  period?: string; // e.g., "2025-01"
  value?: number; // e.g., 1234.567
  unit?: string; // e.g., "kWh"
  avgVoltage?: number; // e.g., 220.5
  avgVoltageLine?: number; // e.g., 380.2
  avgCurrent?: number; // e.g., 15.8
  avgRealPower?: number; // e.g., 3200.5
  totalKwh?: number; // e.g., 1234.567
  totalEstBilling?: number; // e.g., 1500000
  totalCO2Emission?: number; // e.g., 250.75
}

export interface GetUsageSummaryResponse {
  summaries?: {
    threePhase?: UsageSummaryResponse;
    singlePhase?: UsageSummaryResponse;
  };
}

export interface GetElectricityUsageResponse {
  usage?: ElectricityUsageResponse[];
}
