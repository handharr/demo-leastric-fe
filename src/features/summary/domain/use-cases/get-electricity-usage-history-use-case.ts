import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { GetElectricityUsageHistoryModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageHistoryQueryParams } from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";
import {
  getDateStartOfDate,
  parseDateString,
} from "@/shared/utils/helpers/date-helpers";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export class GetElectricityUsageHistoryUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  async execute(
    queryParam: GetElectricityUsageHistoryQueryParams
  ): Promise<GetElectricityUsageHistoryModel | BaseErrorModel> {
    const result = await this.summaryRepository.getElectricityUsageHistory({
      queryParam,
    });

    // Check if the result is GetElectricityUsageHistoryModel by type
    if (isErrorModel(result)) {
      return result;
    }

    /// Result must be GetElectricityUsageHistoryModel
    /// filter future dates
    const newResult: GetElectricityUsageHistoryModel = {
      ...result,
      usage: {
        data: result.usage.data.filter((item) => {
          const itemDate = getDateStartOfDate(
            optionalValue(parseDateString(item.period)).orToday()
          );
          const now = getDateStartOfDate(new Date());
          return itemDate <= now;
        }),
      },
    };

    return newResult;
  }
}
