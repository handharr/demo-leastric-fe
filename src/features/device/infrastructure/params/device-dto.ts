export interface CreateDeviceDto {
  deviceName?: string;
  deviceType?: string;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
}

export interface UpdateDeviceDto {
  deviceName?: string;
  deviceType?: string;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
}
