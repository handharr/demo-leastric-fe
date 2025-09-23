import { useState, useCallback } from "react";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { GetElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageQueryParams } from "@/features/summary/domain/params/query-params";
import { GetElectricityUsageUseCase } from "@/features/summary/domain/use-cases/get-electricity-usage-use-case";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { EnergyUnit, TimePeriod } from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getDateRangeByTimePeriod,
} from "@/shared/utils/helpers/date-helpers";

interface UseGetElectricityUsageReturn {
  data: GetElectricityUsageModel | null;
  error: BaseErrorModel | null;
  loading: boolean;
  fetchElectricityUsage: ({
    period,
    unit,
    startDate,
    endDate,
  }: GetElectricityUsageQueryParams) => Promise<void>;
  reset: () => void;
}

export const useGetElectricityUsage = (): UseGetElectricityUsageReturn => {
  const [data, setData] = useState<GetElectricityUsageModel | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchElectricityUsage = useCallback(
    async ({
      period = TimePeriod.Monthly,
      unit = EnergyUnit.KWH,
    }: GetElectricityUsageQueryParams = {}) => {
      try {
        setLoading(true);
        setError(null);
        let normalizedPeriod: string;
        let startDate: string | undefined = undefined;
        let endDate: string | undefined = undefined;

        try {
          const dateRange = getDateRangeByTimePeriod(period as TimePeriod);
          startDate = formatDateToStringUTCWithoutMs(dateRange.startDate);
          endDate = formatDateToStringUTCWithoutMs(dateRange.endDate);
        } catch (dateError) {
          Logger.warn(
            "useGetElectricityUsage",
            "Date range calculation failed, proceeding without date range:",
            period,
            dateError
          );
        }

        // Normalize period to lowercase string
        try {
          normalizedPeriod = (period as TimePeriod).toLowerCase();
        } catch (castError) {
          Logger.warn(
            "useGetElectricityUsage",
            "Period casting failed, using default:",
            period,
            castError
          );
          normalizedPeriod = TimePeriod.Monthly.toLowerCase();
        }

        const queryParam: GetElectricityUsageQueryParams = {
          period: normalizedPeriod.toLocaleLowerCase(),
          unit,
          startDate: startDate,
          endDate: endDate,
        };

        Logger.info(
          "useGetElectricityUsage",
          "Fetching electricity usage with params:",
          { period, unit }
        );

        const getElectricityUsageUseCase = new GetElectricityUsageUseCase();
        const result = await getElectricityUsageUseCase.execute(queryParam);

        Logger.info("useGetElectricityUsage", "Fetched data:", result);

        if (isErrorModel(result)) {
          setError(result);
          setData(null);
        } else {
          setData(result);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        Logger.error(
          "useGetElectricityUsage",
          "Exception occurred:",
          errorMessage
        );
        setError({
          message: "Failed to fetch electricity usage",
          details: errorMessage,
          type: ErrorType.UNEXPECTED,
        } as BaseErrorModel);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    fetchElectricityUsage,
    reset,
  };
};
