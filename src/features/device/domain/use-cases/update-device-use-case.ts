import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { DeviceModel } from "@/features/device/domain/entities/device-model";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote-device-data-source";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/core/domain/entities/base-error-model";
import { UpdateDeviceFormData } from "@/features/device/domain/params/data-params";
import { ErrorType } from "@/core/domain/enums/base-enum";

export class UpdateDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    try {
      const updatedDevice = await this.deviceRepository.updateDevice({
        pathParam,
        deviceData,
      });
      return updatedDevice;
    } catch (error) {
      console.error("Failed to update device:", error);
      return createErrorModel({
        message: "Failed to update device",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
