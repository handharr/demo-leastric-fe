import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { DeviceType } from "@/shared/domain/enum/enums";
export interface DeviceModel {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  tariffGroup: string;
  location: string;
  subLocation: string;
  detailLocation: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  lastOnline: string;

  power?: string;
  status?: string;
  phase?: string;
}

export interface DeviceMqttDataModel {
  devid: string;
  vR: number;
  vS: number;
  vT: number;
  vRS: number;
  vST: number;
  vRT: number;
  iR: number;
  iS: number;
  iT: number;
  pR: number;
  pS: number;
  pT: number;
  sR: number;
  sS: number;
  sT: number;
  qR: number;
  qS: number;
  qT: number;
  pfR: number;
  pfS: number;
  pfT: number;
  curkWhR: number;
  curkWhS: number;
  curkWhT: number;
  tkWhR: number;
  tkWhS: number;
  tkWhT: number;
  tkVAhR: number;
  tkVAhS: number;
  tkVAhT: number;
  tkVArhR: number;
  tkVArhS: number;
  tkVArhT: number;
}

export interface DeviceStatusModel {
  device: DeviceModel;
  isOnline: boolean;
  lastSeen: string;
  mqttData: DeviceMqttDataModel;
}

export interface GetDevicesStatusModel {
  devices: DeviceStatusModel[];
  summary: {
    total: number;
    online: number;
    offline: number;
  };
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
