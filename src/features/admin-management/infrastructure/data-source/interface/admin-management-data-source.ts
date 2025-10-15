import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { GetMqttLogsResponse } from "@/features/admin-management/infrastructure/model/admin-management-response";

export interface AdminManagementDataSource {
  getMqttLogs({
    params,
  }: {
    params?: Record<string, unknown>;
  }): Promise<BaseResponse<GetMqttLogsResponse> | BaseErrorResponse>;
}
