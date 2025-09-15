"use client";

import { useState } from "react";
import { SummaryCard } from "@/features/summary/presentation/components/summary-card";
import { UsageChart } from "@/features/summary/presentation/components/usage-chart";
import { RealTimeMonitoringChart } from "@/features/summary/presentation/components/real-time-monitoring-chart";
import { ElectricUsageHistoryTable } from "@/features/summary/presentation/components/electric-usage-history-table";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import {
  SummaryFilterState,
  summaryFilterDefaultValue,
  summaryFilterMeta,
} from "@/features/summary/presentation/components/summary-filter-modal";
import {
  anotherChartDataDummies,
  chartDataDummies,
  electricUsageHistoryDummies,
  realTimeDataDummies,
} from "@/features/summary/presentation/data/dummies";

export default function SummaryPage() {
  const [activeFilters, setActiveFilters] = useState<SummaryFilterState>(
    summaryFilterDefaultValue()
  );

  // Sample data points for the chart
  const chartData = chartDataDummies;
  const comparedChartData = anotherChartDataDummies;

  // Sample real-time monitoring data
  const realTimeData = realTimeDataDummies;

  // Sample electricity usage history data
  const electricUsageHistory = electricUsageHistoryDummies;

  const handleFilterApply = (filters: SummaryFilterState) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
  };

  const handleFilterReset = (resetValue: SummaryFilterState) => {
    setActiveFilters(resetValue);
    console.log("Filters reset");
  };

  return (
    <div className="flex min-h-screen flex-col gap-[16px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-typography-headline">Summary</h1>
      </div>

      {/* Filter and Export Section */}
      <div className="flex items-center justify-between">
        {/* Filter Modal */}
        <GenericFilterModal<SummaryFilterState>
          currentState={activeFilters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          filterMeta={summaryFilterMeta}
          defaultValue={summaryFilterDefaultValue()}
          buttonLabel="Filter"
          clearFiltersLabel="Clear Filters"
        />
        <button className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer">
          Export
        </button>
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={(newFilters) => setActiveFilters(newFilters)}
        meta={summaryFilterMeta}
      />

      {/* Summary Cards Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-[16px] md:grid md:grid-cols-2 xl:grid-cols-4 min-w-max md:min-w-0 md:items-stretch">
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
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="text-sm text-typography-headline">
                    Active
                  </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-background-brand-positive-subtle text-leastric-primary text-xs font-medium rounded-full">
                    1
                  </span>
                </div>
                <div className="h-8 w-px bg-default-border" />
                <div className="flex items-center gap-2 flex-1 justify-between">
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
      <div>
        <UsageChart data={chartData} comparedData={comparedChartData} />
      </div>

      {/* Real-Time Monitoring and Usage History */}
      <div className="grid grid-cols-1 lg:flex lg:flex-row gap-[16px]">
        <RealTimeMonitoringChart
          data={realTimeData}
          currentUsage={172.45}
          className="lg:flex-1"
        />
        <ElectricUsageHistoryTable
          data={electricUsageHistory}
          className="lg:flex-1"
        />
      </div>
    </div>
  );
}
