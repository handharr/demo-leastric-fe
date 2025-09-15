import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import {
  GetLocationsWithStatsResponse,
  GetLocationsResponse,
  GetLocationsWithDetailResponse,
} from "@/features/device/infrastructure/model/locations-response";

export interface LocationDataSource {
  getLocations(): Promise<
    BaseResponse<GetLocationsResponse> | BaseErrorResponse
  >;
  getLocationWithStats(): Promise<
    BaseResponse<GetLocationsWithStatsResponse> | BaseErrorResponse
  >;
  getLocationsWithDetail(): Promise<
    BaseResponse<GetLocationsWithDetailResponse> | BaseErrorResponse
  >;
}
