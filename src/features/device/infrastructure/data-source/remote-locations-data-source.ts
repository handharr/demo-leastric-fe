import { AxiosError } from "axios";
import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/core/insfrastructure/api/api-client";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import {
  GetLocationsWithStatsResponse,
  GetLocationsResponse,
  GetLocationsWithDetailResponse,
} from "@/features/device/infrastructure/models/locations-response";
import { LocationDataSource } from "@/features/device/infrastructure/data-source/location-data-source";
import { Logger } from "@/core/utils/logger/logger";

export class RemoteLocationsDataSource implements LocationDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  async getLocations(): Promise<
    BaseResponse<GetLocationsResponse> | BaseErrorResponse
  > {
    Logger.info("RemoteLocationsDataSource", "Fetching locations");
    try {
      return await this.apiClient.get<BaseResponse<GetLocationsResponse>>(
        "v1/locations"
      );
    } catch (error) {
      Logger.error(
        "RemoteLocationsDataSource",
        "Error fetching locations:",
        error
      );
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve locations. Please try again."
      );
    }
  }

  async getLocationWithStats(): Promise<
    BaseResponse<GetLocationsWithStatsResponse> | BaseErrorResponse
  > {
    Logger.info("RemoteLocationsDataSource", "Fetching locations with stats");
    try {
      return await this.apiClient.get<
        BaseResponse<GetLocationsWithStatsResponse>
      >("v1/locations/with-stats");
    } catch (error) {
      Logger.error(
        "RemoteLocationsDataSource",
        "Error fetching locations with stats:",
        error
      );
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve locations with stats. Please try again."
      );
    }
  }

  async getLocationsWithDetail(): Promise<
    BaseResponse<GetLocationsWithDetailResponse> | BaseErrorResponse
  > {
    Logger.info("RemoteLocationsDataSource", "Fetching locations with detail");
    try {
      return await this.apiClient.get<
        BaseResponse<GetLocationsWithDetailResponse>
      >("v1/locations/hierarchy");
    } catch (error) {
      Logger.error(
        "RemoteLocationsDataSource",
        "Error fetching locations with detail:",
        error
      );
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve locations with detail. Please try again."
      );
    }
  }
}
