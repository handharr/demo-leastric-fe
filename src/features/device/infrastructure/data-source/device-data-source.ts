import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import {
  CreateDeviceResponse,
  DeleteDeviceResponse,
  GetDeviceResponse,
  GetDevicesResponse,
  UpdateDeviceResponse,
} from "@/features/device/infrastructure/models/device-response";
import {
  CreateDeviceDto,
  UpdateDeviceDto,
} from "@/features/device/infrastructure/params/device-dto";

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
    deviceData: UpdateDeviceDto;
  }): Promise<BaseResponse<UpdateDeviceResponse> | BaseErrorResponse>;

  deleteDevice({
    deviceId,
  }: {
    deviceId: number;
  }): Promise<BaseResponse<DeleteDeviceResponse> | BaseErrorResponse>;

  createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceDto;
  }): Promise<BaseResponse<CreateDeviceResponse> | BaseErrorResponse>;

  getAllDevices({
    params,
  }: {
    params?: Record<string, unknown>;
  }): Promise<BaseResponse<GetDevicesResponse> | BaseErrorResponse>;
}
