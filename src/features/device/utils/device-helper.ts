import { DeviceType } from "@/features/device/domain/entities/device-types";

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
