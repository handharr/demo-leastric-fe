import { DeviceType } from "@/features/device/domain/entities/device-types";
export interface CreateDeviceFormData {
  deviceName?: string;
  deviceType?: DeviceType;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
}

export interface UpdateDeviceFormData {
  deviceName?: string;
  deviceType?: DeviceType;
  tariffGroup?: string;
  location?: string;
  subLocation?: string;
  detailLocation?: string;
}
