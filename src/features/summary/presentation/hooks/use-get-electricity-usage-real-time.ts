import { useState, useCallback, useEffect } from "react";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageQueryParams } from "@/features/summary/domain/params/query-params";
import { GetElectricityUsageUseCase } from "@/features/summary/domain/use-cases/get-electricity-usage-use-case";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { RealTimeInterval, TimePeriod } from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getDateStringFromDate,
  getStartAndEndDateOfDayFromDate,
} from "@/shared/utils/helpers/date-helpers";

interface UseGetElectricityUsageRealTimeReturn {
  periodicData: ElectricityUsageModel[];
  selectedInterval: RealTimeInterval;
  error: BaseErrorModel | null;
  loading: boolean;
  setSelectedInterval: (interval: RealTimeInterval) => void;
  fetchElectricityUsage: () => void;
  reset: () => void;
}

export const useGetElectricityUsageRealTime =
  (): UseGetElectricityUsageRealTimeReturn => {
    // States

    /// Store data every seconds based on selected interval
    /// e.g., every 10s => store 10 count of data, 15s => store 15 count of data,
    /// 30s => store 30 count of data, 60s => store 60 count of data
    const [periodicData, setPeriodicData] = useState<ElectricityUsageModel[]>(
      []
    );
    const [selectedInterval, setSelectedInterval] = useState<RealTimeInterval>(
      RealTimeInterval.Sixty
    );
    const [error, setError] = useState<BaseErrorModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Helper function to prepare query parameters
    const prepareQueryParams = (): GetElectricityUsageQueryParams => {
      const dateRange = getStartAndEndDateOfDayFromDate(new Date());

      return {
        period: (TimePeriod.Daily as string).toLowerCase(), // Clear period for real-time data
        startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
        endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
      };
    };

    const fetchElectricityUsage = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const getElectricityUsageUseCase = new GetElectricityUsageUseCase();
        const result = await getElectricityUsageUseCase.execute(
          prepareQueryParams()
        );
        // Append new data to periodicData based on selectedInterval
        if (isErrorModel(result)) {
          setError(result);
          return;
        }
        const currentPeriod: string = getDateStringFromDate(new Date()); // YYYY-MM-DD
        /// get the element for the current period only
        const currentData = result.usage?.data.find(
          (item) => item.period === currentPeriod
        );
        if (result.usage && result.usage.data.length > 0 && currentData) {
          setPeriodicData((prevData) => {
            if (prevData.length < 12) {
              // If less than selectedInterval, append new data
              const newData = [...prevData, currentData];
              return newData;
            } else {
              // If equal or more than selectedInterval, remove the oldest data and append new data
              const newData = [...prevData.slice(1), currentData];
              return newData;
            }
          });
        }
      } catch (error) {
        if (isErrorModel(error)) {
          setError(error);
        } else {
          Logger.error("Error fetching electricity usage", error);
          setError({
            type: ErrorType.UNEXPECTED,
            message: "Unknown error occurred",
          });
        }
      } finally {
        setLoading(false);
      }
    }, []);

    const reset = () => {
      setPeriodicData([]);
      setSelectedInterval(RealTimeInterval.Ten);
      setError(null);
      setLoading(false);
    };

    useEffect(() => {
      setPeriodicData([]);
    }, [selectedInterval]);

    return {
      periodicData,
      selectedInterval,
      error,
      loading,
      setSelectedInterval: setSelectedInterval,
      fetchElectricityUsage,
      reset,
    };
  };
