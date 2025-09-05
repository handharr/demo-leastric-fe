import { useState, useCallback, useEffect } from "react";
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

export function useDevices({ search = "" }: { search?: string } = {}) {
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

  const fetchDevices = useCallback(
    async ({
      page,
      take,
      search,
      size,
    }: {
      page?: number;
      take?: number;
      search?: string;
      size?: number;
    }) => {
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
            page: optional(page).orDefault(1),
            take: optional(take).orDefault(10),
            name: optional(search).orDefault(""),
            size: optional(size).orDefault(10),
          },
        });

        Logger.info("useDevices", "execute", result);

        if (isErrorModel(result)) {
          setError(result.message);
        } else {
          setDevices(result.devices);
          // Only update pagination if it's different from current state
          setPagination(() => ({
            ...result.pagination, // Ensure we keep the intended page
          }));
        }
      } catch (e: unknown) {
        setError(
          optional((e as Error)?.message).orDefault("Failed to fetch devices")
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const nextPage = useCallback(() => {
    if (!pagination.hasNextPage) return;
    const newPage = pagination.page + 1;
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, [pagination.hasNextPage, pagination.page]);

  const previousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) return;
    const newPage = Math.max(pagination.page - 1, 1);
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, [pagination.hasPreviousPage, pagination.page]);

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

  useEffect(() => {
    // Only fetch on initial load and when search changes
    fetchDevices({
      page: pagination.page,
      take: pagination.take,
      search: search,
      size: pagination.take,
    });
  }, [search, pagination.page, pagination.take, fetchDevices]);

  return {
    devices,
    loading,
    error,
    pagination,
    nextPage,
    previousPage,
    goToPage,
  };
}
