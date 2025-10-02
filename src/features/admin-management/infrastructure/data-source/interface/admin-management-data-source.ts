import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { GetMqttLogsResponse } from "@/features/admin-management/infrastructure/model/admin-management-response";

export interface AdminManagementDataSource {
  getMqttLogs({
    params,
  }: {
    params?: Record<string, unknown>;
  }): Promise<BaseResponse<GetMqttLogsResponse> | BaseErrorResponse>;
}
