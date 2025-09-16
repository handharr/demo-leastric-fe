import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import {
  GetUsageSummaryResponse,
  GetElectricityUsageResponse,
} from "@/features/summary/infrastructure/models/summary-responses";

export interface SummaryDataSource {
  getUsageSummary({
    params,
  }: {
    params: Record<string, unknown>;
  }): Promise<BaseResponse<GetUsageSummaryResponse> | BaseErrorResponse>;
  getElectricityUsage({
    params,
  }: {
    params: Record<string, unknown>;
  }): Promise<BaseResponse<GetElectricityUsageResponse> | BaseErrorResponse>;
}
