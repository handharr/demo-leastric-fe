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
  getSummaryFiltersMeta,
  summaryFilterDefaultValue,
} from "@/features/summary/presentation/components/summary-filter-modal";
import { useGetUsageSummary } from "@/features/summary/presentation/hooks/use-get-usage-summary";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
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
import { FilterOption } from "@/shared/presentation/types/filter-ui";
import { useGetLocations } from "@/features/device/presentation/hooks/locations/use-get-locations";
import { useGetGeneratePdfReport } from "@/features/summary/presentation/hooks/use-get-generate-pdf-report";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import { GetGeneratePdfReportQueryParams } from "@/features/summary/domain/params/query-params";
import {
  convertDateToUTC,
  getCurrentMonthDateRange,
} from "@/shared/utils/helpers/date-helpers";

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
  const {
    data: locations,
    error: getLocationsError,
    reset: getLocationsReset,
  } = useGetLocations();
  const {
    execute: getPdfReport,
    error: errorGeneratePdfReport,
    loading: loadingGeneratePdfReport,
    successMessage: successMessageGeneratePdfReport,
    reset: resetGeneratePdfReport,
  } = useGetGeneratePdfReport();

  const locationOptions: FilterOption[] = locations
    ? [
        { id: "all", label: "All locations" },
        ...locations.map((loc: string) => ({ id: loc, label: loc })),
      ]
    : [];

  const summaryFilterMeta = getSummaryFiltersMeta({ options: locationOptions });

  const handleFilterApply = (filters: SummaryFilterState) => {
    setActiveFilters(filters);
  };

  const handleFilterReset = (resetValue: SummaryFilterState) => {
    setActiveFilters(resetValue);
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

    if (getLocationsError) {
      showPopup(
        getLocationsError.message || "Failed to fetch device locations",
        PopupType.ERROR
      );
      getLocationsReset();
    }

    if (errorGeneratePdfReport) {
      showPopup(
        `Error generating PDF report: ${errorGeneratePdfReport.message}`,
        PopupType.ERROR
      );
      resetGeneratePdfReport?.();
    }

    if (successMessageGeneratePdfReport) {
      showPopup(successMessageGeneratePdfReport, PopupType.SUCCESS);
      resetGeneratePdfReport?.();
    }
  }, [
    errorSummary,
    errorElectricityUsage,
    electricityUsageHistoryError,
    getLocationsError,
    errorGeneratePdfReport,
    successMessageGeneratePdfReport,
    showPopup,
    resetSummary,
    resetElectricityUsage,
    resetElectricityUsageHistory,
    getLocationsReset,
    resetGeneratePdfReport,
  ]);

  useEffect(() => {
    if (compareEnabled) {
      fetchComparedElectricityUsage({
        period: selectedPeriod,
      });
    } else {
      fetchElectricityUsage({ period: selectedPeriod });
    }
  }, [
    compareEnabled,
    selectedPeriod,
    fetchComparedElectricityUsage,
    fetchElectricityUsage,
  ]);

  useEffect(() => {
    fetchElectricityUsageHistory({ page: 1 });
  }, [fetchElectricityUsageHistory]);

  return (
    <div className="flex flex-col gap-[16px]">
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
          {loadingGeneratePdfReport ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span
              onClick={() => {
                const { startDate, endDate } = getCurrentMonthDateRange();
                // Trigger PDF generation with current filter values
                const _startDate = convertDateToUTC(startDate).toISOString();
                const _endDate = convertDateToUTC(endDate).toISOString();
                const queryParams: GetGeneratePdfReportQueryParams = {
                  startDate: _startDate,
                  endDate: _endDate,
                };
                getPdfReport(queryParams);
              }}
            >
              Export PDF
            </span>
          )}
        </button>
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={(newFilters) => setActiveFilters(newFilters)}
        meta={summaryFilterMeta}
      />

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* Electricity Usage Card */}
        <SummaryCard
          title="This Month's Est. Usage"
          description="Est. total electricity usage month to date"
          value={formatNumberIndonesian(
            optionalValue(usageSummary?.singlePhase?.estUsage).orZero() +
              optionalValue(usageSummary?.threePhase?.estUsage).orZero(),
            2
          )}
          unit="kWh"
        />

        {/* Bill Card */}
        <SummaryCard
          title="This Month's Est. Bill"
          description="Est. total Bill month to date"
          value={formatRupiahNumber(
            optionalValue(usageSummary?.singlePhase?.estBill).orZero() +
              optionalValue(usageSummary?.threePhase?.estBill).orZero()
          )}
          prefix="Rp"
        />

        {/* CO2 Emission Card */}
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
        />

        {/* Device Status Card */}
        <SummaryCard
          title="Check Device Status"
          description="Quickly check the status of a devices"
          value=""
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 flex-1 justify-between">
              <span className="text-sm text-typography-headline">Active</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-background-brand-positive-subtle text-leastric-primary text-xs font-medium rounded-full">
                {optionalValue(
                  usageSummary?.singlePhase?.deviceStatus?.activeDevices
                ).orZero() +
                  optionalValue(
                    usageSummary?.threePhase?.deviceStatus?.activeDevices
                  ).orZero()}
              </span>
            </div>
            <div className="h-8 w-px bg-default-border" />
            <div className="flex items-center gap-2 flex-1 justify-between">
              <span className="text-sm text-typography-headline">Inactive</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-background-critical-subtle text-typography-negative text-xs font-medium rounded-full">
                {optionalValue(
                  usageSummary?.singlePhase?.deviceStatus?.inactiveDevices
                ).orZero() +
                  optionalValue(
                    usageSummary?.threePhase?.deviceStatus?.inactiveDevices
                  ).orZero()}
              </span>
            </div>
          </div>
        </SummaryCard>
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
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-[16px]">
        <RealTimeMonitoringChart
          className=""
          location={
            activeFilters.singleSelection.location &&
            activeFilters.singleSelection.location.toLowerCase() !== "all"
              ? activeFilters.singleSelection.location
              : undefined
          }
        />
        <ElectricUsageHistoryTable
          data={aggregateElectricityUsageByPeriod(electricityUsageHistory)}
          className=""
          loading={electricityUsageHistoryLoading}
        />
      </div>
    </div>
  );
}
