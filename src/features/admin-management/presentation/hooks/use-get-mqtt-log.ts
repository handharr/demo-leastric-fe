import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { Logger } from "@/shared/utils/logger/logger";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { useCallback, useState } from "react";
import { GetMqttLogsQueryParams } from "@/features/admin-management/domain/params/admin-management-query-params";
import { MqttLogModel } from "@/features/admin-management/domain/entity/admin-management-model";
import { GetMqttLogUseCase } from "@/features/admin-management/domain/use-cases/get-mqtt-log-use-case";

export interface UseGetMqttLogReturn {
  logs: MqttLogModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationModel;
  nextPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  previousPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  goToPage: (params?: Partial<GetMqttLogsQueryParams>) => void;
  reload: () => void;
  fetchLogs: (params?: Partial<GetMqttLogsQueryParams>) => void;
  reset: () => void;
}

export function useGetMqttLog(): UseGetMqttLogReturn {
  const [logs, setLogs] = useState<MqttLogModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    size: 10,
  });

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
        fetchLogsInternal({
          page: pagination.page + 1,
          size: pagination.size,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination]
  );

  const previousPage = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      if (pagination.hasPreviousPage) {
        fetchLogsInternal({
          page: pagination.page - 1,
          size: pagination.size,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination]
  );

  const goToPage = useCallback(
    (params?: Partial<GetMqttLogsQueryParams>) => {
      if (
        params?.page &&
        params.page >= 1 &&
        params.page <= pagination.pageCount
      ) {
        fetchLogsInternal({
          page: params.page,
          size: pagination.size,
          ...params,
        });
      }
    },
    [fetchLogsInternal, pagination]
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
    setPagination({
      page: 1,
      itemCount: 0,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      size: 10,
    });
  }, []);

  return {
    logs,
    loading,
    error,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    reload,
    fetchLogs,
    reset,
  };
}
