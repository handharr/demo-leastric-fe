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
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { useGetExportToCsv } from "@/features/summary/presentation/hooks/use-get-export-to-csv";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import {
  GetExportToCsvQueryParams,
  GetGeneratePdfReportQueryParams,
} from "@/features/summary/domain/params/query-params";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfMonthFromDate,
} from "@/shared/utils/helpers/date-helpers";
import { useGetHundredDevices } from "@/features/summary/presentation/hooks/use-get-hundred-devices";
import { FilterOption } from "@/shared/presentation/types/filter-ui";
import { Dropdown } from "@/shared/presentation/components/dropdown";
import { useGetGeneratePdfReport } from "@/features/summary/presentation/hooks/use-get-generate-pdf-report";
import { arrayStringToDelimitedString } from "@/core/utils/helpers/string-helper";
import { useGetAvailablePdfReports } from "@/features/summary/presentation/hooks/use-get-available-pdf-reports";

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
    data: reportData,
    loading: useGetReportDataLoading,
    error: useGetReportDataError,
    fetch: fetchReportData,
    reset: resetReportData,
    nextPage,
    previousPage,
    goToPage,
  } = useGetAvailablePdfReports({
    location: undefined,
    deviceId: arrayStringToDelimitedString({
      array: optionalValue(
        activeFilters.multiSelection?.devices
      ).orEmptyArray(),
      delimiter: ",",
      excludeValues: reportFilterMeta.devices.defaultValue as string[],
    }),
    year: parseInt(
      optionalValue(activeFilters.singleSelection?.year).orDefault(
        new Date().getUTCFullYear().toString()
      ),
      10
    ),
  });

  const { showPopup } = usePopup();
  const {
    loading: useGetExportToCsvLoading,
    error: useGetExportToCsvError,
    successMessage: useGetExportToCsvSuccessMessage,
    fetchExportToCsv: fetchExportToCsv,
    reset: resetExportToCsv,
  } = useGetExportToCsv();
  const {
    execute: getPdfReport,
    error: errorGeneratePdfReport,
    loading: loadingGeneratePdfReport,
    successMessage: successMessageGeneratePdfReport,
    reset: resetGeneratePdfReport,
  } = useGetGeneratePdfReport();

  useEffect(() => {
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

    if (useGetExportToCsvSuccessMessage) {
      showPopup(useGetExportToCsvSuccessMessage, PopupType.SUCCESS);
      resetExportToCsv();
    }

    if (errorGeneratePdfReport) {
      showPopup(
        optionalValue(errorGeneratePdfReport?.message).orDefault(
          "Failed to generate PDF report"
        ),
        PopupType.ERROR
      );
      resetGeneratePdfReport?.();
    }

    if (successMessageGeneratePdfReport) {
      showPopup(successMessageGeneratePdfReport, PopupType.SUCCESS);
      resetGeneratePdfReport?.();
    }

    if (useGetReportDataError) {
      showPopup(
        optionalValue(useGetReportDataError?.message).orDefault(
          "Failed to fetch report data"
        ),
        PopupType.ERROR
      );
      resetReportData();
    }
  }, [
    useGetHundredDevicesError,
    useGetExportToCsvSuccessMessage,
    useGetExportToCsvError,
    errorGeneratePdfReport,
    successMessageGeneratePdfReport,
    useGetReportDataError,
    showPopup,
    resetExportToCsv,
    resetHundredDevices,
    resetGeneratePdfReport,
    resetReportData,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData, activeFilters]);

  const handleDownload = useCallback(() => {
    if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
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
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      fetchExportToCsv(params);
    } else {
      const params: GetGeneratePdfReportQueryParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      getPdfReport(params);
    }
  }, [
    selectedIds,
    exportFormat,
    useGetExportToCsvLoading,
    loadingGeneratePdfReport,
    showPopup,
    fetchExportToCsv,
    getPdfReport,
  ]);

  const handleDownloadSingle = useCallback(
    (row: string) => {
      if (useGetExportToCsvLoading || loadingGeneratePdfReport) {
        showPopup(
          "Please wait until the current export is finished.",
          PopupType.INFO
        );
        return;
      }
      const selectedPeriod = optionalValue(new Date(row)).orToday();
      const dateRangeMonth = getStartAndEndDateOfMonthFromDate(selectedPeriod);

      if (exportFormat === "pdf") {
        const params: GetGeneratePdfReportQueryParams = {
          startDate: formatDateToStringUTCWithoutMs(dateRangeMonth.startDate),
          endDate: formatDateToStringUTCWithoutMs(dateRangeMonth.endDate),
        };
        getPdfReport(params);
        return;
      }

      const params: GetExportToCsvQueryParams = {
        startDate: formatDateToStringUTCWithoutMs(dateRangeMonth.startDate),
        endDate: formatDateToStringUTCWithoutMs(dateRangeMonth.endDate),
      };
      fetchExportToCsv(params);
    },
    [
      useGetExportToCsvLoading,
      loadingGeneratePdfReport,
      exportFormat,
      getPdfReport,
      fetchExportToCsv,
      showPopup,
    ]
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Export Format Dropdown */}
          <Dropdown
            options={["CSV", "PDF"]}
            value={exportFormat.toUpperCase()}
            onChange={(option) => {
              setExportFormat(option.toLowerCase() as ExportFormat);
            }}
            disabled={useGetExportToCsvLoading || loadingGeneratePdfReport}
            buttonClassName="px-3 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
          />

          {/* Export Button */}
          <button
            disabled={
              selectedIds.length === 0 ||
              useGetExportToCsvLoading ||
              loadingGeneratePdfReport
            }
            className="flex items-center gap-2 px-3 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            onClick={handleDownload}
          >
            {useGetExportToCsvLoading || loadingGeneratePdfReport ? (
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
        reportData={optionalValue(
          reportData?.availablePeriods.monthly.periods
        ).orEmptyArray()}
        pagination={optionalValue(reportData?.pagination).orDefault({
          page: 1,
          itemCount: 0,
          pageCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
          size: 10,
        })}
        isLoading={loadingGeneratePdfReport || useGetReportDataLoading}
        selectedIds={selectedIds}
        handleRowSelect={(id) => {
          if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
          setSelectedIds((prev) =>
            prev.includes(id)
              ? prev.filter((rowId) => rowId !== id)
              : [...prev, id]
          );
        }}
        handleSelectAll={() => {
          if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
          setSelectedIds((prev) =>
            prev.length ===
            optionalValue(
              reportData?.availablePeriods.monthly.periods.length
            ).orZero()
              ? []
              : optionalValue(reportData?.availablePeriods.monthly.periods)
                  .orEmptyArray()
                  .map((row) => row)
          );
        }}
        gotoPage={(page) => {
          if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
          goToPage(page);
        }}
        previousPage={() => {
          if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
          previousPage();
        }}
        nextPage={() => {
          if (useGetExportToCsvLoading || loadingGeneratePdfReport) return;
          nextPage();
        }}
        onDownloadSingle={handleDownloadSingle}
      />
    </div>
  );
}
