import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageQueryParams } from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";

export class GetElectricityUsageUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetElectricityUsageQueryParams
  ): Promise<GetElectricityUsageModel | BaseErrorModel> {
    return await this.summaryRepository.getElectricityUsage({ queryParam });
  }
}
