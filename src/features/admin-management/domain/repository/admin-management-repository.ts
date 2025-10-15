import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetMqttLogsModel } from "@/features/admin-management/domain/entity/admin-management-model";
import { GetMqttLogsQueryParams } from "@/features/admin-management/domain/params/admin-management-query-params";

export interface AdminManagementRepository {
  getMqttLogs({
    queryParam,
  }: {
    queryParam?: GetMqttLogsQueryParams;
  }): Promise<GetMqttLogsModel | BaseErrorModel>;
}
