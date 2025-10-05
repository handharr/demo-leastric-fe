import {
  LocationResponse,
  SubLocationResponse,
  DetailLocationResponse,
} from "@/features/device/infrastructure/models/locations-response";
import { LocationModel } from "@/features/device/domain/entities/locations-models";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export const mapLocationResponseToModel = (
  response: LocationResponse
): LocationModel => {
  return {
    location: optionalValue(response.location).orEmpty(),
    deviceCount: optionalValue(response.deviceCount).orZero(),
    subLocations: optionalValue(response.subLocations)
      .orEmptyArray()
      .map(mapSubLocationResponseToModel),
  };
};

const mapSubLocationResponseToModel = (response: SubLocationResponse) => {
  return {
    subLocation: optionalValue(response.subLocation).orEmpty(),
    deviceCount: optionalValue(response.deviceCount).orZero(),
    detailLocations: optionalValue(response.detailLocations)
      .orEmptyArray()
      .map(mapDetailLocationResponseToModel),
  };
};

const mapDetailLocationResponseToModel = (response: DetailLocationResponse) => {
  return {
    detailLocation: optionalValue(response.detailLocation).orEmpty(),
    deviceCount: optionalValue(response.deviceCount).orZero(),
  };
};
