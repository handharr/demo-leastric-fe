import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";

export class GetAllDevicesUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute(): Promise<DeviceModel[] | BaseErrorModel> {
    try {
      const devices = await this.deviceRepository.getAllDevices();
      return devices;
    } catch (error) {
      console.error("Failed to get all devices:", error);
      return createErrorModel({
        message: "Failed to get all devices",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
