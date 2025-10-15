import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { GetDevicesCurrentMqttLogModel } from "@/features/summary/domain/entities/summary-models";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";
import { useCallback, useState } from "react";
import { GetDevicesCurrentMqttLogQueryParams } from "@/features/summary/domain/params/query-params";
import { GetDevicesCurrentMqttLogUseCase } from "@/features/summary/domain/use-cases/get-devices-current-mqtt-log";
import { DeviceType, RealTimeInterval } from "@/shared/domain/enum/enums";
import { PeriodicMqttLogUIData } from "@/features/summary/presentation/data/summary-ui-data";

interface UseGetDevicesCurrentMqttLogReturn {
  data: GetDevicesCurrentMqttLogModel | null;
  selectedInterval: RealTimeInterval;
  error: BaseErrorModel | null;
  loading: boolean;
  periodicData: PeriodicMqttLogUIData[];
  fetch: (location: string) => Promise<void>;
  setSelectedInterval: (interval: RealTimeInterval) => void;
  reset: () => void;
  resetPeriodicData?: () => void;
}

export const useGetDevicesCurrentMqttLog =
  (): UseGetDevicesCurrentMqttLogReturn => {
    const [data, setData] = useState<GetDevicesCurrentMqttLogModel | null>(
      null
    );
    const [error, setError] = useState<BaseErrorModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInterval, setSelectedInterval] = useState<RealTimeInterval>(
      RealTimeInterval.Sixty
    );
    const [periodicData, setPeriodicData] = useState<PeriodicMqttLogUIData[]>(
      []
    );

    const fetchDevicesCurrentMqttLog = useCallback(async (location: string) => {
      try {
        setLoading(true);
        setError(null);
        const getDevicesCurrentMqttLogUseCase =
          new GetDevicesCurrentMqttLogUseCase();
        const queryParam: GetDevicesCurrentMqttLogQueryParams = {
          location,
        };
        const result = await getDevicesCurrentMqttLogUseCase.execute(
          queryParam
        );

        Logger.info(
          "useGetDevicesCurrentMqttLog",
          "Fetched devices current MQTT log successfully",
          result
        );

        if ("message" in result) {
          setError(result);
          setData(null);
        } else {
          const activePowerInWattSum = result.devices.reduce((sum, log) => {
            let watt = 0;
            if (log.deviceType === DeviceType.SinglePhase) {
              watt = log.latestReadingData.activePower;
            } else {
              watt =
                log.latestReadingData.activePowerData.pR +
                log.latestReadingData.activePowerData.pS +
                log.latestReadingData.activePowerData.pT;
            }
            return sum + watt;
          }, 0);
          const periodicData: PeriodicMqttLogUIData = {
            time: new Date(),
            value: activePowerInWattSum,
          };
          setPeriodicData((prev) => {
            let _prev = prev;

            // Check if the count is under 12 then just add
            if (_prev.length < 12) {
              _prev = [..._prev, periodicData];
            } else {
              // Remove the first element and add new element to the end
              _prev = [..._prev.slice(1), periodicData];
            }

            return _prev;
          });
          setData(result);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        Logger.error(
          "useGetDevicesCurrentMqttLog",
          "Exception occurred:",
          errorMessage
        );
        setError({
          message: "Failed to fetch devices current MQTT log",
          details: errorMessage,
          type: ErrorType.UNEXPECTED,
        } as BaseErrorModel);
        setData(null);
      } finally {
        setLoading(false);
      }
    }, []);

    const reset = useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, []);

    const resetPeriodicData = useCallback(() => {
      setPeriodicData([]);
    }, []);

    return {
      data,
      error,
      loading,
      selectedInterval,
      periodicData,
      fetch: fetchDevicesCurrentMqttLog,
      setSelectedInterval,
      reset,
      resetPeriodicData,
    };
  };
