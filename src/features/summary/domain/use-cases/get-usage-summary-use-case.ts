import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetUsageSummaryModel } from "@/features/summary/domain/entities/summary-models";
import { GetUsageSummaryQueryParams } from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "../../infrastructure/repositories-implementation/summary-repository-impl";

export class GetUsageSummaryUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetUsageSummaryQueryParams
  ): Promise<GetUsageSummaryModel | BaseErrorModel> {
    return await this.summaryRepository.getUsageSummary({ queryParam });
  }
}
