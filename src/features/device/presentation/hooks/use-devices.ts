import { useState, useCallback } from "react";
import { GetAllDevicesUseCase } from "@/features/device/domain/use-cases/get-all-device-use-case";
import {
  DeviceModel,
  deviceModelDummies,
} from "@/features/device/domain/entities/device-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { PaginationModel } from "@/shared/domain/entities/models-interface";

const useDummy = false;

export function useDevices() {
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    take: 10,
    itemCount: 10,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const nextPage = useCallback(() => {
    if (!pagination.hasNextPage) return;
    setPagination((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) return;
    setPagination((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, [pagination.hasPreviousPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.pageCount) return;
      if (page === pagination.page) return;
      setPagination((prev) => ({
        ...prev,
        page: page,
      }));
    },
    [pagination.pageCount, pagination.page]
  );

  const fetchDevices = useCallback(
    async ({ search }: { search: string }) => {
      setLoading(true);
      setError(null);

      if (useDummy) {
        setDevices(deviceModelDummies);
        setLoading(false);
        return;
      }

      try {
        const useCase = new GetAllDevicesUseCase();
        const result = await useCase.execute({
          queryParam: {
            sortOrder: "ASC",
            page: pagination.page,
            take: pagination.take,
            name: search,
            size: pagination.take,
          },
        });

        Logger.info("useDevices", "execute", result);

        if (isErrorModel(result)) {
          setError(result.message);
        } else {
          setDevices(result.devices);
          setPagination(result.pagination);
        }
      } catch (e: unknown) {
        setError(
          optional((e as Error)?.message).orDefault("Failed to fetch devices")
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.take]
  );

  return {
    devices,
    loading,
    error,
    pagination,
    fetchDevices,
    nextPage,
    previousPage,
    goToPage,
  };
}
