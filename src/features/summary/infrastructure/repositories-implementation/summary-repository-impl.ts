import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import {
  ElectricityUsageModel,
  GetUsageSummaryModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  GetUsageSummaryQueryParams,
  GetElectricityUsageQueryParams,
} from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryDataSource } from "@/features/summary/infrastructure/data-source/summary-data-source";
import {
  parseEnergyUnit,
  parseDeviceType,
} from "@/shared/utils/helpers/enum-helpers";
import { RemoteSummaryDataSource } from "@/features/summary/infrastructure/data-source/remote-summary-data-source";

export class SummaryRepositoryImpl implements SummaryRepository {
  constructor(
    private dataSource: SummaryDataSource = new RemoteSummaryDataSource()
  ) {}

  async getUsageSummary({
    queryParam,
  }: {
    queryParam: GetUsageSummaryQueryParams;
  }): Promise<GetUsageSummaryModel | BaseErrorModel> {
    Logger.info("SummaryRepositoryImpl", "getUsageSummary", queryParam);
    const result = await this.dataSource.getUsageSummary({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getUsageSummary", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("SummaryRepositoryImpl", "getUsageSummary", result);

    if (result.flash?.type === "success" && result.data?.summaries) {
      return {
        threePhase: {
          estUsage: optional(
            result.data?.summaries?.threePhase?.estUsage
          ).orZero(),
          estBill: optional(
            result.data?.summaries?.threePhase?.estBill
          ).orZero(),
          totalCO2Emission: optional(
            result.data?.summaries?.threePhase?.totalCO2Emission
          ).orZero(),
          deviceStatus: {
            activeDevices: optional(
              result.data?.summaries?.threePhase?.deviceStatus?.activeDevices
            ).orZero(),
            inactiveDevices: optional(
              result.data?.summaries?.threePhase?.deviceStatus?.inactiveDevices
            ).orZero(),
            totalDevices: optional(
              result.data?.summaries?.threePhase?.deviceStatus?.totalDevices
            ).orZero(),
          },
        },
        singlePhase: {
          estUsage: optional(
            result.data?.summaries?.singlePhase?.estUsage
          ).orZero(),
          estBill: optional(
            result.data?.summaries?.singlePhase?.estBill
          ).orZero(),
          totalCO2Emission: optional(
            result.data?.summaries?.singlePhase?.totalCO2Emission
          ).orZero(),
          deviceStatus: {
            activeDevices: optional(
              result.data?.summaries?.singlePhase?.deviceStatus?.activeDevices
            ).orZero(),
            inactiveDevices: optional(
              result.data?.summaries?.singlePhase?.deviceStatus?.inactiveDevices
            ).orZero(),
            totalDevices: optional(
              result.data?.summaries?.singlePhase?.deviceStatus?.totalDevices
            ).orZero(),
          },
        },
      };
    } else {
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve usage summary. Please try again.",
      });
    }
  }

  async getElectricityUsage({
    queryParam,
  }: {
    queryParam: GetElectricityUsageQueryParams;
  }): Promise<ElectricityUsageModel[] | BaseErrorModel> {
    Logger.info("SummaryRepositoryImpl", "getElectricityUsage", queryParam);
    const result = await this.dataSource.getElectricityUsage({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getElectricityUsage", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("SummaryRepositoryImpl", "getElectricityUsage", result);
    const usages = optional(result.data?.usages).orEmpty();
    if (result.flash?.type === "success" && usages) {
      return usages.map((usage) => ({
        deviceId: optional(usage.deviceId).orEmpty(),
        deviceName: optional(usage.deviceName).orEmpty(),
        deviceType: parseDeviceType(optional(usage.deviceType).orEmpty()),
        period: optional(usage.period).orEmpty(),
        value: optional(usage.value).orZero(),
        unit: parseEnergyUnit(optional(usage.unit).orEmpty()),
        avgVoltage: optional(usage.avgVoltage).orZero(),
        avgVoltageLine: optional(usage.avgVoltageLine).orZero(),
        avgCurrent: optional(usage.avgCurrent).orZero(),
        avgRealPower: optional(usage.avgRealPower).orZero(),
        totalKwh: optional(usage.totalKwh).orZero(),
      }));
    } else {
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve electricity usage. Please try again.",
      });
    }
  }
}
