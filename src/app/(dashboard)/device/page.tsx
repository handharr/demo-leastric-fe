"use client";

import { useState } from "react";
import Image from "next/image";
import { FilterChip } from "@/shared/presentation/components/filter/filter-chip";
import {
  DeviceFilterState,
  DeviceFilterModal,
  isDefaultFilters,
} from "@/features/device/presentation/components/device-filter-modal";

const mockDevices = Array.from({ length: 10 }).map((_, i) => ({
  name: "Device 1",
  type: "Type A",
  status: i === 1 ? "Inactive" : "Active",
  tariff: i === 1 ? "R2" : "R1",
  phase: "Phase 1",
  power: i === 5 ? "200.000" : i === 3 ? "900" : "1.300",
  location: [
    "Apartement A",
    "Apartement B",
    "Apartement C",
    "Apartement D",
    "Apartement E",
    "Apartement F",
    "Apartement G",
    "Apartement H",
    "Apartement I",
    "Mall A",
  ][i],
  subLocation: "Tower A",
  detailLocation: "Floor 1",
}));

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

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
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-4 py-3 text-left font-semibold">Device name</th>
              <th className="px-4 py-3 text-left font-semibold">Device Type</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">
                Tariff Group
              </th>
              <th className="px-4 py-3 text-left font-semibold">Device Type</th>
              <th className="px-4 py-3 text-left font-semibold">Power (VA)</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">
                Sub-location
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Detail location
              </th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockDevices.map((d, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.type}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3">{d.tariff}</td>
                <td className="px-4 py-3">{d.phase}</td>
                <td className="px-4 py-3">{d.power}</td>
                <td className="px-4 py-3">{d.location}</td>
                <td className="px-4 py-3">{d.subLocation}</td>
                <td className="px-4 py-3">{d.detailLocation}</td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-gray-600 text-sm">
          <span>
            Show <b>1-10</b> of <b>100</b> data
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-200" disabled>
              <span className="text-gray-400">&laquo;</span>
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                className={`px-2 py-1 rounded ${
                  n === 1
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="p-1 rounded hover:bg-gray-200">
              <span className="text-gray-600">&raquo;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
