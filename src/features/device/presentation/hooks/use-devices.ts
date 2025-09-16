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
import {
  deviceFilterDefaultValue,
  DeviceFilterState,
} from "../components/device-filter-modal";

const useDummy = false;

export interface UseDevicesReturn {
  devices: DeviceModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationModel;
  search: string;
  debouncedSearch: string;
  activeFilters: DeviceFilterState;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reloadDevices: () => void;
  setSearch: (search: string) => void;
  setActiveFilters: (filters: DeviceFilterState) => void;
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

export function useDevices(): UseDevicesReturn {
  const [activeFilters, setActiveFilters] = useState<DeviceFilterState>(
    deviceFilterDefaultValue()
  );
  const [search, setSearch] = useState("");
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

  // Debounce search with 500ms delay
  const debouncedSearch = useDebounce(search, 500);

  const fetchDevices = useCallback(
    async ({
      page,
      take,
      search,
      size,
      keyword,
    }: {
      page?: number;
      take?: number;
      search?: string;
      size?: number;
      keyword?: string;
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
            keyword,
          },
        });

        Logger.info("useDevices", "execute", result);

        if (isErrorModel(result)) {
          setError(result.message);
        } else {
          setDevices(result.devices);
          setPagination(() => ({
            ...result.pagination,
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

  const reloadDevices = useCallback(() => {
    fetchDevices({
      page: pagination.page,
      take: pagination.take,
      search: debouncedSearch,
      size: pagination.take,
    });
  }, [fetchDevices, pagination.page, pagination.take, debouncedSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page on new search
    }));
  }, [debouncedSearch]);

  // Fetch devices when filter, debounced search, page, or take changes
  useEffect(() => {
    fetchDevices({
      page: pagination.page,
      take: pagination.take,
      search: debouncedSearch,
      size: pagination.take,
      keyword: activeFilters.singleSelection.location,
    });
  }, [
    debouncedSearch,
    pagination.page,
    pagination.take,
    fetchDevices,
    activeFilters.singleSelection.location,
  ]);

  return {
    devices,
    loading,
    error,
    pagination,
    search,
    debouncedSearch, // Expose debounced search if needed
    activeFilters,
    nextPage,
    previousPage,
    goToPage,
    reloadDevices,
    setSearch,
    setActiveFilters,
  };
}
