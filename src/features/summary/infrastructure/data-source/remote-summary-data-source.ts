import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { Logger } from "@/shared/utils/logger/logger";
import {
  ApiClient,
  createAuthApiClient,
} from "@/shared/infrastructure/api/api-client";
import {
  GetUsageSummaryResponse,
  GetElectricityUsageResponse,
} from "@/features/summary/infrastructure/models/summary-responses";
import { SummaryDataSource } from "@/features/summary/infrastructure/data-source/summary-data-source";
import { AxiosError } from "axios";

export class RemoteSummaryDataSource implements SummaryDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  async getUsageSummary({
    params,
  }: {
    params: Record<string, unknown>;
  }): Promise<BaseResponse<GetUsageSummaryResponse> | BaseErrorResponse> {
    Logger.info("RemoteSummaryDataSource", "Fetching usage summary");
    try {
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };
      return await this.apiClient.get("v1/readings/monthly-summary", params, {
        headers,
      });
    } catch (error) {
      Logger.error("Error fetching usage summary", error);
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to fetch usage summary. Please try again."
      );
    }
  }

  async getElectricityUsage({
    params,
  }: {
    params: Record<string, unknown>;
  }): Promise<BaseResponse<GetElectricityUsageResponse> | BaseErrorResponse> {
    try {
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };
      return await this.apiClient.get(`v1/readings/electricity-usage`, params, {
        headers,
      });
    } catch (error) {
      Logger.error("Error fetching electricity usage", error);
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to fetch electricity usage. Please try again."
      );
    }
  }
}
