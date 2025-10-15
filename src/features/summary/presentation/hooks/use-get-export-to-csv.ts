import {
  BaseErrorModel,
  createErrorModel,
  isErrorModel,
} from "@/core/domain/entities/base-error-model";
import { GetExportToCsvModel } from "@/features/summary/domain/entities/summary-models";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";
import { useCallback, useState } from "react";
import { GetExportToCsvUseCase } from "@/features/summary/domain/use-cases/get-export-to-csv-use-case";

export interface UseGetExportToCsvReturn {
  data: GetExportToCsvModel | null;
  bulkData: GetExportToCsvModel[];
  loading: boolean;
  error: BaseErrorModel | null;
  fetchExportToCsv: (params: Partial<GetExportToCsvQueryParams>) => void;
  fetchBulkData: (paramsArray: Partial<GetExportToCsvQueryParams>[]) => void;
  reset: () => void;
}

export function useGetExportToCsv(): UseGetExportToCsvReturn {
  const [data, setData] = useState<GetExportToCsvModel | null>(null);
  const [bulkData, setBulkData] = useState<GetExportToCsvModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);

  const fetchExportToCsv = async (
    params: Partial<GetExportToCsvQueryParams>
  ) => {
    setLoading(true);
    setError(null);
    setData(null);
    setBulkData([]);

    try {
      const useCase = new GetExportToCsvUseCase();
      const result = await useCase.execute({
        ...params,
      });

      if (isErrorModel(result)) {
        setError(result);
        return;
      }

      setData(result);
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
      setData(null);
      setBulkData([]);

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

      setBulkData(results);
      setLoading(false);
    },
    []
  );

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
    setBulkData([]);
  };

  return {
    data,
    bulkData,
    loading,
    error,
    fetchExportToCsv,
    fetchBulkData,
    reset,
  };
}
