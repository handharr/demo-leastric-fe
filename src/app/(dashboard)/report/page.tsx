"use client";

import { ReportTable } from "@/features/summary/presentation/components/report-table";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import {
  reportFilterDefaultValue,
  reportFilterMeta,
  ReportFilterState,
} from "@/features/setting/presentation/components/report-filter-modal";
import { useEffect, useState } from "react";
import { useGetElectricityUsageHistory } from "@/features/summary/presentation/hooks/use-get-electricity-usage-history";
import {
  aggregateElectricityUsageByPeriod,
  getStartAndEndDateFormattedUTCWithoutMsFromYear,
} from "@/features/summary/utils/summary-helper";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { TimePeriod } from "@/shared/domain/enum/enums";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    usageHistory,
    loading,
    error,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    fetchUsageHistory,
    reset,
  } = useGetElectricityUsageHistory();
  const { showPopup } = usePopup();

  useEffect(() => {
    if (error) {
      showPopup(
        error || "Failed to fetch electricity usage history",
        PopupType.ERROR
      );
      reset();
    }
  }, [error, showPopup, reset]);

  useEffect(() => {
    const selectedYear = optionalValue(
      activeFilters.singleSelection?.year
    ).orDefault(new Date().getFullYear().toString());
    const dateRangeFromYear = getStartAndEndDateFormattedUTCWithoutMsFromYear(
      parseInt(selectedYear, 10)
    );
    fetchUsageHistory({
      page: 1,
      startDate: dateRangeFromYear.startDate,
      endDate: dateRangeFromYear.endDate,
      period: TimePeriod.Monthly,
    });
  }, [fetchUsageHistory, activeFilters]);

  return (
    <div className="flex min-h-screen space-y-[16px] flex-col">
      {/* Header */}
      <div className="space-y-[4px]">
        <h1 className="text-2xl font-bold text-typography-headline">Report</h1>
        <span className="text-sm text-typography-subhead">
          By default the data shown is year-to-date
        </span>
      </div>

      {/* Filter and Export Section */}
      <div className="flex items-center justify-between">
        {/* Filter Modal */}
        <GenericFilterModal<ReportFilterState>
          currentState={activeFilters}
          onApply={(newFilters) => setActiveFilters(newFilters)}
          onReset={() => setActiveFilters(reportFilterDefaultValue())}
          filterMeta={reportFilterMeta}
          defaultValue={reportFilterDefaultValue()}
        />
        {/* Export Button */}
        <button
          disabled={selectedIds.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download
        </button>
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={(newFilters) => setActiveFilters(newFilters)}
        meta={reportFilterMeta}
      />

      {/* Report Table */}
      <ReportTable
        data={aggregateElectricityUsageByPeriod(usageHistory)}
        pagination={pagination}
        isLoading={loading}
        selectedIds={selectedIds}
        handleRowSelect={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id)
              ? prev.filter((rowId) => rowId !== id)
              : [...prev, id]
          );
        }}
        handleSelectAll={() => {
          setSelectedIds((prev) =>
            prev.length === usageHistory.length
              ? []
              : usageHistory.map((row) => row.period)
          );
        }}
        gotoPage={(page) => {
          const selectedYear = optionalValue(
            activeFilters.singleSelection?.year
          ).orDefault(new Date().getFullYear().toString());
          const dateRangeFromYear =
            getStartAndEndDateFormattedUTCWithoutMsFromYear(
              parseInt(selectedYear, 10)
            );
          goToPage({
            page,
            startDate: dateRangeFromYear.startDate,
            endDate: dateRangeFromYear.endDate,
            period: TimePeriod.Monthly,
          });
        }}
        previousPage={() => {
          const selectedYear = optionalValue(
            activeFilters.singleSelection?.year
          ).orDefault(new Date().getFullYear().toString());
          const dateRangeFromYear =
            getStartAndEndDateFormattedUTCWithoutMsFromYear(
              parseInt(selectedYear, 10)
            );
          previousPage({
            startDate: dateRangeFromYear.startDate,
            endDate: dateRangeFromYear.endDate,
            period: TimePeriod.Monthly,
          });
        }}
        nextPage={() => {
          const selectedYear = optionalValue(
            activeFilters.singleSelection?.year
          ).orDefault(new Date().getFullYear().toString());
          const dateRangeFromYear =
            getStartAndEndDateFormattedUTCWithoutMsFromYear(
              parseInt(selectedYear, 10)
            );
          nextPage({
            startDate: dateRangeFromYear.startDate,
            endDate: dateRangeFromYear.endDate,
            period: TimePeriod.Monthly,
          });
        }}
      />
    </div>
  );
}
