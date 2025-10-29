import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";
import { GetAvaliablePDFReportsQueryParams } from "@/features/summary/domain/params/query-params";
import { GetAvailablePDFReportsModel } from "@/features/summary/domain/entities/summary-models";

export class GetAvailablePdfReportsUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetAvaliablePDFReportsQueryParams
  ): Promise<GetAvailablePDFReportsModel | BaseErrorModel> {
    return await this.summaryRepository.getAvaliablePDFReports({
      queryParam,
    });
  }
}
