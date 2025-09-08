"use client";

import { useState } from "react";
import Image from "next/image";
import { DeviceTable } from "@/features/device/presentation/components/device-table";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import {
  DeviceFilterState,
  deviceFilterDefaultValue,
  deviceFilterMeta,
} from "@/features/device/presentation/components/device-filter-modal";

export default function DevicePage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<DeviceFilterState>(
    deviceFilterDefaultValue()
  );

  const handleFilterApply = (filters: DeviceFilterState) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
  };

  const handleFilterReset = (resetValue: DeviceFilterState) => {
    setActiveFilters(resetValue);
    console.log("Filters reset");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="mb-[16px]">
        <h1 className="text-2xl font-bold text-typography-headline">
          Device List
        </h1>
      </div>

      {/* Filter and search Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-[16px]">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-white rounded-lg border px-3 py-2 max-w-xs">
          <Image
            src="resources/icons/system/search.svg"
            alt="Search"
            width={16}
            height={16}
            className="mr-2"
          />
          <input
            className="w-full outline-none bg-transparent text-gray-700"
            placeholder="Search device name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
      <DeviceTable search={search} />
    </div>
  );
}
