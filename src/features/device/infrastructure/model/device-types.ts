export interface DeviceResponse {
  deviceName?: string;
  deviceType?: string;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
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
