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
