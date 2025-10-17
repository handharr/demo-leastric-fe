import {
  BaseErrorModel,
  createErrorModel,
  isErrorModel,
} from "@/core/domain/entities/base-error-model";
import { GetExportToCsvModel } from "@/features/summary/domain/entities/summary-models";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";
import { useCallback, useState } from "react";
import { GetExportToCsvUseCase } from "@/features/summary/domain/use-cases/get-export-to-csv-use-case";
import { csvDownloadHelper } from "@/core/utils/helpers/file-download-helper";

export interface UseGetExportToCsvReturn {
  loading: boolean;
  error: BaseErrorModel | null;
  fetchExportToCsv: (params: Partial<GetExportToCsvQueryParams>) => void;
  fetchBulkData: (paramsArray: Partial<GetExportToCsvQueryParams>[]) => void;
  reset: () => void;
}

export function useGetExportToCsv(): UseGetExportToCsvReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchExportToCsv = async (
    params: Partial<GetExportToCsvQueryParams>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const useCase = new GetExportToCsvUseCase();
      const result = await useCase.execute({
        ...params,
      });

      if (isErrorModel(result)) {
        setError(result);
        return;
      }

      await csvDownloadHelper(result.fileUrl, result.fileName);
      setSuccessMessage(`File ${result.fileName} downloaded successfully.`);
    } catch (err) {
      const errorModel = createErrorModel(err as Error);
      setError(errorModel);
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkData = useCallback(
    async (paramsArray: Partial<GetExportToCsvQueryParams>[]) => {
      setLoading(true);
      setError(null);

      const results: GetExportToCsvModel[] = [];
      for (const params of paramsArray) {
        try {
          const useCase = new GetExportToCsvUseCase();
          const result = await useCase.execute({
            ...params,
          });

          if (isErrorModel(result)) {
            setError(result);
            return;
          }

          results.push(result);
        } catch (err) {
          const errorModel = createErrorModel(err as Error);
          setError(errorModel);
          return;
        }
      }

      setLoading(false);
    },
    []
  );

  const reset = () => {
    setError(null);
    setLoading(false);
    setSuccessMessage(null);
  };

  return {
    loading,
    error,
    fetchExportToCsv,
    fetchBulkData,
    reset,
  };
}
