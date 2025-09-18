import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import {
  DeviceModel,
  GetDevicesModel,
  GetDevicesStatusModel,
} from "@/features/device/domain/entities/device-model";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";
import { DeviceDataSource } from "@/features/device/infrastructure/data-source/device-data-source";
import { Logger } from "@/shared/utils/logger/logger";
import { getDeviceType } from "@/features/device/utils/device-helper";
import {
  mapCreateDeviceFormDataToDto,
  mapUpdateDeviceFormDataToDto,
} from "@/features/device/domain/mapper/device-params-mapper";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { GetAllDevicesQueryParams } from "@/features/device/domain/params/query-params";
import { DeviceType } from "@/shared/domain/enum/enums";

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
        id: optionalValue(result.data?.device?.id).orZero(),
        deviceId: optionalValue(result.data?.device?.deviceId).orEmpty(),
        deviceName: optionalValue(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optionalValue(result.data?.device?.deviceType).orEmpty()
        ),
        tariffGroup: optionalValue(result.data?.device?.tariffGroup).orEmpty(),
        location: optionalValue(result.data?.device?.location).orEmpty(),
        subLocation: optionalValue(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optionalValue(
          result.data?.device?.detailLocation
        ).orEmpty(),
        createdAt: optionalValue(result.data?.device?.createdAt).orEmpty(),
        updatedAt: optionalValue(result.data?.device?.updatedAt).orEmpty(),
        deletedAt: optionalValue(result.data?.device?.deletedAt).orEmpty(),
        lastOnline: optionalValue(result.data?.device?.lastOnline).orEmpty(),
      };
    } else {
      return createErrorModel({
        message: "Unexpected error",
        details: optionalValue(result.flash?.message).orDefault(
          "Unexpected error"
        ),
        type: ErrorType.UNEXPECTED,
      });
    }
  }

  async getAllDevices({
    queryParam,
  }: {
    queryParam: GetAllDevicesQueryParams;
  }): Promise<GetDevicesModel | BaseErrorModel> {
    const result = await this.dataSource.getAllDevices({
      params: { ...queryParam },
    });

    Logger.info("DeviceRepositoryImpl", "getAllDevices", result);

    if (isErrorResponse(result)) {
      Logger.info("DeviceRepositoryImpl", "getAllDevices error", result);
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.devices) {
      const devices = optionalValue(result.data?.devices).orEmptyArray();
      Logger.info(
        "DeviceRepositoryImpl",
        "getAllDevices success with devices:",
        devices
      );
      const mappedDevices = devices.map((device) => ({
        id: optionalValue(device.id).orZero(),
        deviceId: optionalValue(device.deviceId).orEmpty(),
        deviceName: optionalValue(device.deviceName).orEmpty(),
        deviceType: getDeviceType(optionalValue(device.deviceType).orEmpty()),
        tariffGroup: optionalValue(device.tariffGroup).orEmpty(),
        location: optionalValue(device.location).orEmpty(),
        subLocation: optionalValue(device.subLocation).orEmpty(),
        detailLocation: optionalValue(device.detailLocation).orEmpty(),
        createdAt: optionalValue(device.createdAt).orEmpty(),
        updatedAt: optionalValue(device.updatedAt).orEmpty(),
        deletedAt: optionalValue(device.deletedAt).orEmpty(),
        lastOnline: optionalValue(device.lastOnline).orEmpty(),
      }));

      Logger.info(
        "DeviceRepositoryImpl",
        "getAllDevices success pagination",
        result.meta
      );

      return {
        devices: mappedDevices,
        pagination: {
          page: Number(optionalValue(result.meta?.page).orEmpty()),
          take: Number(optionalValue(result.meta?.take).orEmpty()),
          itemCount: optionalValue(result.meta?.itemCount).orZero(),
          pageCount: optionalValue(result.meta?.pageCount).orZero(),
          hasPreviousPage: optionalValue(
            result.meta?.hasPreviousPage
          ).orFalse(),
          hasNextPage: optionalValue(result.meta?.hasNextPage).orFalse(),
          size: Number(optionalValue(result.meta?.size).orEmpty()),
        },
      };
    }

    Logger.error("DeviceRepositoryImpl", "getAllDevices error", result);

    return createErrorModel({
      message: "Unexpected error",
      details: optionalValue(result.flash?.message).orDefault(
        "Unexpected error"
      ),
      type: ErrorType.UNEXPECTED,
    });
  }

  async createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const deviceDto = mapCreateDeviceFormDataToDto(deviceData);
    const result = await this.dataSource.createDevice({
      deviceData: deviceDto,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.device) {
      return {
        id: optionalValue(result.data?.device?.id).orZero(),
        deviceId: optionalValue(result.data?.device?.deviceId).orEmpty(),
        deviceName: optionalValue(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optionalValue(result.data?.device?.deviceType).orEmpty()
        ),
        tariffGroup: optionalValue(result.data?.device?.tariffGroup).orEmpty(),
        location: optionalValue(result.data?.device?.location).orEmpty(),
        subLocation: optionalValue(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optionalValue(
          result.data?.device?.detailLocation
        ).orEmpty(),
        createdAt: optionalValue(result.data?.device?.createdAt).orEmpty(),
        updatedAt: optionalValue(result.data?.device?.updatedAt).orEmpty(),
        deletedAt: optionalValue(result.data?.device?.deletedAt).orEmpty(),
        lastOnline: optionalValue(result.data?.device?.lastOnline).orEmpty(),
      };
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optionalValue(result.flash?.message).orDefault(
        "Unexpected error"
      ),
      type: ErrorType.UNEXPECTED,
    });
  }

  async updateDevice({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    const deviceDto = mapUpdateDeviceFormDataToDto(deviceData);
    const result = await this.dataSource.updateDeviceDetails({
      deviceId: Number(pathParam.deviceId),
      deviceData: deviceDto,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.device) {
      return {
        id: optionalValue(result.data?.device?.id).orZero(),
        deviceId: optionalValue(result.data?.device?.deviceId).orEmpty(),
        deviceName: optionalValue(result.data?.device?.deviceName).orEmpty(),
        deviceType: getDeviceType(
          optionalValue(result.data?.device?.deviceType).orEmpty()
        ),
        tariffGroup: optionalValue(result.data?.device?.tariffGroup).orEmpty(),
        location: optionalValue(result.data?.device?.location).orEmpty(),
        subLocation: optionalValue(result.data?.device?.subLocation).orEmpty(),
        detailLocation: optionalValue(
          result.data?.device?.detailLocation
        ).orEmpty(),
        createdAt: optionalValue(result.data?.device?.createdAt).orEmpty(),
        updatedAt: optionalValue(result.data?.device?.updatedAt).orEmpty(),
        deletedAt: optionalValue(result.data?.device?.deletedAt).orEmpty(),
        lastOnline: optionalValue(result.data?.device?.lastOnline).orEmpty(),
      };
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optionalValue(result.flash?.message).orDefault(
        "Unexpected error"
      ),
      type: ErrorType.UNEXPECTED,
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
      details: optionalValue(result.flash?.message).orDefault(
        "Unexpected error"
      ),
      type: ErrorType.UNEXPECTED,
    });
  }

  async getDevicesStatus(): Promise<GetDevicesStatusModel | BaseErrorModel> {
    const result = await this.dataSource.getDevicesStatus();

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.flash?.type === "success" && result.data?.devices) {
      const statuses = optionalValue(result.data?.devices).orEmptyArray();
      const mappedStatuses = statuses.map((status) => ({
        device: status.device
          ? {
              id: optionalValue(status.device.id).orZero(),
              deviceId: optionalValue(status.device.deviceId).orEmpty(),
              deviceName: optionalValue(status.device.deviceName).orEmpty(),
              deviceType: getDeviceType(
                optionalValue(status.device.deviceType).orEmpty()
              ),
              tariffGroup: optionalValue(status.device.tariffGroup).orEmpty(),
              location: optionalValue(status.device.location).orEmpty(),
              subLocation: optionalValue(status.device.subLocation).orEmpty(),
              detailLocation: optionalValue(
                status.device.detailLocation
              ).orEmpty(),
              createdAt: optionalValue(status.device.createdAt).orEmpty(),
              updatedAt: optionalValue(status.device.updatedAt).orEmpty(),
              deletedAt: optionalValue(status.device.deletedAt).orEmpty(),
              lastOnline: optionalValue(status.device.lastOnline).orEmpty(),
            }
          : {
              id: 0,
              deviceId: "",
              deviceName: "",
              deviceType: DeviceType.SinglePhase,
              tariffGroup: "",
              location: "",
              subLocation: "",
              detailLocation: "",
              createdAt: "",
              updatedAt: "",
              deletedAt: "",
              lastOnline: "",
            },
        isOnline: optionalValue(status.isOnline).orFalse(),
        lastSeen: optionalValue(status.lastSeen).orEmpty(),
        mqttData: {
          devid: optionalValue(status.mqttData?.devid).orEmpty(),
          vR: optionalValue(status.mqttData?.vR).orZero(),
          vS: optionalValue(status.mqttData?.vS).orZero(),
          vT: optionalValue(status.mqttData?.vT).orZero(),
          vRS: optionalValue(status.mqttData?.vRS).orZero(),
          vST: optionalValue(status.mqttData?.vST).orZero(),
          vRT: optionalValue(status.mqttData?.vRT).orZero(),
          iR: optionalValue(status.mqttData?.iR).orZero(),
          iS: optionalValue(status.mqttData?.iS).orZero(),
          iT: optionalValue(status.mqttData?.iT).orZero(),
          pR: optionalValue(status.mqttData?.pR).orZero(),
          pS: optionalValue(status.mqttData?.pS).orZero(),
          pT: optionalValue(status.mqttData?.pT).orZero(),
          sR: optionalValue(status.mqttData?.sR).orZero(),
          sS: optionalValue(status.mqttData?.sS).orZero(),
          sT: optionalValue(status.mqttData?.sT).orZero(),
          qR: optionalValue(status.mqttData?.qR).orZero(),
          qS: optionalValue(status.mqttData?.qS).orZero(),
          qT: optionalValue(status.mqttData?.qT).orZero(),
          pfR: optionalValue(status.mqttData?.pfR).orZero(),
          pfS: optionalValue(status.mqttData?.pfS).orZero(),
          pfT: optionalValue(status.mqttData?.pfT).orZero(),
          curkWhR: optionalValue(status.mqttData?.curkWhR).orZero(),
          curkWhS: optionalValue(status.mqttData?.curkWhS).orZero(),
          curkWhT: optionalValue(status.mqttData?.curkWhT).orZero(),
          tkWhR: optionalValue(status.mqttData?.tkWhR).orZero(),
          tkWhS: optionalValue(status.mqttData?.tkWhS).orZero(),
          tkWhT: optionalValue(status.mqttData?.tkWhT).orZero(),
          tkVAhR: optionalValue(status.mqttData?.tkVAhR).orZero(),
          tkVAhS: optionalValue(status.mqttData?.tkVAhS).orZero(),
          tkVAhT: optionalValue(status.mqttData?.tkVAhT).orZero(),
          tkVArhR: optionalValue(status.mqttData?.tkVArhR).orZero(),
          tkVArhS: optionalValue(status.mqttData?.tkVArhS).orZero(),
          tkVArhT: optionalValue(status.mqttData?.tkVArhT).orZero(),
        },
      }));

      return {
        devices: mappedStatuses,
        summary: {
          total: optionalValue(result.data?.summary?.total).orZero(),
          online: optionalValue(result.data?.summary?.online).orZero(),
          offline: optionalValue(result.data?.summary?.offline).orZero(),
        },
      };
    }

    return createErrorModel({
      message: "Unexpected error",
      details: optionalValue(result.flash?.message).orDefault(
        "Unexpected error"
      ),
      type: ErrorType.UNEXPECTED,
    });
  }
}
