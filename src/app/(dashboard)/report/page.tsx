"use client";

import { ReportTable } from "@/features/summary/presentation/components/report-table";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import {
  reportFilterDefaultValue,
  reportFilterMeta,
  ReportFilterState,
} from "@/features/setting/presentation/components/report-filter-modal";
import { useCallback, useEffect, useState } from "react";
import { useGetElectricityUsageHistory } from "@/features/summary/presentation/hooks/use-get-electricity-usage-history";
import { getStartAndEndDateFormattedUTCWithoutMsFromYear } from "@/features/summary/utils/summary-helper";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { TimePeriod } from "@/shared/domain/enum/enums";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { useGetExportToCsv } from "@/features/summary/presentation/hooks/use-get-export-to-csv";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfMonthFromDate,
} from "@/shared/utils/helpers/date-helpers";
import { useGetHundredDevices } from "@/features/summary/presentation/hooks/use-get-hundred-devices";
import { FilterOption } from "@/shared/presentation/types/filter-ui";
import { Dropdown } from "@/shared/presentation/components/dropdown";

type ExportFormat = "csv" | "pdf";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const {
    devices,
    error: useGetHundredDevicesError,
    reset: resetHundredDevices,
  } = useGetHundredDevices();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    usageHistory,
    loading: useGetElectricityUsageHistoryLoading,
    error: useGetElectricityUsageHistoryError,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    fetchUsageHistory,
    reset: resetUsageHistory,
  } = useGetElectricityUsageHistory();
  const { showPopup } = usePopup();
  const {
    loading: useGetExportToCsvLoading,
    error: useGetExportToCsvError,
    fetchExportToCsv: fetchExportToCsv,
    reset: resetExportToCsv,
  } = useGetExportToCsv();

  useEffect(() => {
    if (useGetElectricityUsageHistoryError) {
      showPopup(
        useGetElectricityUsageHistoryError ||
          "Failed to fetch electricity usage history",
        PopupType.ERROR
      );
      resetUsageHistory();
    }

    if (useGetExportToCsvError) {
      showPopup(
        optionalValue(useGetExportToCsvError?.message).orDefault(
          "Failed to export data to CSV"
        ),
        PopupType.ERROR
      );
      resetExportToCsv();
    }

    if (useGetHundredDevicesError) {
      showPopup(
        optionalValue(useGetHundredDevicesError?.message).orDefault(
          "Failed to fetch devices"
        ),
        PopupType.ERROR
      );
      resetHundredDevices();
    }
  }, [
    useGetElectricityUsageHistoryError,
    useGetHundredDevicesError,
    showPopup,
    resetUsageHistory,
    resetExportToCsv,
    useGetExportToCsvError,
    resetHundredDevices,
  ]);

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
      size: 10,
    });
  }, [fetchUsageHistory, activeFilters]);

  const handleDownload = useCallback(() => {
    if (useGetExportToCsvLoading) return;
    if (selectedIds.length === 0) {
      showPopup("Please select at least one record to export.", PopupType.INFO);
      return;
    }
    // get the earliest and latest item from selectedIds
    const selectedIdOnDates = selectedIds.map((id) =>
      optionalValue(new Date(id)).orToday()
    );
    selectedIdOnDates.sort((a, b) => a.getTime() - b.getTime());
    const earliestDate = selectedIdOnDates[0];
    const latestDate = selectedIdOnDates[selectedIdOnDates.length - 1];

    const startDate = getStartAndEndDateOfMonthFromDate(earliestDate).startDate;
    const endDate = getStartAndEndDateOfMonthFromDate(latestDate).endDate;

    // Additional safety check: Ensure that startDate is not after endDate
    if (startDate > endDate) {
      showPopup(
        "Calculated start date is after end date. Please check your selection.",
        PopupType.ERROR
      );
      return;
    }

    if (exportFormat === "csv") {
      const params: GetExportToCsvQueryParams = {
        startDate: formatDateToStringUTCWithoutMs(startDate),
        endDate: formatDateToStringUTCWithoutMs(endDate),
      };

      fetchExportToCsv(params);
    } else {
      // TODO: Implement PDF export hook/function
      // fetchExportToPdf(params);
      showPopup("PDF export is not implemented yet.", PopupType.INFO);
    }
  }, [
    selectedIds,
    showPopup,
    useGetExportToCsvLoading,
    fetchExportToCsv,
    exportFormat,
  ]);

  const handleDownloadSingle = useCallback(
    (row: ElectricityUsageModel) => {
      if (useGetExportToCsvLoading) {
        showPopup(
          "Please wait until the current export is finished.",
          PopupType.INFO
        );
        return;
      }
      const selectedPeriod = optionalValue(new Date(row.period)).orToday();
      const dateRangeMonth = getStartAndEndDateOfMonthFromDate(selectedPeriod);
      fetchExportToCsv({
        startDate: dateRangeMonth.startDate.toISOString(),
        endDate: dateRangeMonth.endDate.toISOString(),
      });
    },
    [useGetExportToCsvLoading, fetchExportToCsv, showPopup]
  );

  const devicesOptions: FilterOption[] = devices
    ? [
        { id: "all", label: "All devices" },
        ...devices.map((device) => ({
          id: device.id.toString(),
          label: device.deviceName,
        })),
      ]
    : [];

  const updatedReportFilterMeta = {
    ...reportFilterMeta,
    devices: {
      ...reportFilterMeta.devices,
      options: devicesOptions,
    },
  };

  return (
    <div className="flex space-y-[16px] flex-col">
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
          filterMeta={updatedReportFilterMeta}
          defaultValue={reportFilterDefaultValue()}
        />

        {/* Export Section */}
        <div className="flex items-center gap-3">
          {/* Export Format Dropdown */}
          <Dropdown
            options={["CSV", "PDF"]}
            value={exportFormat.toUpperCase()}
            onChange={(option) => {
              setExportFormat(option.toLowerCase() as ExportFormat);
            }}
            disabled={useGetExportToCsvLoading}
            buttonClassName="px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Export Button */}
          <button
            disabled={selectedIds.length === 0 || useGetExportToCsvLoading}
            className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleDownload}
          >
            {useGetExportToCsvLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>
                Download {exportFormat.toUpperCase()}{" "}
                {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}{" "}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={(newFilters) => setActiveFilters(newFilters)}
        meta={reportFilterMeta}
      />

      {/* Report Table */}
      <ReportTable
        data={usageHistory}
        pagination={pagination}
        isLoading={useGetElectricityUsageHistoryLoading}
        selectedIds={selectedIds}
        handleRowSelect={(id) => {
          if (useGetExportToCsvLoading) return;
          setSelectedIds((prev) =>
            prev.includes(id)
              ? prev.filter((rowId) => rowId !== id)
              : [...prev, id]
          );
        }}
        handleSelectAll={() => {
          if (useGetExportToCsvLoading) return;
          setSelectedIds((prev) =>
            prev.length === usageHistory.length
              ? []
              : usageHistory.map((row) => row.period)
          );
        }}
        gotoPage={(page) => {
          if (useGetExportToCsvLoading) return;
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
            size: 10,
          });
        }}
        previousPage={() => {
          if (useGetExportToCsvLoading) return;
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
            size: 10,
          });
        }}
        nextPage={() => {
          if (useGetExportToCsvLoading) return;
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
            size: 10,
          });
        }}
        onDownloadSingle={handleDownloadSingle}
      />
    </div>
  );
}
