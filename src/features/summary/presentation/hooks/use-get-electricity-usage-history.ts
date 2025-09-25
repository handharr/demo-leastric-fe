import { GetElectricityUsageHistoryUseCase } from "@/features/summary/domain/use-cases/get-electricity-usage-history-use-case";
import { GetElectricityUsageHistoryQueryParams } from "@/features/summary/domain/params/query-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { Logger } from "@/shared/utils/logger/logger";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { useCallback, useState } from "react";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";

export interface UseGetElectricityUsageHistoryReturn {
  usageHistory: ElectricityUsageModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationModel;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reload: () => void;
  fetchUsageHistory: (
    params: Partial<GetElectricityUsageHistoryQueryParams>
  ) => void;
}

export function useGetElectricityUsageHistory(): UseGetElectricityUsageHistoryReturn {
  const [usageHistory, setUsageHistory] = useState<ElectricityUsageModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    size: 10,
  });

  const fetchUsageHistoryInternal = useCallback(
    async (params: GetElectricityUsageHistoryQueryParams) => {
      setLoading(true);
      setError(null);

      try {
        const useCase = new GetElectricityUsageHistoryUseCase();
        const result = await useCase.execute(params);

        Logger.info("useGetElectricityUsageHistory", "execute", result);

        if (isErrorModel(result)) {
          setError(result.message);
          setUsageHistory([]);
          setPagination({
            page: 1,
            take: 10,
            itemCount: 0,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
            size: 10,
          });
        } else {
          setUsageHistory(result.usage.data);
          setPagination(result.pagination);
        }
      } catch (e: unknown) {
        const errorMessage = optional((e as Error)?.message).orDefault(
          "Failed to fetch electricity usage history"
        );
        Logger.error("useGetElectricityUsageHistory", "error", errorMessage);
        setError(errorMessage);
        setUsageHistory([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUsageHistory = useCallback(
    (params: Partial<GetElectricityUsageHistoryQueryParams>) => {
      const newParams: GetElectricityUsageHistoryQueryParams = {
        ...params,
      };
      fetchUsageHistoryInternal(newParams);
    },
    [fetchUsageHistoryInternal]
  );

  const nextPage = useCallback(() => {
    if (!pagination.hasNextPage) return;
    const newPage = pagination.page + 1;
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
    fetchUsageHistory({ page: newPage });
  }, [pagination.hasNextPage, pagination.page, fetchUsageHistory]);

  const previousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) return;
    const newPage = Math.max(pagination.page - 1, 1);
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
    fetchUsageHistory({ page: newPage });
  }, [pagination.hasPreviousPage, pagination.page, fetchUsageHistory]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.pageCount) return;
      if (page === pagination.page) return;
      setPagination((prev) => ({
        ...prev,
        page: page,
      }));
      fetchUsageHistory({ page });
    },
    [pagination.pageCount, pagination.page, fetchUsageHistory]
  );

  const reload = useCallback(() => {
    fetchUsageHistoryInternal({
      page: pagination.page,
    });
  }, [fetchUsageHistoryInternal, pagination.page]);

  return {
    usageHistory,
    loading,
    error,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    reload,
    fetchUsageHistory,
  };
}
