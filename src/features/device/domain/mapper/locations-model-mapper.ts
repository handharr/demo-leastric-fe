import {
  LocationResponse,
  SubLocationResponse,
  DetailLocationResponse,
} from "@/features/device/infrastructure/models/locations-response";
import { LocationModel } from "@/features/device/domain/entities/locations-models";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";

export const mapLocationResponseToModel = (
  response: LocationResponse
): LocationModel => {
  return {
    location: optional(response.location).orEmpty(),
    deviceCount: optional(response.deviceCount).orZero(),
    subLocations: optional(response.subLocations)
      .orEmpty()
      .map(mapSubLocationResponseToModel),
  };
};

const mapSubLocationResponseToModel = (response: SubLocationResponse) => {
  return {
    subLocation: optional(response.subLocation).orEmpty(),
    deviceCount: optional(response.deviceCount).orZero(),
    detailLocations: optional(response.detailLocations)
      .orEmpty()
      .map(mapDetailLocationResponseToModel),
  };
};

const mapDetailLocationResponseToModel = (response: DetailLocationResponse) => {
  return {
    detailLocation: optional(response.detailLocation).orEmpty(),
    deviceCount: optional(response.deviceCount).orZero(),
  };
};
