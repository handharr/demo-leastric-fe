import { isErrorModel } from "@/core/domain/entities/base-error-model";
import { PaginationModel } from "@/core/domain/entities/base-model";
import { Logger } from "@/core/utils/logger/logger";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { useCallback, useState, useEffect } from "react";
import { GetMqttLogsQueryParams } from "@/features/admin-management/domain/params/admin-management-query-params";
import { MqttLogModel } from "@/features/admin-management/domain/entity/admin-management-model";
import { GetMqttLogUseCase } from "@/features/admin-management/domain/use-cases/get-mqtt-log-use-case";

export interface UseGetMqttLogReturn {
  logs: MqttLogModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationModel;
  search: string;
  nextPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  previousPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  goToPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  setSearch: (search: string) => void;
  reload: () => void;
  fetchLogs: (params?: Partial<GetMqttLogsQueryParams>) => void;
  reset: () => void;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useGetMqttLog(): UseGetMqttLogReturn {
  const [logs, setLogs] = useState<MqttLogModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    size: 10,
  });
  const debouncedSearch = useDebounce(search, 500);

  const fetchLogsInternal = useCallback(
    async (params: GetMqttLogsQueryParams) => {
      setLoading(true);
      setError(null);
      const size = optionalValue(params.size).orDefault(10);

      try {
        const useCase = new GetMqttLogUseCase();
        const result = await useCase.execute({
          ...params,
          size,
        });

        if (isErrorModel(result)) {
          setError(result.message);
          setLogs([]);
        } else {
          setLogs(optionalValue(result.logs).orEmptyArray());
          setPagination({
            page: optionalValue(params.page).orDefault(1),
            size,
            itemCount: optionalValue(result.pagination?.itemCount).orDefault(0),
            pageCount: optionalValue(result.pagination?.pageCount).orDefault(1),
            hasPreviousPage: optionalValue(
              result.pagination?.hasPreviousPage
            ).orDefault(false),
            hasNextPage: optionalValue(
              result.pagination?.hasNextPage
            ).orDefault(false),
          });
        }
      } catch (e) {
        Logger.error("useGetMqttLog:fetchLogsInternal", e);
        setError("An unexpected error occurred");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchLogs = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      fetchLogsInternal({
        page: 1,
        size: pagination.size,
        ...params,
      });
    },
    [fetchLogsInternal, pagination.size]
  );

  const nextPage = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      if (pagination.hasNextPage) {
        setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        fetchLogsInternal({
          page: pagination.page + 1,
          size: 10,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination.page, pagination.hasNextPage]
  );

  const previousPage = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      if (pagination.hasPreviousPage) {
        setPagination((prev) => ({
          ...prev,
          page: Math.max(prev.page - 1, 1),
        }));
        fetchLogsInternal({
          page: pagination.page - 1,
          size: 10,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination.page, pagination.hasPreviousPage]
  );

  const goToPage = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      if (
        params?.page &&
        params.page >= 1 &&
        params.page <= pagination.pageCount
      ) {
        setPagination((prev) => ({ ...prev, page: params.page! }));
        fetchLogsInternal({
          page: params.page,
          size: 10,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination.pageCount]
  );

  const reload = useCallback(() => {
    fetchLogsInternal({
      page: pagination.page,
      size: pagination.size,
    });
  }, [fetchLogsInternal, pagination.page, pagination.size]);

  const reset = useCallback(() => {
    setLogs([]);
    setLoading(false);
    setError(null);
    setSearch("");
    setPagination({
      page: 1,
      itemCount: 0,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      size: 10,
    });
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    fetchLogsInternal({
      page: 1,
      size: 10,
      deviceId: debouncedSearch,
    });
  }, [debouncedSearch, fetchLogsInternal]);

  return {
    logs,
    loading,
    error,
    pagination,
    search,
    nextPage,
    previousPage,
    goToPage,
    setSearch,
    reload,
    fetchLogs,
    reset,
  };
}
