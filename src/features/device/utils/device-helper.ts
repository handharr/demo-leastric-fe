import { DeviceType } from "@/features/device/domain/entities/device-model";

export function getDeviceTypeLabel(deviceType: DeviceType): string {
  switch (deviceType) {
    case DeviceType.SinglePhase:
      return "Single Phase";
    case DeviceType.ThreePhase:
      return "Three Phase";
    default:
      return "Unknown";
  }
}

export function getDeviceType(stringType: string): DeviceType {
  switch (stringType) {
    case "Single Phase":
      return DeviceType.SinglePhase;
    case "Three Phase":
      return DeviceType.ThreePhase;
    default:
      throw new Error(`Unknown device type: ${stringType}`);
  }
}
