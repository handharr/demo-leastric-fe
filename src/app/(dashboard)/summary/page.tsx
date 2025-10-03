"use client";

import { useEffect, useState } from "react";
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
import { useGetUsageSummary } from "@/features/summary/presentation/hooks/use-get-usage-summary";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { EnergyUnit, TimePeriod } from "@/shared/domain/enum/enums";
import { useGetElectricityUsage } from "@/features/summary/presentation/hooks/use-get-electricity-usage";
import {
  formatNumberIndonesian,
  formatRupiahNumber,
} from "@/shared/utils/helpers/number-helpers";
import {
  aggregateElectricityUsageByPeriod,
  getComparedLegendLabelForPeriod,
  getLegendLabelForPeriod,
} from "@/features/summary/utils/summary-helper";
import { useGetElectricityUsageHistory } from "@/features/summary/presentation/hooks/use-get-electricity-usage-history";

const availableTimePeriods = [
  TimePeriod.Daily,
  TimePeriod.Weekly,
  TimePeriod.Monthly,
];

const availableUnits = [
  EnergyUnit.Ampere,
  EnergyUnit.KWH,
  EnergyUnit.Volt,
  EnergyUnit.Watt,
];

export default function SummaryPage() {
  const [activeFilters, setActiveFilters] = useState<SummaryFilterState>(
    summaryFilterDefaultValue()
  );
  const [compareEnabled, setCompareEnabled] = useState(false);
  const { showPopup } = usePopup();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TimePeriod.Daily
  );
  const [selectedUnit, setSelectedUnit] = useState<EnergyUnit>(EnergyUnit.KWH);
  const {
    data: usageSummary,
    error: errorSummary,
    reset: resetSummary,
  } = useGetUsageSummary();
  const {
    data: electricityUsage,
    comparedData: electricityComparedUsage,
    loading: electricityLoading,
    error: errorElectricityUsage,
    fetchElectricityUsage,
    fetchComparedElectricityUsage,
    reset: resetElectricityUsage,
  } = useGetElectricityUsage();
  const {
    usageHistory: electricityUsageHistory,
    loading: electricityUsageHistoryLoading,
    error: electricityUsageHistoryError,
    fetchUsageHistory: fetchElectricityUsageHistory,
    reset: resetElectricityUsageHistory,
  } = useGetElectricityUsageHistory();

  const handleFilterApply = (filters: SummaryFilterState) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
  };

  const handleFilterReset = (resetValue: SummaryFilterState) => {
    setActiveFilters(resetValue);
    console.log("Filters reset");
  };

  useEffect(() => {
    if (errorSummary) {
      showPopup(
        `Error fetching summary: ${errorSummary.message}`,
        PopupType.ERROR
      );
      resetSummary();
    }

    if (errorElectricityUsage) {
      showPopup(
        `Error fetching electricity usage: ${errorElectricityUsage.message}`,
        PopupType.ERROR
      );
      resetElectricityUsage();
    }

    if (electricityUsageHistoryError) {
      showPopup(
        `Error fetching electricity usage history: ${electricityUsageHistoryError}`,
        PopupType.ERROR
      );
      resetElectricityUsageHistory();
    }
  }, [
    errorSummary,
    errorElectricityUsage,
    electricityUsageHistoryError,
    showPopup,
    resetSummary,
    resetElectricityUsage,
    resetElectricityUsageHistory,
  ]);

  useEffect(() => {
    if (compareEnabled) {
      fetchComparedElectricityUsage({
        period: selectedPeriod,
        unit: selectedUnit,
      });
    } else {
      fetchElectricityUsage({ period: selectedPeriod, unit: selectedUnit });
    }
  }, [
    compareEnabled,
    selectedPeriod,
    selectedUnit,
    fetchComparedElectricityUsage,
    fetchElectricityUsage,
  ]);

  useEffect(() => {
    fetchElectricityUsageHistory({ page: 1 });
  }, [fetchElectricityUsageHistory]);

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
      <div className="overflow-x-auto">
        <div className="flex gap-[16px] md:grid md:grid-cols-2 xl:grid-cols-4 min-w-max md:min-w-0 md:items-stretch">
          {/* Electricity Usage Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Usage"
              description="Est. total electricity usage month to date"
              value={formatNumberIndonesian(
                optionalValue(usageSummary?.singlePhase?.estUsage).orZero() +
                  optionalValue(usageSummary?.threePhase?.estUsage).orZero(),
                2
              )}
              unit="kWh"
              className="md:flex-1"
            />
          </div>

          {/* Bill Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Bill"
              description="Est. total Bill month to date"
              value={formatRupiahNumber(
                optionalValue(usageSummary?.singlePhase?.estBill).orZero() +
                  optionalValue(usageSummary?.threePhase?.estBill).orZero()
              )}
              prefix="Rp"
              className="md:flex-1"
            />
          </div>

          {/* CO2 Emission Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="Total CO₂ Emission"
              description="Est. total CO₂ Emission month to date"
              value={formatNumberIndonesian(
                optionalValue(
                  usageSummary?.singlePhase?.totalCO2Emission
                ).orZero() +
                  optionalValue(
                    usageSummary?.threePhase?.totalCO2Emission
                  ).orZero(),
                3
              )}
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
                    {optionalValue(
                      usageSummary?.singlePhase?.deviceStatus?.activeDevices
                    ).orZero()}
                  </span>
                </div>
                <div className="h-8 w-px bg-default-border" />
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="text-sm text-typography-headline">
                    Inactive
                  </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-background-critical-subtle text-typography-negative text-xs font-medium rounded-full">
                    {optionalValue(
                      usageSummary?.singlePhase?.deviceStatus?.inactiveDevices
                    ).orZero()}
                  </span>
                </div>
              </div>
            </SummaryCard>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div>
        <UsageChart
          selectedPeriod={selectedPeriod}
          selectedUnit={selectedUnit}
          periodOptions={availableTimePeriods}
          unitOptions={availableUnits}
          usageData={aggregateElectricityUsageByPeriod(
            optionalValue(electricityUsage?.usage?.data).orEmptyArray()
          )}
          usageComparedData={aggregateElectricityUsageByPeriod(
            optionalValue(electricityComparedUsage?.usage?.data).orEmptyArray()
          )}
          isLoading={electricityLoading}
          compareEnabled={compareEnabled}
          onChangePeriod={(period) => setSelectedPeriod(period)}
          onChangeUnit={(unit) => setSelectedUnit(unit)}
          onChangeCompare={() => {
            setCompareEnabled(!compareEnabled);
          }}
          legendLabel={getLegendLabelForPeriod(selectedPeriod)}
          legendComparedLabel={getComparedLegendLabelForPeriod(selectedPeriod)}
        />
      </div>

      {/* Real-Time Monitoring and Usage History */}
      <div className="grid grid-cols-1 lg:flex lg:flex-row gap-[16px]">
        <RealTimeMonitoringChart className="lg:flex-1" />
        <ElectricUsageHistoryTable
          data={aggregateElectricityUsageByPeriod(electricityUsageHistory)}
          className="lg:flex-1"
          loading={electricityUsageHistoryLoading}
        />
      </div>
    </div>
  );
}
