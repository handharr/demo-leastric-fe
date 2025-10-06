import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import {
  GetElectricityUsageHistoryModel,
  GetElectricityUsageModel,
  GetExportToCsvModel,
  GetUsageSummaryModel,
} from "@/features/summary/domain/entities/summary-models";
import {
  GetUsageSummaryQueryParams,
  GetElectricityUsageQueryParams,
  GetElectricityUsageHistoryQueryParams,
  GetExportToCsvQueryParams,
} from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryDataSource } from "@/features/summary/infrastructure/data-source/summary-data-source";
import {
  parseEnergyUnit,
  parseDeviceType,
} from "@/shared/utils/helpers/enum-helpers";
import { RemoteSummaryDataSource } from "@/features/summary/infrastructure/data-source/remote-summary-data-source";
import { MqttUsageModel } from "@/shared/domain/entities/shared-models";
import { usageMqttDataSource } from "@/shared/infrastructure/data-source/mqtt-data-source";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

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
          estUsage: optionalValue(
            result.data?.summaries?.threePhase?.estUsage
          ).orZero(),
          estBill: optionalValue(
            result.data?.summaries?.threePhase?.estBill
          ).orZero(),
          totalCO2Emission: optionalValue(
            result.data?.summaries?.threePhase?.totalCO2Emission
          ).orZero(),
          deviceStatus: {
            activeDevices: optionalValue(
              result.data?.summaries?.threePhase?.deviceStatus?.activeDevices
            ).orZero(),
            inactiveDevices: optionalValue(
              result.data?.summaries?.threePhase?.deviceStatus?.inactiveDevices
            ).orZero(),
            totalDevices: optionalValue(
              result.data?.summaries?.threePhase?.deviceStatus?.totalDevices
            ).orZero(),
          },
        },
        singlePhase: {
          estUsage: optionalValue(
            result.data?.summaries?.singlePhase?.estUsage
          ).orZero(),
          estBill: optionalValue(
            result.data?.summaries?.singlePhase?.estBill
          ).orZero(),
          totalCO2Emission: optionalValue(
            result.data?.summaries?.singlePhase?.totalCO2Emission
          ).orZero(),
          deviceStatus: {
            activeDevices: optionalValue(
              result.data?.summaries?.singlePhase?.deviceStatus?.activeDevices
            ).orZero(),
            inactiveDevices: optionalValue(
              result.data?.summaries?.singlePhase?.deviceStatus?.inactiveDevices
            ).orZero(),
            totalDevices: optionalValue(
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
  }): Promise<GetElectricityUsageModel | BaseErrorModel> {
    Logger.info("SummaryRepositoryImpl", "getElectricityUsage", queryParam);
    const result = await this.dataSource.getElectricityUsage({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getElectricityUsage", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("SummaryRepositoryImpl", "getElectricityUsage result", result);
    const usages = optionalValue(result.data?.usage).orEmptyArray();
    Logger.info("SummaryRepositoryImpl", "Parsed usages", usages);
    if (result.flash?.type === "success") {
      try {
        Logger.info(
          "SummaryRepositoryImpl",
          "Success getElectricityUsage - mapping usages"
        );
        const mappedUsages = usages.map((usage) => ({
          deviceId: optionalValue(usage.deviceId).orEmpty(),
          deviceName: optionalValue(usage.deviceName).orEmpty(),
          deviceType: parseDeviceType(
            optionalValue(usage.deviceType).orEmpty()
          ),
          period: optionalValue(usage.period).orEmpty(),
          unit: parseEnergyUnit(optionalValue(usage.unit).orEmpty()),
          avgVoltage: optionalValue(usage.avgVoltage).orDefault(-1),
          avgVoltageLine: optionalValue(usage.avgVoltageLine).orDefault(-1),
          avgCurrent: optionalValue(usage.avgCurrent).orDefault(-1),
          avgRealPower: optionalValue(usage.avgRealPower).orDefault(-1),
          totalKwh: optionalValue(usage.totalKwh).orDefault(-1),
          totalEstBilling: optionalValue(usage.totalEstBilling).orDefault(-1),
          totalCO2Emission: optionalValue(usage.totalCO2Emission).orDefault(-1),
        }));
        Logger.info("SummaryRepositoryImpl", "Mapped usages", mappedUsages);
        return {
          usage: {
            data: mappedUsages,
          },
        };
      } catch (error) {
        Logger.error(
          "SummaryRepositoryImpl",
          "getElectricityUsage - parsing error",
          error
        );
        return createErrorModel({
          type: ErrorType.UNEXPECTED,
          message: "Failed to parse electricity usage data.",
        });
      }
    } else {
      Logger.error(
        "SummaryRepositoryImpl",
        "getElectricityUsage - unexpected flash type",
        result
      );
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve electricity usage. Please try again.",
      });
    }
  }

  async getElectricityUsageHistory({
    queryParam,
  }: {
    queryParam: GetElectricityUsageHistoryQueryParams;
  }): Promise<GetElectricityUsageHistoryModel | BaseErrorModel> {
    Logger.info(
      "SummaryRepositoryImpl",
      "getElectricityUsageHistory",
      queryParam
    );
    const result = await this.dataSource.getElectricityUsageHistory({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getElectricityUsage", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("SummaryRepositoryImpl", "getElectricityUsage result", result);
    const usages = optionalValue(result.data?.usage).orEmptyArray();
    Logger.info("SummaryRepositoryImpl", "Parsed usages", usages);
    if (result.flash?.type === "success") {
      try {
        Logger.info(
          "SummaryRepositoryImpl",
          "Success getElectricityUsage - mapping usages"
        );
        const mappedUsages = usages.map((usage) => ({
          deviceId: optionalValue(usage.deviceId).orEmpty(),
          deviceName: optionalValue(usage.deviceName).orEmpty(),
          deviceType: parseDeviceType(
            optionalValue(usage.deviceType).orEmpty()
          ),
          period: optionalValue(usage.period).orEmpty(),
          unit: parseEnergyUnit(optionalValue(usage.unit).orEmpty()),
          avgVoltage: optionalValue(usage.avgVoltage).orDefault(-1),
          avgVoltageLine: optionalValue(usage.avgVoltageLine).orDefault(-1),
          avgCurrent: optionalValue(usage.avgCurrent).orDefault(-1),
          avgRealPower: optionalValue(usage.avgRealPower).orDefault(-1),
          totalKwh: optionalValue(usage.totalKwh).orDefault(-1),
          totalEstBilling: optionalValue(usage.totalEstBilling).orDefault(-1),
          totalCO2Emission: optionalValue(usage.totalCO2Emission).orDefault(-1),
        }));
        Logger.info("SummaryRepositoryImpl", "Mapped usages", mappedUsages);
        return {
          usage: {
            data: mappedUsages,
          },
          pagination: {
            page: optionalValue(result.meta?.page).orZero(),
            itemCount: optionalValue(result.meta?.itemCount).orZero(),
            pageCount: optionalValue(result.meta?.pageCount).orZero(),
            hasPreviousPage: optionalValue(
              result.meta?.hasPreviousPage
            ).orFalse(),
            hasNextPage: optionalValue(result.meta?.hasNextPage).orFalse(),
            size: optionalValue(result.meta?.size).orZero(),
          },
        };
      } catch (error) {
        Logger.error(
          "SummaryRepositoryImpl",
          "getElectricityUsage - parsing error",
          error
        );
        return createErrorModel({
          type: ErrorType.UNEXPECTED,
          message: "Failed to parse electricity usage data.",
        });
      }
    } else {
      Logger.error(
        "SummaryRepositoryImpl",
        "getElectricityUsage - unexpected flash type",
        result
      );
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve electricity usage. Please try again.",
      });
    }
  }

  async getExportToCsv({
    queryParam,
  }: {
    queryParam: GetExportToCsvQueryParams;
  }): Promise<GetExportToCsvModel | BaseErrorModel> {
    Logger.info("SummaryRepositoryImpl", "getExportToCsv", queryParam);
    const result = await this.dataSource.getExportToCsv({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getExportToCsv", result);
      return mapErrorResponseToModel({ response: result });
    }

    Logger.info("SummaryRepositoryImpl", "getExportToCsv result", result);
    if (result.flash?.type === "success") {
      return {
        message: optionalValue(result.data?.message).orEmpty(),
        fileUrl: optionalValue(result.data?.fileUrl).orEmpty(),
        fileName: optionalValue(result.data?.fileName).orEmpty(),
        recordCount: optionalValue(result.data?.recordCount).orZero(),
      };
    } else {
      Logger.error(
        "SummaryRepositoryImpl",
        "getExportToCsv - unexpected flash type",
        result
      );
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve export to CSV. Please try again.",
      });
    }
  }

  subscribeRealTimeUsage(): Observable<MqttUsageModel | BaseErrorModel> {
    Logger.info(
      "SummaryRepositoryImpl",
      "subscribeRealTimeUsage - starting subscription"
    );

    return usageMqttDataSource
      .subscribeToTopic("logdevice/multipledata", {
        qos: 0,
        autoConnect: true,
      })
      .pipe(
        map((message): MqttUsageModel | BaseErrorModel => {
          try {
            Logger.info(
              "SummaryRepositoryImpl",
              "subscribeRealTimeUsage - message received",
              {
                topic: message.topic,
                timestamp: message.timestamp,
                qos: message.qos,
                payload: message.payload,
              }
            );

            const payload = message.payload;

            // Validate payload structure
            if (!payload || typeof payload !== "object") {
              Logger.error(
                "SummaryRepositoryImpl",
                "subscribeRealTimeUsage - invalid payload structure",
                payload
              );
              return createErrorModel({
                type: ErrorType.UNEXPECTED,
                message: "Invalid MQTT message payload structure.",
              });
            }

            // Check for error in payload
            if ("error" in payload && typeof payload.error === "string") {
              Logger.error(
                "SummaryRepositoryImpl",
                "subscribeRealTimeUsage - error in payload",
                payload.error
              );
              return createErrorModel({
                type: ErrorType.UNEXPECTED,
                message: payload.error,
              });
            }

            // Map to MqttUsageModel with proper validation
            const mappedUsage: MqttUsageModel = {
              "1phases": optionalValue(payload["1phases"])
                .orEmptyArray()
                .map((log) => ({
                  devid: optionalValue(log?.devid).orEmpty(),
                  p: optionalValue(log?.p).orZero(),
                })),
              "3phases": optionalValue(payload["3phases"])
                .orEmptyArray()
                .map((log) => ({
                  devid: optionalValue(log?.devid).orEmpty(),
                  pR: optionalValue(log?.pR).orZero(),
                  pS: optionalValue(log?.pS).orZero(),
                  pT: optionalValue(log?.pT).orZero(),
                })),
            };

            Logger.info(
              "SummaryRepositoryImpl",
              "subscribeRealTimeUsage - successfully mapped usage",
              mappedUsage
            );

            return mappedUsage;
          } catch (error) {
            Logger.error(
              "SummaryRepositoryImpl",
              "subscribeRealTimeUsage - parsing error",
              error
            );
            return createErrorModel({
              type: ErrorType.UNEXPECTED,
              message: "Failed to parse MQTT usage data.",
            });
          }
        }),
        catchError((error) => {
          Logger.error(
            "SummaryRepositoryImpl",
            "subscribeRealTimeUsage - MQTT connection error",
            error
          );

          // Return an observable with error model instead of throwing
          return of(
            createErrorModel({
              type: ErrorType.NETWORK,
              message:
                error instanceof Error
                  ? `MQTT connection error: ${error.message}`
                  : "MQTT connection error occurred.",
            })
          );
        })
      );
  }
}
