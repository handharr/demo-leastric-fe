import { LocationsRepository } from "@/features/device/domain/repositories/locations-repository";
import { LocationStatsModel } from "@/features/device/domain/entities/locations-models";
import { RemoteLocationsDataSource } from "@/features/device/infrastructure/data-source/remote-locations-data-source";
import { LocationsRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/locations-repository-impl";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export class GetLocationsWithStatsUseCase {
  constructor(
    private locationsRepository: LocationsRepository = new LocationsRepositoryImpl(
      new RemoteLocationsDataSource()
    )
  ) {}

  async execute(): Promise<LocationStatsModel[] | BaseErrorModel> {
    try {
      const locationStats =
        await this.locationsRepository.getLocationWithStats();
      Logger.info(
        "GetLocationWithStatsUseCase",
        "Successfully retrieved location stats:",
        locationStats
      );
      return locationStats;
    } catch (error) {
      Logger.error(
        "GetLocationWithStatsUseCase",
        "Failed to get location stats:",
        error
      );
      return createErrorModel({
        message: "Failed to get location stats",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
