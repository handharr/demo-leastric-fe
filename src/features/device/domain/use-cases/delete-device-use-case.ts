import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote-device-data-source";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export class DeleteDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute({
    pathParam,
  }: {
    pathParam: GetDevicePathParams;
  }): Promise<string | BaseErrorModel> {
    try {
      const result = await this.deviceRepository.deleteDevice({ pathParam });
      return result;
    } catch (error) {
      console.error("Failed to delete device:", error);
      return createErrorModel({
        message: "Failed to delete device",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
