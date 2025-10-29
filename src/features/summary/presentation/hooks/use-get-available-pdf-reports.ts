import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { Logger } from "@/core/utils/logger/logger";
import { ErrorType } from "@/core/domain/enums/base-enum";
import { useCallback, useState } from "react";
import { GetAvaliablePDFReportsQueryParams } from "@/features/summary/domain/params/query-params";
import { GetAvailablePDFReportsModel } from "@/features/summary/domain/entities/summary-models";
import { GetAvailablePdfReportsUseCase } from "@/features/summary/domain/use-cases/get-available-pdf-reports";
import { PaginationModel } from "@/core/domain/entities/base-model";

interface UseGetAvailablePdfReportsReturn {
  data: GetAvailablePDFReportsModel | null;
  error: BaseErrorModel | null;
  loading: boolean;
  fetch: (location: string) => Promise<void>;
  reset: () => void;
  nextPage?: () => void;
  previousPage?: () => void;
  goToPage?: (page: number) => void;
}

interface UseGetAvailablePdfReportsProps {
  location?: string;
  deviceId?: string;
}

export function useGetAvailablePdfReports({
  location,
  deviceId,
}: UseGetAvailablePdfReportsProps): UseGetAvailablePdfReportsReturn {
  const [data, setData] = useState<GetAvailablePDFReportsModel | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    size: 10,
  });

  const fetchAvailablePdfReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const getAvailablePdfReportsUseCase = new GetAvailablePdfReportsUseCase();
      const queryParam: GetAvaliablePDFReportsQueryParams = {
        page: pagination.page,
        size: pagination.size,
        location: location,
        deviceId: deviceId,
      };
      const result = await getAvailablePdfReportsUseCase.execute(queryParam);

      Logger.info(
        "useGetAvailablePdfReports",
        "Fetched available PDF reports successfully",
        result
      );

      if ("message" in result) {
        setError(result);
        setData(null);
      } else {
        setPagination((prev) => ({
          ...prev,
          itemCount: result.pagination.itemCount,
          pageCount: result.pagination.pageCount,
          hasPreviousPage: result.pagination.hasPreviousPage,
          hasNextPage: result.pagination.hasNextPage,
        }));
        setData(result);
      }
    } catch (err) {
      Logger.error(
        "useGetAvailablePdfReports",
        "Error fetching available PDF reports",
        err
      );
      setError({
        type: ErrorType.UNEXPECTED,
        message: "An unknown error occurred.",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [location, deviceId, pagination.page, pagination.size]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const nextPage = useCallback(() => {
    if (!pagination.hasNextPage) return;
    setPagination((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
    fetchAvailablePdfReports();
  }, [fetchAvailablePdfReports, pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) return;
    setPagination((prev) => ({
      ...prev,
      page: prev.page - 1,
    }));
    fetchAvailablePdfReports();
  }, [fetchAvailablePdfReports, pagination.hasPreviousPage]);

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({
        ...prev,
        page,
      }));
      fetchAvailablePdfReports();
    },
    [fetchAvailablePdfReports]
  );

  return {
    data,
    error,
    loading,
    fetch: fetchAvailablePdfReports,
    reset,
    nextPage,
    previousPage,
    goToPage,
  };
}
