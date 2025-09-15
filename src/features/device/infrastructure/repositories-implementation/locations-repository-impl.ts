import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { Logger } from "@/shared/utils/logger/logger";
import { LocationsRepository } from "@/features/device/domain/repositories/locations-repository";
import {
  LocationModel,
  LocationStatsModel,
} from "@/features/device/domain/entities/locations-models";
import { LocationDataSource } from "@/features/device/infrastructure/data-source/location-data-source";
import { mapLocationResponseToModel } from "@/features/device/domain/mapper/locations-model-mapper";
import { RemoteLocationsDataSource } from "@/features/device/infrastructure/data-source/remote-locations-data-source";

export class LocationsRepositoryImpl implements LocationsRepository {
  constructor(
    private dataSource: LocationDataSource = new RemoteLocationsDataSource()
  ) {}

  async getLocations(): Promise<string[] | BaseErrorModel> {
    Logger.info("LocationsRepositoryImpl", "getLocations");
    const result = await this.dataSource.getLocations();

    if (isErrorResponse(result)) {
      Logger.error("LocationsRepositoryImpl", "getLocations", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("LocationsRepositoryImpl", "getLocations", result);

    if (result.flash?.type === "success" && result.data?.locations) {
      return result.data.locations.map((location) =>
        optional(location).orEmpty()
      );
    } else {
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message: optional(result.flash?.message).orEmpty(),
        statusCode: 400,
      });
    }
  }

  async getLocationWithStats(): Promise<LocationStatsModel[] | BaseErrorModel> {
    Logger.info("LocationsRepositoryImpl", "getLocationWithStats");
    const result = await this.dataSource.getLocationWithStats();

    if (isErrorResponse(result)) {
      Logger.error("LocationsRepositoryImpl", "getLocationWithStats", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("LocationsRepositoryImpl", "getLocationWithStats", result);

    if (result.flash?.type === "success" && result.data?.locations) {
      return result.data.locations.map((location) => ({
        location: optional(location.location).orEmpty(),
        subLocations: optional(location.subLocations).orEmpty(),
        detailLocations: optional(location.detailLocations).orEmpty(),
        deviceCount: optional(location.deviceCount).orZero(),
      }));
    } else {
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message: optional(result.flash?.message).orEmpty(),
        statusCode: 400,
      });
    }
  }

  async getLocationsWithDetail(): Promise<LocationModel[] | BaseErrorModel> {
    Logger.info("LocationsRepositoryImpl", "getLocationsWithDetail");
    const result = await this.dataSource.getLocationsWithDetail();

    if (isErrorResponse(result)) {
      Logger.error("LocationsRepositoryImpl", "getLocationsWithDetail", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("LocationsRepositoryImpl", "getLocationsWithDetail", result);

    if (result.flash?.type === "success" && result.data?.hierarchy) {
      return result.data.hierarchy.map((location) => {
        return mapLocationResponseToModel(location);
      });
    } else {
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message: optional(result.flash?.message).orEmpty(),
        statusCode: 400,
      });
    }
  }
}
