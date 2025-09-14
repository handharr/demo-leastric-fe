import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import {
  LocationStatsResponse,
  LocationResponse,
} from "@/features/device/infrastructure/model/location-response";

export interface LocationDataSource {
  getLocations(): Promise<BaseResponse<string[]> | BaseErrorResponse>;
  getLocationWithStats(): Promise<
    BaseResponse<LocationStatsResponse[]> | BaseErrorResponse
  >;
  getLocationsWithDetail(): Promise<
    BaseResponse<LocationResponse[]> | BaseErrorResponse
  >;
}
