import { AxiosError } from "axios";
import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/core/insfrastructure/api/api-client";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { Logger } from "@/core/utils/logger/logger";
import { AdminManagementDataSource } from "@/features/admin-management/infrastructure/data-source/interface/admin-management-data-source";
import { GetMqttLogsResponse } from "@/features/admin-management/infrastructure/model/admin-management-response";

export class RemoteAdminManagementDataSource
  implements AdminManagementDataSource
{
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  async getMqttLogs({
    params,
  }: {
    params?: Record<string, unknown>;
  }): Promise<BaseResponse<GetMqttLogsResponse> | BaseErrorResponse> {
    Logger.info("RemoteAdminManagementDataSource", "Fetching MQTT logs");
    try {
      return await this.apiClient.get<BaseResponse<GetMqttLogsResponse>>(
        `v1/mqtt/logs`,
        { params }
      );
    } catch (error) {
      Logger.error(
        "RemoteAdminManagementDataSource",
        "Error fetching MQTT logs:",
        error
      );
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve MQTT logs. Please try again."
      );
    }
  }
}
