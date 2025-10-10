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

export interface GetExportToCsvResponse {
  message?: string;
  fileUrl?: string;
  fileName?: string;
  recordCount?: number;
}

export interface DeviceCurrentMqttLogResponse {
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  location?: string;
  subLocation?: string | null;
  detailLocation?: string | null;
  lastReading?: string;
  totalKwh?: number;
  latestReadingData?: {
    voltage?: number;
    current?: number;
    activePower?: number;
    apparentPower?: number;
    powerFactor?: number;
    totalKwh?: number;
    currentKwh?: number;
    voltageData?: {
      vR?: number;
      vS?: number;
      vT?: number;
      vRS?: number;
      vST?: number;
      vRT?: number;
    };
    currentData?: {
      iR?: number;
      iS?: number;
      iT?: number;
    };
    activePowerData?: {
      pR?: number;
      pS?: number;
      pT?: number;
    };
    apparentPowerData?: {
      sR?: number;
      sS?: number;
      sT?: number;
    };
    reactivePowerData?: {
      qR?: number;
      qS?: number;
      qT?: number;
    };
    powerFactorData?: {
      pfR?: number;
      pfS?: number;
      pfT?: number;
    };
    totalEnergyData?: {
      tkWhR?: number;
      tkWhS?: number;
      tkWhT?: number;
      tkVAhR?: number;
      tkVAhS?: number;
      tkVAhT?: number;
      tkVArhR?: number;
      tkVArhS?: number;
      tkVArhT?: number;
    };
    currentKwhData?: {
      curkWhR?: number;
      curkWhS?: number;
      curkWhT?: number;
    };
  };
}

export interface GetDevicesCurrentMqttLogResponse {
  devices?: DeviceCurrentMqttLogResponse[];
}
