import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  GetElectricityUsageModel,
  GetUsageSummaryModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  GetUsageSummaryQueryParams,
  GetElectricityUsageQueryParams,
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
}
