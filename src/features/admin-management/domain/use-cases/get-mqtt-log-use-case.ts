import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetMqttLogsModel } from "@/features/admin-management/domain/entity/admin-management-model";
import { GetMqttLogsQueryParams } from "@/features/admin-management/domain/params/admin-management-query-params";
import { AdminManagementRepository } from "@/features/admin-management/domain/repository/admin-management-repository";
import { AdminManagementRepositoryImpl } from "@/features/admin-management/infrastructure/repositories-implementation/admin-management-repository-impl";

export class GetMqttLogUseCase {
  constructor(
    private adminManagementRepository: AdminManagementRepository = new AdminManagementRepositoryImpl()
  ) {}

  async execute(
    queryParam?: GetMqttLogsQueryParams
  ): Promise<GetMqttLogsModel | BaseErrorModel> {
    return await this.adminManagementRepository.getMqttLogs({ queryParam });
  }
}
