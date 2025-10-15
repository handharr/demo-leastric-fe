import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  GetDevicesCurrentMqttLogModel,
  GetElectricityUsageHistoryModel,
  GetElectricityUsageModel,
  GetExportToCsvModel,
  GetGeneratePdfReportModel,
  GetUsageSummaryModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  GetUsageSummaryQueryParams,
  GetElectricityUsageQueryParams,
  GetElectricityUsageHistoryQueryParams,
  GetExportToCsvQueryParams,
  GetDevicesCurrentMqttLogQueryParams,
  GetGeneratePdfReportQueryParams,
} from "@/features/summary/domain/params/query-params";
import { MqttUsageModel } from "@/shared/domain/entities/shared-models";
import { Observable } from "rxjs";

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
  getExportToCsv({
    queryParam,
  }: {
    queryParam: GetExportToCsvQueryParams;
  }): Promise<GetExportToCsvModel | BaseErrorModel>;
  subscribeRealTimeUsage(): Observable<MqttUsageModel | BaseErrorModel>;
  getDevicesCurrentMqttLog({
    queryParam,
  }: {
    queryParam: GetDevicesCurrentMqttLogQueryParams;
  }): Promise<GetDevicesCurrentMqttLogModel | BaseErrorModel>;
  getGeneratePdfReport({
    queryParam,
  }: {
    queryParam: GetGeneratePdfReportQueryParams;
  }): Promise<GetGeneratePdfReportModel | BaseErrorModel>;
}
