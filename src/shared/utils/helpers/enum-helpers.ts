import { DeviceType, EnergyUnit, TimePeriod } from "@/shared/domain/enum/enums";

// convert raw energy unit string to enum
export function parseEnergyUnit(unit: string): EnergyUnit {
  switch (unit.toLowerCase()) {
    case "ampere":
      return EnergyUnit.Ampere;
    case "kwh":
      return EnergyUnit.KWH;
    case "volt":
      return EnergyUnit.Volt;
    case "watt":
      return EnergyUnit.Watt;
    default:
      return EnergyUnit.Watt;
  }
}

// Parse EnergyUnit from enum to string title
export function energyUnitToString(unit: EnergyUnit): string {
  switch (unit) {
    case EnergyUnit.Ampere:
      return "Ampere (A)";
    case EnergyUnit.KWH:
      return "Kilowatt-hour (kWh)";
    case EnergyUnit.Volt:
      return "Volt (V)";
    case EnergyUnit.Watt:
      return "Watt (W)";
  }
}

// convert raw device type string to enum
export function parseDeviceType(type: string): DeviceType {
  switch (type.toLowerCase()) {
    case "three_phase":
      return DeviceType.ThreePhase;
    default:
      return DeviceType.SinglePhase;
  }
}

// Parse DeviceType from enum to string title
export function deviceTypeToString(type: DeviceType): string {
  switch (type) {
    case DeviceType.ThreePhase:
      return "Three Phase";
    case DeviceType.SinglePhase:
      return "Single Phase";
  }
}

export function getTimePeriodPastLabel(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
      return "Yesterday";
    case TimePeriod.Weekly:
      return "Last week";
    case TimePeriod.Monthly:
      return "Last month";
    default:
      return "";
  }
}

export function getTimePeriodCurrentLabel(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
      return "Today";
    case TimePeriod.Weekly:
      return "This week";
    case TimePeriod.Monthly:
      return "This month";
    default:
      return "";
  }
}

export function getTimePeriodUnit(period: TimePeriod): string {
  switch (period) {
    case TimePeriod.Daily:
      return "Day";
    case TimePeriod.Weekly:
      return "Week";
    case TimePeriod.Monthly:
      return "Month";
    case TimePeriod.Yearly:
      return "Year";
    default:
      return "";
  }
}
