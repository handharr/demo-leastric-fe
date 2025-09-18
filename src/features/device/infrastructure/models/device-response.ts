export interface DeviceResponse {
  id?: number;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  lastOnline?: string;
}

export interface DeviceMqttDataResponse {
  devid?: string;
  vR?: number;
  vS?: number;
  vT?: number;
  vRS?: number;
  vST?: number;
  vRT?: number;
  iR?: number;
  iS?: number;
  iT?: number;
  pR?: number;
  pS?: number;
  pT?: number;
  sR?: number;
  sS?: number;
  sT?: number;
  qR?: number;
  qS?: number;
  qT?: number;
  pfR?: number;
  pfS?: number;
  pfT?: number;
  curkWhR?: number;
  curkWhS?: number;
  curkWhT?: number;
  tkWhR?: number;
  tkWhS?: number;
  tkWhT?: number;
  tkVAhR?: number;
  tkVAhS?: number;
  tkVAhT?: number;
  tkVArhR?: number;
  tkVArhS?: number;
  tkVArhT?: number;
}

export interface DeviceStatusResponse {
  device?: DeviceResponse;
  isOnline?: boolean;
  lastSeen?: string;
  mqttData?: DeviceMqttDataResponse;
}

export interface GetDevicesStatusResponse {
  devices?: DeviceStatusResponse[];
  summary?: {
    total: number;
    online: number;
    offline: number;
  };
}

export interface CreateDeviceResponse {
  device?: DeviceResponse;
}

export interface GetDevicesResponse {
  devices?: [DeviceResponse];
}

export interface GetDeviceResponse {
  device?: DeviceResponse;
}

export interface UpdateDeviceResponse {
  device?: DeviceResponse;
}

export interface DeleteDeviceResponse {
  message?: string;
}
