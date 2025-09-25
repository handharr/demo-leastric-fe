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
  comparedData: GetElectricityUsageModel | null;
  error: BaseErrorModel | null;
  loading: boolean;
  fetchElectricityUsage: (params: GetElectricityUsageQueryParams) => void;
  fetchComparedElectricityUsage: (
    params: GetElectricityUsageQueryParams
  ) => void;
  reset: () => void;
}

const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const subYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
};

export const useGetElectricityUsage = (): UseGetElectricityUsageReturn => {
  const [data, setData] = useState<GetElectricityUsageModel | null>(null);
  const [comparedData, setComparedData] =
    useState<GetElectricityUsageModel | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper function to prepare query parameters
  const prepareQueryParams = (
    params: GetElectricityUsageQueryParams
  ): GetElectricityUsageQueryParams => {
    const {
      period = TimePeriod.Monthly,
      unit = EnergyUnit.KWH,
      startDate,
      endDate,
    } = params;

    let _startDate = startDate;
    let _endDate = endDate;

    // Calculate date range if not provided
    if (!startDate || !endDate) {
      try {
        const { startDate: start, endDate: end } = getDateRangeByTimePeriod(
          period as TimePeriod
        );
        _startDate = formatDateToStringUTCWithoutMs(start);
        _endDate = formatDateToStringUTCWithoutMs(end);
      } catch (dateError) {
        Logger.warn(
          "useGetElectricityUsage",
          "Date range calculation failed, proceeding without date range:",
          period,
          dateError
        );
      }
    }

    // Normalize period to lowercase string
    let normalizedPeriod: string;
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

    return {
      period: normalizedPeriod,
      unit,
      startDate: _startDate,
      endDate: _endDate,
    };
  };

  // Generic fetch function
  const fetchElectricityUsageData = useCallback(
    async (
      params: GetElectricityUsageQueryParams,
      setDataCallback: (data: GetElectricityUsageModel | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);

        const queryParam = prepareQueryParams(params);

        Logger.info(
          "useGetElectricityUsage",
          "Fetching electricity usage with params:",
          { period: params.period, unit: params.unit }
        );

        const getElectricityUsageUseCase = new GetElectricityUsageUseCase();
        const result = await getElectricityUsageUseCase.execute(queryParam);

        Logger.info("useGetElectricityUsage", "Fetched data:", result);

        if (isErrorModel(result)) {
          setError(result);
          setDataCallback(null);
        } else {
          setDataCallback(result);
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

        setDataCallback(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchElectricityUsage = useCallback(
    (params: GetElectricityUsageQueryParams = {}) => {
      fetchElectricityUsageData(params, setData);
    },
    [fetchElectricityUsageData]
  );

  const fetchComparedElectricityUsage = useCallback(
    (params: GetElectricityUsageQueryParams = {}) => {
      fetchElectricityUsageData(params, setData);
      // Create new params for compared data
      const comparedPeriod: TimePeriod =
        (params.period as TimePeriod) || TimePeriod.Monthly;

      const { startDate: start, endDate: end } =
        getDateRangeByTimePeriod(comparedPeriod);

      // If period is daily or weekly, use last month for comparison
      // Else use last year
      // Substract one period
      let _startDate: string;
      let _endDate: string;
      if (
        comparedPeriod === TimePeriod.Daily ||
        comparedPeriod === TimePeriod.Weekly
      ) {
        _startDate = formatDateToStringUTCWithoutMs(subMonths(start, 1));
        _endDate = formatDateToStringUTCWithoutMs(subMonths(end, 1));
      } else {
        _startDate = formatDateToStringUTCWithoutMs(subYears(start, 1));
        _endDate = formatDateToStringUTCWithoutMs(subYears(end, 1));
      }

      const comparedParams: GetElectricityUsageQueryParams = {
        ...params,
        period: comparedPeriod,
        startDate: _startDate,
        endDate: _endDate,
      };

      fetchElectricityUsageData(comparedParams, setComparedData);
    },
    [fetchElectricityUsageData]
  );

  const reset = useCallback(() => {
    setData(null);
    setComparedData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    comparedData,
    error,
    loading,
    fetchElectricityUsage,
    fetchComparedElectricityUsage,
    reset,
  };
};
