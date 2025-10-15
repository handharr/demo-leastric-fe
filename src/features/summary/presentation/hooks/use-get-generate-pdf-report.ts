import { useCallback } from "react";
import { GetGeneratePdfReportUseCase } from "@/features/summary/domain/use-cases/get-generate-pdf-report-use-case";
import { GetGeneratePdfReportQueryParams } from "@/features/summary/domain/params/query-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetGeneratePdfReportModel } from "@/features/summary/domain/entities/summary-models";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export interface UseGetGeneratePdfReport {
  execute: (params: {
    startDate?: string;
    endDate?: string;
    companyName?: string;
  }) => void;
}

export function useGetGeneratePdfReport(
  onSuccess: (data: GetGeneratePdfReportModel) => void,
  onError: (error: BaseErrorModel) => void
): UseGetGeneratePdfReport {
  const execute = useCallback(
    async (params: GetGeneratePdfReportQueryParams) => {
      try {
        const getGeneratePdfReportUseCase = new GetGeneratePdfReportUseCase();
        const result = await getGeneratePdfReportUseCase.execute(params);
        if (isErrorModel(result)) {
          onError(result);
        } else {
          onSuccess(result);
        }
      } catch (error) {
        Logger.error("useGetGeneratePdfReport - execute:", error);
        onError({
          type: ErrorType.UNEXPECTED,
          message: "An unexpected error occurred while generating PDF report.",
        });
      }
    },
    [onError, onSuccess]
  );

  return { execute };
}
