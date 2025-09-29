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
import { DateRange } from "@/shared/domain/entities/models";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import {
  formatDateToStringUTCWithoutMs,
  getDateRangeByTimePeriod,
} from "@/shared/utils/helpers/date-helpers";
import { TimePeriod } from "@/shared/domain/enum/enums";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
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

  const getDateRange = (): DateRange => {
    return getDateRangeByTimePeriod(TimePeriod.Yearly);
  };

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
    console.log("[debugTest] activeFilters changed: ", activeFilters);
    const selectedYear = optionalValue(
      activeFilters.singleSelection?.year
    ).orDefault(new Date().getFullYear().toString());
    const dateRangeFromYear = getStartAndEndDateFormattedUTCWithoutMsFromYear(
      parseInt(selectedYear, 10)
    );
    console.log("[debugTest] dateRangeFromYear: ", dateRangeFromYear);
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
        <button className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer">
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
        gotoPage={(page) => {
          const dateRange = getDateRange();
          goToPage({
            page,
            startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
            endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
          });
        }}
        previousPage={() => {
          const dateRange = getDateRange();
          previousPage({
            startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
            endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
          });
        }}
        nextPage={() => {
          const dateRange = getDateRange();
          nextPage({
            startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
            endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
          });
        }}
      />
    </div>
  );
}
