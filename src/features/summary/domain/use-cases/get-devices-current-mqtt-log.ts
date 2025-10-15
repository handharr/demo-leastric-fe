import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetDevicesCurrentMqttLogModel } from "@/features/summary/domain/entities/summary-models";
import { GetDevicesCurrentMqttLogQueryParams } from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";

export class GetDevicesCurrentMqttLogUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetDevicesCurrentMqttLogQueryParams
  ): Promise<GetDevicesCurrentMqttLogModel | BaseErrorModel> {
    return await this.summaryRepository.getDevicesCurrentMqttLog({
      queryParam,
    });
  }
}
