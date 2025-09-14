import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  LocationModel,
  LocationStatsModel,
} from "@/features/device/domain/entities/locations-models";

export interface LocationsRepository {
  getLocations(): Promise<string[] | BaseErrorModel>;
  getLocationWithStats(): Promise<LocationStatsModel[] | BaseErrorModel>;
  getLocationsWithDetail(): Promise<LocationModel[] | BaseErrorModel>;
}
