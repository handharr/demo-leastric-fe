"use client";

import { useState } from "react";
import Image from "next/image";
import { FilterChip } from "@/shared/presentation/components/filter/filter-chip";
import {
  DeviceFilterState,
  DeviceFilterModal,
  isDefaultFilters,
} from "@/features/device/presentation/components/device-filter-modal";
import { DeviceTable } from "@/features/device/presentation/components/device-table";

export default function DevicePage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<DeviceFilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });

  const hasActiveFilters = !isDefaultFilters(activeFilters);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-typography-headline">
          Device List
        </h1>
      </div>

      {/* Filter and search Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
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
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Location Chip */}
          {activeFilters.location !== "all" && (
            <FilterChip
              value={activeFilters.location}
              onRemove={() =>
                setActiveFilters((prev) => ({
                  ...prev,
                  location: "all",
                }))
              }
            />
          )}
          {/* SubLocation Chip */}
          {activeFilters.subLocation !== "all" && (
            <FilterChip
              value={activeFilters.subLocation}
              onRemove={() =>
                setActiveFilters((prev) => ({
                  ...prev,
                  subLocation: "all",
                }))
              }
            />
          )}
          {/* Detail Location Chip */}
          {activeFilters.detailLocations.length > 0 && (
            <FilterChip
              label="Detail location"
              value={
                <span className="inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
                  {activeFilters.detailLocations.length}
                </span>
              }
              onRemove={() =>
                setActiveFilters((prev) => ({
                  ...prev,
                  detailLocations: [],
                }))
              }
            />
          )}
          {/* Unit Chip */}
          {activeFilters.units.length > 0 &&
            !(
              activeFilters.units.length === 1 &&
              activeFilters.units[0] === "watt"
            ) && (
              <FilterChip
                label="Unit"
                value={
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
                    {activeFilters.units.length}
                  </span>
                }
                onRemove={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    units: ["watt"],
                  }))
                }
              />
            )}
        </div>
      )}

      {/* Device Table */}
      <DeviceTable />
    </div>
  );
}
