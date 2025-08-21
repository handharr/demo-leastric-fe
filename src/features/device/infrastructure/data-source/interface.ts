import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import {
  CreateDeviceResponse,
  DeleteDeviceResponse,
  GetDeviceResponse,
  GetDevicesResponse,
  UpdateDeviceResponse,
} from "@/features/device/infrastructure/model/device-types";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";

export interface DeviceDataSource {
  getDeviceDetails({
    deviceId,
  }: {
    deviceId: number;
  }): Promise<BaseResponse<GetDeviceResponse> | BaseErrorResponse>;

  updateDeviceDetails({
    deviceId,
    deviceData,
  }: {
    deviceId: number;
    deviceData: UpdateDeviceFormData;
  }): Promise<BaseResponse<UpdateDeviceResponse> | BaseErrorResponse>;

  deleteDevice({
    deviceId,
  }: {
    deviceId: number;
  }): Promise<BaseResponse<DeleteDeviceResponse> | BaseErrorResponse>;

  createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<BaseResponse<CreateDeviceResponse> | BaseErrorResponse>;

  getAllDevices(): Promise<
    BaseResponse<GetDevicesResponse> | BaseErrorResponse
  >;
}
