import { useState, useCallback, useEffect } from "react";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { GetUsageSummaryModel } from "@/features/summary/domain/entities/summary-models";
import { GetUsageSummaryQueryParams } from "@/features/summary/domain/params/query-params";
import { GetUsageSummaryUseCase } from "@/features/summary/domain/use-cases/get-usage-summary-use-case";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";

interface UseGetUsageSummaryReturn {
  data: GetUsageSummaryModel | null;
  error: BaseErrorModel | null;
  loading: boolean;
  reset: () => void;
}

export const useGetUsageSummary = (): UseGetUsageSummaryReturn => {
  const [data, setData] = useState<GetUsageSummaryModel | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsageSummary = useCallback(
    async (
      month: number = new Date().getMonth(),
      year: number = new Date().getFullYear()
    ) => {
      try {
        setLoading(true);
        setError(null);
        const getUsageSummaryUseCase = new GetUsageSummaryUseCase();
        const queryParam: GetUsageSummaryQueryParams = {
          month,
          year,
        };
        const result = await getUsageSummaryUseCase.execute(queryParam);

        Logger.info(
          "useGetUsageSummary",
          "Fetched usage summary successfully",
          result
        );

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
        Logger.error("useGetUsageSummary", "Exception occurred:", errorMessage);
        setError({
          message: "Failed to fetch usage summary",
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

  useEffect(() => {
    fetchUsageSummary();
  }, [fetchUsageSummary]);

  return {
    data,
    error,
    loading,
    reset,
  };
};
