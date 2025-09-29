import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { DeviceType, EnergyUnit } from "@/shared/domain/enum/enums";

export interface UsageSummaryModel {
  estUsage: number; // in kWh
  estBill: number; // in local currency
  totalCO2Emission: number; // in kgCO2e
  deviceStatus: {
    activeDevices: number;
    inactiveDevices: number;
    totalDevices: number;
  };
}

export interface ElectricityUsageModel {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType; // e.g., "three_phase"
  period: string; // e.g., "2025-01"
  value: number; // e.g., 1234.567
  unit: EnergyUnit; // e.g., "kWh"
  avgVoltage: number; // e.g., 220.5
  avgVoltageLine: number; // e.g., 380.2
  avgCurrent: number; // e.g., 15.8
  avgRealPower: number; // e.g., 3200.5
  totalKwh: number; // e.g., 1234.567
  totalEstBilling: number; // e.g., 1500000
  totalCO2Emission: number; // e.g., 250.75
}

export interface GetElectricityUsageModel {
  usage: {
    data: ElectricityUsageModel[];
  };
}

export interface GetElectricityUsageHistoryModel {
  usage: {
    data: ElectricityUsageModel[];
  };
  pagination: PaginationModel;
}

export interface GetUsageSummaryModel {
  threePhase: UsageSummaryModel;
  singlePhase: UsageSummaryModel;
}

export interface PeriodValueModel {
  period: string;
  avgVoltage: number;
  avgVoltageLine: number;
  avgCurrent: number;
  avgRealPower: number;
  totalKwh: number;
  totalEstBilling: number;
  totalCO2Emission: number;
}

export interface DeviceUsageData {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  data: PeriodValueModel[];
}
