import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";
import {
  CreateDeviceDto,
  UpdateDeviceDto,
} from "@/features/device/infrastructure/params/device-dto";

export const mapCreateDeviceFormDataToDto = (
  formData: CreateDeviceFormData
): CreateDeviceDto => {
  return {
    deviceName: formData.deviceName,
    deviceType: formData.deviceType,
    tariffGroup: formData.tariffGroup,
    location: formData.location,
    subLocation: formData.subLocation,
    detailLocation: formData.detailLocation,
  };
};

export const mapUpdateDeviceFormDataToDto = (
  formData: UpdateDeviceFormData
): UpdateDeviceDto => {
  return {
    deviceName: formData.deviceName,
    deviceType: formData.deviceType,
    tariffGroup: formData.tariffGroup,
    location: formData.location,
    subLocation: formData.subLocation,
    detailLocation: formData.detailLocation,
  };
};
