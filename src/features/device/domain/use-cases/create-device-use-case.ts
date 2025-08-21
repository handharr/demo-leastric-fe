import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { CreateDeviceFormData } from "@/features/device/domain/params/data-params";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote";

export class CreateDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<DeviceModel | BaseErrorModel> {
    try {
      const result = await this.deviceRepository.createDevice({ deviceData });
      return result;
    } catch (error) {
      console.error("Failed to create device:", error);
      return createErrorModel({
        message: "Failed to create device",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
