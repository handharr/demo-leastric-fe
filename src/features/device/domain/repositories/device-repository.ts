import {
  DeviceModel,
  GetDevicesModel,
} from "@/features/device/domain/entities/device-model";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";

export interface DeviceRepository {
  getDevice({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<DeviceModel | BaseErrorModel>;
  getAllDevices(): Promise<GetDevicesModel | BaseErrorModel>;
  createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel>;
  updateDevice({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel>;
  deleteDevice({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<string | BaseErrorModel>;
}
