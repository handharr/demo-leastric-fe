import { DeviceType } from "@/shared/domain/enum/enums";

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
