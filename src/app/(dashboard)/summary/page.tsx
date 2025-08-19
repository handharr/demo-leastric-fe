"use client";

import { useState } from "react";
import { SummaryCard } from "@/features/summary/presentation/components/summary-card";
import { UsageChart } from "@/features/summary/presentation/components/usage-chart";
import { RealTimeMonitoringChart } from "@/features/summary/presentation/components/real-time-monitoring-chart";
import { ElectricUsageHistoryTable } from "@/features/summary/presentation/components/electric-usage-history-table";
import { FilterModal } from "@/shared/presentation/components/filter/filter-modal";
import { ChartDataPoint } from "@/features/summary/presentation/types/ui";
import Image from "next/image";
import { FilterState } from "@/shared/presentation/types/filter-ui";
import clsx from "clsx";

function isDefaultFilters(filters: FilterState) {
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
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });

  const hasActiveFilters = !isDefaultFilters(activeFilters);

  // Sample data points for the chart
  const chartData: ChartDataPoint[] = [
    { day: 1, usage: 100 },
    { day: 2, usage: 75 },
    { day: 3, usage: 50 },
    { day: 4, usage: 25 },
    { day: 5, usage: 85 },
    { day: 6, usage: 90 },
    { day: 7, usage: 70 },
    { day: 8, usage: 50 },
    { day: 9, usage: 20 },
    { day: 10, usage: 80 },
    { day: 11, usage: 115 },
    { day: 12, usage: 110 },
    { day: 13, usage: 60 },
    { day: 14, usage: 15 },
    { day: 15, usage: 20 },
    { day: 16, usage: 95 },
    { day: 17, usage: 110 },
    { day: 18, usage: 108 },
    { day: 19, usage: 105 },
    { day: 20, usage: 95 },
    { day: 21, usage: 90 },
    { day: 22, usage: 100 },
    { day: 23, usage: 85 },
    { day: 24, usage: 50 },
    { day: 25, usage: 80 },
    { day: 26, usage: 70 },
    { day: 27, usage: 65 },
    { day: 28, usage: 75 },
    { day: 29, usage: 80 },
    { day: 30, usage: 50 },
  ];

  // Sample real-time monitoring data
  const realTimeData = [
    { time: "-9s", usage: 110 },
    { time: "-8s", usage: 95 },
    { time: "-7s", usage: 70 },
    { time: "-6s", usage: 65 },
    { time: "-5s", usage: 75 },
    { time: "-4s", usage: 95 },
    { time: "-3s", usage: 85 },
    { time: "-2s", usage: 90 },
    { time: "-1s", usage: 105 },
    { time: "0s", usage: 95 },
  ];

  // Sample electricity usage history data
  const electricUsageHistory = [
    { no: 1, date: "1-7-2025", usage: 750, co2: 24.523 },
    { no: 2, date: "2-7-2025", usage: 120, co2: 24.523 },
    { no: 3, date: "3-7-2025", usage: 500, co2: 24.523 },
    { no: 4, date: "4-7-2025", usage: 250, co2: 24.523 },
    { no: 5, date: "5-7-2025", usage: 195, co2: 24.523 },
    { no: 6, date: "6-7-2025", usage: 250, co2: 24.523 },
    { no: 7, date: "7-7-2025", usage: 195, co2: 24.523 },
    { no: 8, date: "8-7-2025", usage: 250, co2: 24.523 },
    { no: 9, date: "9-7-2025", usage: 195, co2: 24.523 },
    { no: 10, date: "10-7-2025", usage: 250, co2: 24.523 },
  ];

  const handleFilterApply = (filters: FilterState) => {
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
            <div className="flex items-center border border-default-border rounded-full px-4 py-1 bg-white text-typography-headline text-sm">
              Location
              <span className="ml-2">{activeFilters.location}</span>
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    location: "all",
                  }))
                }
                aria-label="Remove location filter"
                type="button"
              >
                ×
              </button>
            </div>
          )}
          {/* SubLocation Chip */}
          {activeFilters.subLocation !== "all" && (
            <div className="flex items-center border border-default-border rounded-full px-4 py-1 bg-white text-typography-headline text-sm">
              Sub location
              <span className="ml-2">{activeFilters.subLocation}</span>
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    subLocation: "all",
                  }))
                }
                aria-label="Remove sub location filter"
                type="button"
              >
                ×
              </button>
            </div>
          )}
          {/* Detail Location Chip */}
          {activeFilters.detailLocations.length > 0 && (
            <div className="flex items-center border border-default-border rounded-full px-4 py-1 bg-white text-typography-headline text-sm">
              Detail location
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
                {activeFilters.detailLocations.length}
              </span>
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    detailLocations: [],
                  }))
                }
                aria-label="Remove detail location filter"
                type="button"
              >
                ×
              </button>
            </div>
          )}
          {/* Unit Chip */}
          {activeFilters.units.length > 0 &&
            !(
              activeFilters.units.length === 1 &&
              activeFilters.units[0] === "watt"
            ) && (
              <div className="flex items-center border border-default-border rounded-full px-4 py-1 bg-white text-typography-headline text-sm">
                Unit
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
                  {activeFilters.units.length}
                </span>
                <button
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      units: ["watt"],
                    }))
                  }
                  aria-label="Remove unit filter"
                  type="button"
                >
                  ×
                </button>
              </div>
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
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </div>
  );
}
