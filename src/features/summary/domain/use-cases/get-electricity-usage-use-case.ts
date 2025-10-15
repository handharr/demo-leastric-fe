import {
  BaseErrorModel,
  isErrorModel,
} from "@/core/domain/entities/base-error-model";
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
    const result = await this.summaryRepository.getElectricityUsage({
      queryParam,
    });

    // Check if the result is GetElectricityUsageHistoryModel by type
    if (isErrorModel(result)) {
      return result;
    }

    /// Result must be GetElectricityUsageHistoryModel
    /// filter future dates
    const newResult: GetElectricityUsageModel = {
      ...result,
      usage: {
        data: result.usage.data.filter((item) => {
          return item.totalKwh >= 0;
        }),
      },
    };

    return newResult;
  }
}
