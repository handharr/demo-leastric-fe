import { useCallback, useState } from "react";
import { GetGeneratePdfReportUseCase } from "@/features/summary/domain/use-cases/get-generate-pdf-report-use-case";
import { GetGeneratePdfReportQueryParams } from "@/features/summary/domain/params/query-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetGeneratePdfReportModel } from "@/features/summary/domain/entities/summary-models";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export interface UseGetGeneratePdfReportReturn {
  execute: (params: GetGeneratePdfReportQueryParams) => void;
  error?: BaseErrorModel;
  loading?: boolean;
  reset?: () => void;
}

export function useGetGeneratePdfReport(
  onSuccess: (data: GetGeneratePdfReportModel) => void
): UseGetGeneratePdfReportReturn {
  const [error, setError] = useState<BaseErrorModel | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (params: GetGeneratePdfReportQueryParams) => {
      try {
        setLoading(true);
        setError(undefined);
        Logger.info("useGetGeneratePdfReport - execute:", params);
        const getGeneratePdfReportUseCase = new GetGeneratePdfReportUseCase();
        const result = await getGeneratePdfReportUseCase.execute(params);
        setLoading(false);
        if (isErrorModel(result)) {
          Logger.error("useGetGeneratePdfReport - execute:", result);
          setError(result);
        } else {
          onSuccess(result);
        }
      } catch (error) {
        Logger.error("useGetGeneratePdfReport - execute:", error);
        setError({
          type: ErrorType.UNEXPECTED,
          message: "An unexpected error occurred while generating PDF report.",
        });
      }
    },
    [setError, onSuccess]
  );

  const reset = useCallback(() => {
    setError(undefined);
    setLoading(false);
  }, []);

  return { execute, error, loading, reset };
}
