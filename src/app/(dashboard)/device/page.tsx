"use client";

import Image from "next/image";
import { DeviceTable } from "@/features/device/presentation/components/device-table";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import {
  DeviceFilterState,
  deviceFilterDefaultValue,
  getDeviceFiltersMeta,
} from "@/features/device/presentation/components/device-filter-modal";
import { useDevices } from "@/features/device/presentation/hooks/use-devices";
import { Pagination } from "@/shared/presentation/components/pagination";
import { useGetLocations } from "@/features/device/presentation/hooks/locations/use-get-locations";
import { FilterOption } from "@/shared/presentation/types/filter-ui";
import { useGetDevicesStatus } from "@/features/device/presentation/hooks/use-get-devices-status";
import { useEffect } from "react";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export default function DevicePage() {
  const {
    devices,
    loading,
    error,
    pagination,
    search,
    activeFilters,
    nextPage,
    previousPage,
    goToPage,
    reloadDevices,
    setSearch,
    setActiveFilters,
  } = useDevices();
  const { data: locations, isLoading: getLocationsLoading } = useGetLocations();
  const {
    devicesStatus,
    loading: getStatusLoading,
    refetch: fetchDevicesStatus,
  } = useGetDevicesStatus();

  useEffect(() => {
    fetchDevicesStatus();
  }, [fetchDevicesStatus]);

  const handleFilterApply = (filters: DeviceFilterState) => {
    setActiveFilters(filters);
  };

  const handleFilterReset = (resetValue: DeviceFilterState) => {
    setActiveFilters(resetValue);
  };

  const options: FilterOption[] = locations
    ? [
        { id: "all", label: "All locations" },
        ...locations.map((loc: string) => ({ id: loc, label: loc })),
      ]
    : [];

  // Update filter meta with dynamic options
  const deviceFilterMeta = getDeviceFiltersMeta({ options });

  return (
    <div className="flex min-h-screen flex-col gap-[16px] bg-gray-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-typography-headline">
          Device List
        </h1>
      </div>

      {/* Filter and search Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-white rounded-lg border px-3 py-2 max-w-xs gap-[8px]">
          <Image
            src="/resources/icons/system/search.svg"
            alt="Search"
            width={16}
            height={16}
            className="w-[16px] h-[16px]"
          />
          <input
            className="w-full outline-none bg-transparent text-gray-700"
            placeholder="Search device name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Clear Search Button */}
          {search && (
            <button onClick={() => setSearch("")} className="cursor-pointer">
              <Image
                src="/resources/icons/menu/close"
                alt="Clear"
                width={12}
                height={12}
                className="w-[12px] h-[12px] object-contain opacity-50 hover:opacity-100"
              />
            </button>
          )}
        </div>
        {/* Filter Modal */}
        <GenericFilterModal<DeviceFilterState>
          currentState={activeFilters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          filterMeta={deviceFilterMeta}
          defaultValue={deviceFilterDefaultValue()}
        />
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={(newFilters) => setActiveFilters(newFilters)}
        meta={deviceFilterMeta}
      />

      {/* Device Table */}
      <div>
        <DeviceTable
          devices={devices}
          devicesStatus={optionalValue(devicesStatus?.devices).orEmptyArray()}
          loading={loading || getStatusLoading || getLocationsLoading}
          error={error}
          onEditSuccess={() => reloadDevices()}
        />
        {/* Pagination */}
        <Pagination
          model={pagination}
          onPageChange={(page) => goToPage(page)}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
        />
      </div>
    </div>
  );
}
