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
  error?: BaseErrorModel;
  successMessage?: string;
  fetchExportToCsv: (params: Partial<GetExportToCsvQueryParams>) => void;
  fetchBulkData: (paramsArray: Partial<GetExportToCsvQueryParams>[]) => void;
  reset: () => void;
}

export function useGetExportToCsv(): UseGetExportToCsvReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );

  const fetchExportToCsv = async (
    params: Partial<GetExportToCsvQueryParams>
  ) => {
    setLoading(true);
    setError(undefined);

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
      setError(undefined);

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
    setError(undefined);
    setLoading(false);
    setSuccessMessage(undefined);
  };

  return {
    loading,
    error,
    successMessage,
    fetchExportToCsv,
    fetchBulkData,
    reset,
  };
}
