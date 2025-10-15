import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetGeneratePdfReportModel } from "@/features/summary/domain/entities/summary-models";
import { GetGeneratePdfReportQueryParams } from "@/features/summary/domain/params/query-params";
import { Logger } from "@/core/utils/logger/logger";

export class GetGeneratePdfReportUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetGeneratePdfReportQueryParams
  ): Promise<GetGeneratePdfReportModel | BaseErrorModel> {
    Logger.info("GetGeneratePdfReportUseCase", "execute", queryParam);
    return this.summaryRepository.getGeneratePdfReport({
      queryParam,
    });
  }
}
