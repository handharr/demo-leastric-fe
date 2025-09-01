import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { DeviceModel } from "@/features/device/domain/entities/device-model";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote-device-data-source";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";

export class GetDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<DeviceModel | BaseErrorModel> {
    try {
      const device = await this.deviceRepository.getDevice({ pathParam });
      Logger.info("GetDeviceUseCase", "Successfully retrieved device:", device);
      return device;
    } catch (error) {
      Logger.error("GetDeviceUseCase", "Failed to get device:", error);
      return createErrorModel({
        message: "Failed to get device",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
