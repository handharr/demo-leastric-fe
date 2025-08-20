"use client";

import { useState } from "react";
import { SummaryCard } from "@/features/summary/presentation/components/summary-card";
import { UsageChart } from "@/features/summary/presentation/components/usage-chart";
import { RealTimeMonitoringChart } from "@/features/summary/presentation/components/real-time-monitoring-chart";
import { ElectricUsageHistoryTable } from "@/features/summary/presentation/components/electric-usage-history-table";
import {
  SummaryFilterModal,
  SummaryFilterState,
} from "@/features/summary/presentation/components/summary-filter-modal";
import Image from "next/image";
import { FilterChip } from "@/shared/presentation/components/filter/filter-chip";
import clsx from "clsx";
import {
  chartDataDummies,
  electricUsageHistoryDummies,
  realTimeDataDummies,
} from "@/features/summary/presentation/data/dummies";

function isDefaultFilters(filters: SummaryFilterState) {
  return (
    filters.location === "all" &&
    filters.subLocation === "all" &&
    filters.detailLocations.length === 0 &&
    filters.units.length === 1 &&
    filters.units[0] === "watt"
  );
}

export default function SummaryPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SummaryFilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });

  const hasActiveFilters = !isDefaultFilters(activeFilters);

  // Sample data points for the chart
  const chartData = chartDataDummies;

  // Sample real-time monitoring data
  const realTimeData = realTimeDataDummies;

  // Sample electricity usage history data
  const electricUsageHistory = electricUsageHistoryDummies;

  const handleFilterApply = (filters: SummaryFilterState) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
    // Apply filters to your data here
  };

  const handleFilterReset = () => {
    setActiveFilters({
      location: "all",
      subLocation: "all",
      detailLocations: [],
      units: ["watt"],
    });
    console.log("Filters reset");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-typography-headline">Summary</h1>
      </div>

      {/* Filter and Export Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold cursor-pointer transition-colors",
              hasActiveFilters
                ? "bg-leastric-primary/10 border-leastric-primary text-leastric-primary"
                : "border-default-border text-typography-headline hover:bg-gray-50"
            )}
          >
            <Image
              src="resources/icons/system/filter.svg"
              alt="Filter"
              width={20}
              height={20}
            />
            Filter
          </button>
          {hasActiveFilters && (
            <button
              className="text-leastric-primary font-semibold text-sm hover:underline"
              onClick={handleFilterReset}
              type="button"
            >
              Clear Filters
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer">
          Export
        </button>
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

      {/* Summary Cards Grid */}
      <div className="overflow-x-auto pb-4 mb-8">
        <div className="flex gap-6 md:grid md:grid-cols-2 xl:grid-cols-4 min-w-max md:min-w-0 md:items-stretch">
          {/* Electricity Usage Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Usage"
              description="Est. total electricity usage month to date"
              value="172,45"
              unit="kWh"
              className="md:flex-1"
            />
          </div>

          {/* Bill Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Bill"
              description="Est. total Bill month to date"
              value="292.993"
              prefix="Rp"
              className="md:flex-1"
            />
          </div>

          {/* CO2 Emission Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="Total CO₂ Emission"
              description="Est. total CO₂ Emission month to date"
              value="24.523"
              unit="kg CO₂e/kWh"
              className="md:flex-1"
            />
          </div>

          {/* Device Status Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="Check Device Status"
              description="Quickly check the status of a devices"
              value=""
              className="md:flex-1"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-typography-headline">
                    Active
                  </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-background-brand-positive-subtle text-leastric-primary text-xs font-medium rounded-full">
                    1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-typography-headline">
                    Inactive
                  </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-background-critical-subtle text-typography-negative text-xs font-medium rounded-full">
                    1
                  </span>
                </div>
              </div>
            </SummaryCard>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="mb-8">
        <UsageChart data={chartData} />
      </div>

      {/* Real-Time Monitoring and Usage History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Monitoring Chart */}
        <RealTimeMonitoringChart
          data={realTimeData}
          currentUsage={172.45}
          refreshInterval={10}
        />

        {/* Electric Usage History Table */}
        <ElectricUsageHistoryTable
          data={electricUsageHistory}
          onShowMore={() => console.log("Show more clicked")}
        />
      </div>

      {/* Filter Modal */}
      <SummaryFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </div>
  );
}
