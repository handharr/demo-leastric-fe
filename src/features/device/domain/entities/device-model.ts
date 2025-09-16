import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { DeviceType } from "@/shared/domain/enum/enums";
export interface DeviceModel {
  id: number;
  deviceName: string;
  deviceType: DeviceType;
  tariffGroup: string;
  location: string;
  subLocation: string;
  detailLocation: string;

  power?: string;
  status?: string;
  phase?: string;
}

export interface GetDevicesModel {
  devices: DeviceModel[];
  pagination: PaginationModel;
}

export const deviceModelDummies = [
  {
    id: 1,
    deviceName: "Device 1",
    deviceType: DeviceType.SinglePhase,
    tariffGroup: "R1",
    location: "Location 1",
    subLocation: "Sub-location 1",
    detailLocation: "Detail location 1",
    power: "1000",
    status: "Active",
    phase: "Phase 1",
  },
  {
    id: 2,
    deviceName: "Device 2",
    deviceType: DeviceType.ThreePhase,
    tariffGroup: "R2",
    location: "Location 2",
    subLocation: "Sub-location 2",
    detailLocation: "Detail location 2",
    power: "2000",
    status: "Inactive",
    phase: "Phase 2",
  },
  {
    id: 3,
    deviceName: "Device 3",
    deviceType: DeviceType.SinglePhase,
    tariffGroup: "R1",
    location: "Location 3",
    subLocation: "Sub-location 3",
    detailLocation: "Detail location 3",
    power: "1500",
    status: "Active",
    phase: "Phase 1",
  },
  {
    id: 4,
    deviceName: "Device 4",
    deviceType: DeviceType.ThreePhase,
    tariffGroup: "R2",
    location: "Location 4",
    subLocation: "Sub-location 4",
    detailLocation: "Detail location 4",
    power: "2500",
    status: "Inactive",
    phase: "Phase 2",
  },
  {
    id: 5,
    deviceName: "Device 5",
    deviceType: DeviceType.SinglePhase,
    tariffGroup: "R1",
    location: "Location 5",
    subLocation: "Sub-location 5",
    detailLocation: "Detail location 5",
    power: "3000",
    status: "Active",
    phase: "Phase 1",
  },
];
