import { GetElectricityUsageHistoryUseCase } from "@/features/summary/domain/use-cases/get-electricity-usage-history-use-case";
import { GetElectricityUsageHistoryQueryParams } from "@/features/summary/domain/params/query-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { Logger } from "@/shared/utils/logger/logger";
import {
  optional,
  optionalValue,
} from "@/shared/utils/wrappers/optional-wrapper";
import { useCallback, useState } from "react";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { TimePeriod } from "@/shared/domain/enum/enums";
import {
  formatDateToStringUTCWithoutMs,
  getDateRangeByTimePeriod,
} from "@/shared/utils/helpers/date-helpers";

export interface UseGetElectricityUsageHistoryReturn {
  usageHistory: ElectricityUsageModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationModel;
  nextPage: (params: Partial<GetElectricityUsageHistoryQueryParams>) => void;
  previousPage: (
    params: Partial<GetElectricityUsageHistoryQueryParams>
  ) => void;
  goToPage: (params: Partial<GetElectricityUsageHistoryQueryParams>) => void;
  reload: () => void;
  fetchUsageHistory: (
    params: Partial<GetElectricityUsageHistoryQueryParams>
  ) => void;
  reset: () => void;
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
      let startDate = params.startDate;
      let endDate = params.endDate;
      const period = params.period || TimePeriod.Daily;
      const size = optionalValue(params.size).orDefault(10);

      if (!startDate || !endDate) {
        const dateRange = getDateRangeByTimePeriod(TimePeriod.Daily);
        startDate = formatDateToStringUTCWithoutMs(dateRange.startDate);
        endDate = formatDateToStringUTCWithoutMs(dateRange.endDate);
      }

      const usedParams: GetElectricityUsageHistoryQueryParams = {
        ...params,
        startDate,
        endDate,
        period: period.toLocaleLowerCase(),
        size,
      };

      try {
        const useCase = new GetElectricityUsageHistoryUseCase();
        const result = await useCase.execute(usedParams);

        Logger.info("useGetElectricityUsageHistory", "execute", result);

        if (isErrorModel(result)) {
          setError(result.message);
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

  const nextPage = useCallback(
    (params: Partial<GetElectricityUsageHistoryQueryParams>) => {
      const { startDate, endDate } = params;
      if (!pagination.hasNextPage) return;
      const newPage = pagination.page + 1;
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
      fetchUsageHistory({ ...params, page: newPage, startDate, endDate });
    },
    [pagination.hasNextPage, pagination.page, fetchUsageHistory]
  );

  const previousPage = useCallback(
    (params: Partial<GetElectricityUsageHistoryQueryParams>) => {
      const { startDate, endDate } = params;
      if (!pagination.hasPreviousPage) return;
      const newPage = Math.max(pagination.page - 1, 1);
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
      fetchUsageHistory({ ...params, page: newPage, startDate, endDate });
    },
    [pagination.hasPreviousPage, pagination.page, fetchUsageHistory]
  );

  const goToPage = useCallback(
    (params: Partial<GetElectricityUsageHistoryQueryParams>) => {
      const { page, startDate, endDate } = params;
      const _page = optionalValue(page).orZero();
      if (_page < 1 || _page > pagination.pageCount) return;
      if (_page === pagination.page) return;
      setPagination((prev) => ({
        ...prev,
        page: _page,
      }));
      fetchUsageHistory({ ...params, page: _page, startDate, endDate });
    },
    [pagination.pageCount, pagination.page, fetchUsageHistory]
  );

  const reload = useCallback(() => {
    fetchUsageHistoryInternal({
      page: pagination.page,
    });
  }, [fetchUsageHistoryInternal, pagination.page]);

  const reset = useCallback(() => {
    setUsageHistory([]);
    setLoading(false);
    setError(null);
    setPagination({
      page: 1,
      take: 10,
      itemCount: 0,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      size: 10,
    });
  }, []);

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
    reset,
  };
}
