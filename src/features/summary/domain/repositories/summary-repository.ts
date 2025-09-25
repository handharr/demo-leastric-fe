import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  GetElectricityUsageHistoryModel,
  GetElectricityUsageModel,
  GetUsageSummaryModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  GetUsageSummaryQueryParams,
  GetElectricityUsageQueryParams,
  GetElectricityUsageHistoryQueryParams,
} from "@/features/summary/domain/params/query-params";

export interface SummaryRepository {
  getUsageSummary({
    queryParam,
  }: {
    queryParam: GetUsageSummaryQueryParams;
  }): Promise<GetUsageSummaryModel | BaseErrorModel>;
  getElectricityUsage({
    queryParam,
  }: {
    queryParam: GetElectricityUsageQueryParams;
  }): Promise<GetElectricityUsageModel | BaseErrorModel>;
  getElectricityUsageHistory({
    queryParam,
  }: {
    queryParam: GetElectricityUsageHistoryQueryParams;
  }): Promise<GetElectricityUsageHistoryModel | BaseErrorModel>;
}
