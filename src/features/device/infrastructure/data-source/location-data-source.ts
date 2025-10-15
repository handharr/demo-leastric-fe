import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import {
  GetLocationsWithStatsResponse,
  GetLocationsResponse,
  GetLocationsWithDetailResponse,
} from "@/features/device/infrastructure/models/locations-response";

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
