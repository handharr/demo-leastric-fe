import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { DeviceModel } from "@/features/device/domain/entities/device-model";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";
import { DeviceDataSource } from "@/features/device/infrastructure/data-source/device-data-source";
import { Logger } from "@/shared/utils/logger/logger";
import { getDeviceType } from "@/features/device/utils/device-helper";

export class DeviceRepositoryImpl implements DeviceRepository {
  constructor(private dataSource: DeviceDataSource) {}

  async getDevice({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<DeviceModel | BaseErrorModel> {
    Logger.info("DeviceRepositoryImpl", "getDevice", pathParam);
    const result = await this.dataSource.getDeviceDetails({
      deviceId: Number(pathParam.deviceId),
    });

    if (isErrorResponse(result)) {
      Logger.error("DeviceRepositoryImpl", "getDevice", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("DeviceRepositoryImpl", "getDevice", result);

    if (result.flash?.type === "success" && result.data?.device) {
      return {
        id: optional(result.data?.device?.id).orZero(),
        deviceName: optional(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optional(result.data?.device?.deviceType).orEmpty()
        ),
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

    Logger.info("DeviceRepositoryImpl", "getAllDevices", result);

    if (isErrorResponse(result)) {
      Logger.info("DeviceRepositoryImpl", "getAllDevices", result);
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.devices) {
      const devices = optional(result.data?.devices).orEmpty();
      Logger.info("DeviceRepositoryImpl", "getAllDevices success", devices);
      return devices.map((device) => ({
        id: optional(device.id).orZero(),
        deviceName: optional(device.deviceName).orEmpty(),
        deviceType: getDeviceType(optional(device.deviceType).orEmpty()),
        tariffGroup: optional(device.tariffGroup).orEmpty(),
        location: optional(device.location).orEmpty(),
        subLocation: optional(device.subLocation).orEmpty(),
        detailLocation: optional(device.detailLocation).orEmpty(),
      }));
    }

    Logger.error("DeviceRepositoryImpl", "getAllDevices error", result);

    return createErrorModel({
      message: "Unexpected error",
      details: optional(result.flash?.message).orDefault("Unexpected error"),
      type: "UNEXPECTED",
    });
  }

  async createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const result = await this.dataSource.createDevice({
      deviceData,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.device) {
      return {
        id: optional(result.data?.device?.id).orZero(),
        deviceName: optional(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optional(result.data?.device?.deviceType).orEmpty()
        ),
        tariffGroup: optional(result.data?.device?.tariffGroup).orEmpty(),
        location: optional(result.data?.device?.location).orEmpty(),
        subLocation: optional(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optional(result.data?.device?.detailLocation).orEmpty(),
      };
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optional(result.flash?.message).orDefault("Unexpected error"),
      type: "UNEXPECTED",
    });
  }

  async updateDevice({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const result = await this.dataSource.updateDeviceDetails({
      deviceId: Number(pathParam.deviceId),
      deviceData,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.device) {
      return {
        id: optional(result.data?.device?.id).orZero(),
        deviceName: optional(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optional(result.data?.device?.deviceType).orEmpty()
        ),
        tariffGroup: optional(result.data?.device?.tariffGroup).orEmpty(),
        location: optional(result.data?.device?.location).orEmpty(),
        subLocation: optional(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optional(result.data?.device?.detailLocation).orEmpty(),
      };
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optional(result.flash?.message).orDefault("Unexpected error"),
      type: "UNEXPECTED",
    });
  }

  async deleteDevice({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<string | BaseErrorModel> {
    const result = await this.dataSource.deleteDevice({
      deviceId: Number(pathParam.deviceId),
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.message) {
      return result.data.message;
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optional(result.flash?.message).orDefault("Unexpected error"),
      type: "UNEXPECTED",
    });
  }
}
