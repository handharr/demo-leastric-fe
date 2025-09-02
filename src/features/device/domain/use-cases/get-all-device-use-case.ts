import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { DeviceRepository } from "@/features/device/domain/repositories/device-repository";
import { GetDevicesModel } from "@/features/device/domain/entities/device-model";
import { RemoteDeviceDataSource } from "@/features/device/infrastructure/data-source/remote-device-data-source";
import { DeviceRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/device-repository-impl";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { GetAllDevicesQueryParams } from "@/features/device/domain/params/query-params";

export class GetAllDevicesUseCase {
  constructor(
    private deviceRepository: DeviceRepository = new DeviceRepositoryImpl(
      new RemoteDeviceDataSource()
    )
  ) {}

  async execute({
    queryParam,
  }: {
    queryParam: GetAllDevicesQueryParams;
  }): Promise<GetDevicesModel | BaseErrorModel> {
    try {
      const devices = await this.deviceRepository.getAllDevices({ queryParam });
      Logger.info("GetAllDevicesUseCase", "execute success");
      return devices;
    } catch (error) {
      Logger.info("GetAllDevicesUseCase", "execute error", error);
      return createErrorModel({
        message: "Failed to get all devices",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
