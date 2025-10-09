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
  DeviceCurrentMqttLogModel,
  GetDevicesCurrentMqttLogModel,
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
  GetDevicesCurrentMqttLogQueryParams,
} from "@/features/summary/domain/params/query-params";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { SummaryDataSource } from "@/features/summary/infrastructure/data-source/summary-data-source";
import {
  parseEnergyUnit,
  parseDeviceType,
} from "@/shared/utils/helpers/enum-helpers";
import { RemoteSummaryDataSource } from "@/features/summary/infrastructure/data-source/remote-summary-data-source";
import { MqttUsageModel } from "@/shared/domain/entities/shared-models";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { WebSocketDataSource } from "@/shared/infrastructure/data-source/web-socket-data-source";

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
      "subscribeRealTimeUsage - starting WebSocket subscription"
    );

    // Create WebSocket data source for real-time usage
    const webSocketDataSource = new WebSocketDataSource<MqttUsageModel>({
      url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/usage",
      enableRetry: true,
      enableLogging: true,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      retryOptions: {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
      connectTimeout: 30000,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      onConnectionLost: () => {
        Logger.warn(
          "SummaryRepositoryImpl",
          "WebSocket connection lost for real-time usage"
        );
      },
      onReconnect: () => {
        Logger.info(
          "SummaryRepositoryImpl",
          "WebSocket reconnected for real-time usage"
        );
      },
      onHeartbeatFailed: () => {
        Logger.warn(
          "SummaryRepositoryImpl",
          "WebSocket heartbeat failed for real-time usage"
        );
      },
    });

    return webSocketDataSource.getMessages$().pipe(
      map((message): MqttUsageModel | BaseErrorModel => {
        try {
          Logger.info(
            "SummaryRepositoryImpl",
            "subscribeRealTimeUsage - WebSocket message received",
            {
              type: message.type,
              timestamp: message.timestamp,
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
              message: "Invalid WebSocket message payload structure.",
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
            "subscribeRealTimeUsage - successfully mapped WebSocket usage",
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
            message: "Failed to parse WebSocket usage data.",
          });
        }
      }),
      catchError((error) => {
        Logger.error(
          "SummaryRepositoryImpl",
          "subscribeRealTimeUsage - WebSocket connection error",
          error
        );

        // Enhanced error categorization
        let errorType = ErrorType.UNEXPECTED;
        let errorMessage = "WebSocket connection error occurred.";

        if (error instanceof Error) {
          const message = error.message.toLowerCase();

          if (
            message.includes("certificate") ||
            message.includes("tls") ||
            message.includes("ssl") ||
            message.includes("cert")
          ) {
            errorType = ErrorType.NETWORK;
            errorMessage = `Certificate/TLS error: ${error.message}`;
          } else if (
            message.includes("connection") ||
            message.includes("timeout") ||
            message.includes("refused")
          ) {
            errorType = ErrorType.NETWORK;
            errorMessage = `Network connection error: ${error.message}`;
          } else if (
            message.includes("auth") ||
            message.includes("credential")
          ) {
            errorType = ErrorType.UNEXPECTED;
            errorMessage = `Authentication error: ${error.message}`;
          } else {
            errorMessage = `WebSocket error: ${error.message}`;
          }
        }

        // Return an observable with error model instead of throwing
        return of(
          createErrorModel({
            type: errorType,
            message: errorMessage,
          })
        );
      })
    );
  }

  async getDevicesCurrentMqttLog({
    queryParam,
  }: {
    queryParam: GetDevicesCurrentMqttLogQueryParams;
  }): Promise<GetDevicesCurrentMqttLogModel | BaseErrorModel> {
    Logger.info(
      "SummaryRepositoryImpl",
      "getDevicesCurrentMqttLog",
      queryParam
    );
    const result = await this.dataSource.getDevicesCurrentMqttLog({
      params: { ...queryParam },
    });

    if (isErrorResponse(result)) {
      Logger.error("SummaryRepositoryImpl", "getDevicesCurrentMqttLog", result);
      return mapErrorResponseToModel({ response: result });
    }
    Logger.info(
      "SummaryRepositoryImpl",
      "getDevicesCurrentMqttLog result",
      result
    );
    const logs = optionalValue(result.data?.devices).orEmptyArray();
    Logger.info("SummaryRepositoryImpl", "Parsed logs", logs);
    if (result.flash?.type === "success") {
      try {
        Logger.info(
          "SummaryRepositoryImpl",
          "Success getDevicesCurrentMqttLog - mapping logs"
        );
        const mappedDevices: DeviceCurrentMqttLogModel[] = logs.map((log) => ({
          deviceId: optionalValue(log.deviceId).orEmpty(),
          deviceName: optionalValue(log.deviceName).orEmpty(),
          deviceType: parseDeviceType(optionalValue(log.deviceType).orEmpty()),
          location: optionalValue(log.location).orEmpty(),
          subLocation: optionalValue(log.subLocation).orNull(),
          detailLocation: optionalValue(log.detailLocation).orNull(),
          lastReading: optionalValue(log.lastReading).orEmpty(),
          totalKwh: optionalValue(log.totalKwh).orDefault(-1),
          latestReadingData: {
            voltage: optionalValue(log.latestReadingData?.voltage).orDefault(
              -1
            ),
            current: optionalValue(log.latestReadingData?.current).orDefault(
              -1
            ),
            activePower: optionalValue(
              log.latestReadingData?.activePower
            ).orDefault(-1),
            apparentPower: optionalValue(
              log.latestReadingData?.apparentPower
            ).orDefault(-1),
            powerFactor: optionalValue(
              log.latestReadingData?.powerFactor
            ).orDefault(-1),
            totalKwh: optionalValue(log.latestReadingData?.totalKwh).orDefault(
              -1
            ),
            currentKwh: optionalValue(
              log.latestReadingData?.currentKwh
            ).orDefault(-1),
          },
        }));
        Logger.info("SummaryRepositoryImpl", "Mapped logs", mappedDevices);
        return {
          devices: mappedDevices,
        };
      } catch (error) {
        Logger.error(
          "SummaryRepositoryImpl",
          "getDevicesCurrentMqttLog - parsing error",
          error
        );
        return createErrorModel({
          type: ErrorType.UNEXPECTED,
          message: "Failed to parse devices current MQTT log data.",
        });
      }
    } else {
      Logger.error(
        "SummaryRepositoryImpl",
        "getDevicesCurrentMqttLog - unexpected flash type",
        result
      );
      return createErrorModel({
        type: ErrorType.UNEXPECTED,
        message:
          result.flash?.message ||
          "Failed to retrieve devices current MQTT log. Please try again.",
      });
    }
  }
}
