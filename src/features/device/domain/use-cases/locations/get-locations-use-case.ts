import { LocationsRepository } from "@/features/device/domain/repositories/locations-repository";
import { RemoteLocationsDataSource } from "@/features/device/infrastructure/data-source/remote-locations-data-source";
import { LocationsRepositoryImpl } from "@/features/device/infrastructure/repositories-implementation/locations-repository-impl";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/core/domain/entities/base-error-model";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";

export class GetLocationsUseCase {
  constructor(
    private locationsRepository: LocationsRepository = new LocationsRepositoryImpl(
      new RemoteLocationsDataSource()
    )
  ) {}

  async execute(): Promise<string[] | BaseErrorModel> {
    try {
      const locations = await this.locationsRepository.getLocations();
      Logger.info(
        "GetLocationsUseCase",
        "Successfully retrieved locations:",
        locations
      );
      return locations;
    } catch (error) {
      Logger.error("GetLocationsUseCase", "Failed to get locations:", error);
      return createErrorModel({
        message: "Failed to get locations",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
