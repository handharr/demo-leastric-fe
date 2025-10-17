import { useCallback, useState } from "react";
import { GetGeneratePdfReportUseCase } from "@/features/summary/domain/use-cases/get-generate-pdf-report-use-case";
import { GetGeneratePdfReportQueryParams } from "@/features/summary/domain/params/query-params";
import { isErrorModel } from "@/core/domain/entities/base-error-model";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";
import { pdfDownloadHelper } from "@/core/utils/helpers/file-download-helper";

export interface UseGetGeneratePdfReportReturn {
  execute: (params: GetGeneratePdfReportQueryParams) => void;
  error?: BaseErrorModel;
  loading?: boolean;
  successMessage?: string;
  reset?: () => void;
}

export function useGetGeneratePdfReport(): UseGetGeneratePdfReportReturn {
  const [error, setError] = useState<BaseErrorModel | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );

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
          await pdfDownloadHelper(result.fileUrl, result.fileName);
        }
      } catch (error) {
        Logger.error("useGetGeneratePdfReport - execute:", error);
        setError({
          type: ErrorType.UNEXPECTED,
          message: "An unexpected error occurred while generating PDF report.",
        });
      }
    },
    [setError]
  );

  const reset = useCallback(() => {
    setError(undefined);
    setLoading(false);
    setSuccessMessage(undefined);
  }, []);

  return { execute, error, loading, successMessage, reset };
}
