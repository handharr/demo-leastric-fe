"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DeviceFilterState,
  DeviceFilterModal,
  deviceFilterMeta,
} from "@/features/device/presentation/components/device-filter-modal";
import { DeviceTable } from "@/features/device/presentation/components/device-table";
import { ActiveFilterChips } from "@/shared/presentation/components/active-filter-chips";

export default function DevicePage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<DeviceFilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });

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
        <DeviceFilterModal
          currentState={activeFilters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />
      </div>

      {/* Active Filters Chips */}
      <ActiveFilterChips<DeviceFilterState>
        filters={activeFilters}
        onChange={setActiveFilters}
        meta={deviceFilterMeta}
      />

      {/* Device Table */}
      <DeviceTable search={search} />
    </div>
  );
}
