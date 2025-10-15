import {
  BaseErrorModel,
  createErrorModel,
} from "@/core/domain/entities/base-error-model";
import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { GetDevicesStatusModel } from "@/features/device/domain/entities/device-model";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote-device-data-source";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";

export class GetDevicesStatusUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute(): Promise<GetDevicesStatusModel | BaseErrorModel> {
    try {
      const devicesStatus = await this.deviceRepository.getDevicesStatus();
      Logger.info("GetDevicesStatusUseCase", "execute success");
      return devicesStatus;
    } catch (error) {
      Logger.info("GetDevicesStatusUseCase", "execute error", error);
      return createErrorModel({
        message: "Failed to get devices status",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
