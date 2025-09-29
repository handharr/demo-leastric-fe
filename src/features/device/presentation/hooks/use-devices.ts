import { DeviceModel } from "@/features/device/domain/entities/device-model";
import { GetAllDevicesUseCase } from "@/features/device/domain/use-cases/get-all-device-use-case";
import {
  deviceFilterDefaultValue,
  DeviceFilterState,
} from "@/features/device/presentation/components/device-filter-modal";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { Logger } from "@/shared/utils/logger/logger";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { useCallback, useEffect, useState } from "react";

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
    size: 10,
  });

  // Debounce search with 500ms delay
  const debouncedSearch = useDebounce(search, 500);

  const fetchDevices = useCallback(
    async ({
      page,
      search,
      size,
      location,
    }: {
      page?: number;
      search?: string;
      size?: number;
      location?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const useCase = new GetAllDevicesUseCase();
        let locationParam = location;
        if (locationParam === "all") {
          locationParam = undefined;
        }
        const result = await useCase.execute({
          queryParam: {
            sortOrder: "ASC",
            page: optional(page).orDefault(1),
            name: optional(search).orDefault(""),
            size: optional(size).orDefault(10),
            location: locationParam ?? undefined,
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
      search: debouncedSearch,
      size: pagination.size,
    });
  }, [fetchDevices, pagination.page, debouncedSearch, pagination.size]);

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
      search: debouncedSearch,
      size: pagination.size,
      location: activeFilters.singleSelection.location,
    });
  }, [
    debouncedSearch,
    pagination.page,
    fetchDevices,
    activeFilters.singleSelection.location,
    pagination.size,
  ]);

  const reset = useCallback(() => {
    setDevices([]);
    setLoading(true);
    setError(null);
    setPagination({
      page: 1,
      take: 10,
      itemCount: 10,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      size: 10,
    });
    setSearch("");
    setActiveFilters(deviceFilterDefaultValue());
  }, []);

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
    reset,
  };
}
