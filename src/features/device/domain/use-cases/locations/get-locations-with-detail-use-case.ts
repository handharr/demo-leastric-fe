import { LocationsRepository } from "@/features/device/domain/repositories/locations-repository";
import { LocationModel } from "@/features/device/domain/entities/locations-models";
import { RemoteLocationsDataSource } from "@/features/device/infrastructure/data-source/remote-locations-data-source";
import { LocationsRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/locations-repository-impl";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/core/domain/entities/base-error-model";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";

export class GetLocationsWithDetailUseCase {
  constructor(
    private locationsRepository: LocationsRepository = new LocationsRepositoryImpl(
      new RemoteLocationsDataSource()
    )
  ) {}

  async execute(): Promise<LocationModel[] | BaseErrorModel> {
    try {
      const locationsWithDetail =
        await this.locationsRepository.getLocationsWithDetail();
      Logger.info(
        "GetLocationsWithDetailUseCase",
        "Successfully retrieved locations with detail:",
        locationsWithDetail
      );
      return locationsWithDetail;
    } catch (error) {
      Logger.error(
        "GetLocationsWithDetailUseCase",
        "Failed to get locations with detail:",
        error
      );
      return createErrorModel({
        message: "Failed to get locations with detail",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
