import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";
import { DeviceDataSource } from "@/features/device/infrastructure/data-source/interface";

export class DeviceRepositoryImpl implements DeviceRepository {
  constructor(private dataSource: DeviceDataSource) {}

  async getDeviceById({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<DeviceModel | BaseErrorModel> {
    const result = await this.dataSource.getDeviceDetails({
      deviceId: pathParam.deviceId,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (
      result.flash?.type === "success" &&
      result.data?.tokens?.access_token &&
      result.data?.tokens?.refresh_token
    ) {
      return {
        deviceName: optional(result.data?.device?.deviceName).orEmpty(),
        deviceType: optional(result.data?.device?.deviceType).orEmpty(),
        tariffGroup: optional(result.data?.device?.tariffGroup).orEmpty(),
        location: optional(result.data?.device?.location).orEmpty(),
        subLocation: optional(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optional(result.data?.device?.detailLocation).orEmpty(),
      };
    } else {
      return createErrorModel({
        message: "Unexpected error",
        details: optional(result.flash?.message).orDefault("Unexpected error"),
        type: "UNEXPECTED",
      });
    }
  }

  async getAllDevices(): Promise<DeviceModel[] | BaseErrorModel> {
    const result = await this.dataSource.getAllDevices();
    return isErrorResponse(result) ? createErrorModel(result) : result;
  }

  async createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const result = await this.dataSource.createDevice(deviceData);
    return isErrorResponse(result) ? createErrorModel(result) : result;
  }

  async updateDevice({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const result = await this.dataSource.updateDevice(pathParam, deviceData);
    return isErrorResponse(result) ? createErrorModel(result) : result;
  }

  async deleteDevice({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<boolean | BaseErrorModel> {
    const result = await this.dataSource.deleteDevice(pathParam);
    return isErrorResponse(result) ? createErrorModel(result) : result;
  }
}
