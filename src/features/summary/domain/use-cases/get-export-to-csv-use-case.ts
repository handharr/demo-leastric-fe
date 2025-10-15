import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetExportToCsvModel } from "@/features/summary/domain/entities/summary-models";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";

export class GetExportToCsvUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetExportToCsvQueryParams
  ): Promise<GetExportToCsvModel | BaseErrorModel> {
    return await this.summaryRepository.getExportToCsv({ queryParam });
  }
}
