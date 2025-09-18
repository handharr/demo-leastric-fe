import { useState, useCallback } from "react";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { GetElectricityUsageQueryParams } from "@/features/summary/domain/params/query-params";
import { GetElectricityUsageUseCase } from "@/features/summary/domain/use-cases/get-electricity-usage-use-case";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { EnergyUnit, TimePeriod } from "@/shared/domain/enum/enums";

interface UseGetElectricityUsageReturn {
  data: ElectricityUsageModel[] | null;
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
  const [data, setData] = useState<ElectricityUsageModel[] | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchElectricityUsage = useCallback(
    async ({
      period = TimePeriod.Monthly,
      unit = EnergyUnit.KWH,
      startDate = undefined,
      endDate = undefined,
    }: GetElectricityUsageQueryParams = {}) => {
      try {
        setLoading(true);
        setError(null);
        const queryParam: GetElectricityUsageQueryParams = {
          period: (period as string).toLowerCase(),
          unit,
          startDate,
          endDate,
        };
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
