import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetElectricityUsageHistoryModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageHistoryQueryParams } from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";

export class GetElectricityUsageHistoryUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetElectricityUsageHistoryQueryParams
  ): Promise<GetElectricityUsageHistoryModel | BaseErrorModel> {
    return await this.summaryRepository.getElectricityUsageHistory({
      queryParam,
    });
  }
}
