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
import { Logger } from "@/core/utils/logger/logger";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfMonthFromDate,
} from "@/shared/utils/helpers/date-helpers";
import { useGetHundredDevices } from "@/features/summary/presentation/hooks/use-get-hundred-devices";
import { FilterOption } from "@/shared/presentation/types/filter-ui";
import {
  csvDownloadHelper,
  downloadBulkCsv,
} from "@/core/utils/helpers/file-download-helper";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
  const {
    devices,
    error: useGetHundredDevicesError,
    reset: resetHundredDevices,
  } = useGetHundredDevices();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
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
    bulkData: exportBulkData,
    loading: useGetExportToCsvLoading,
    error: useGetExportToCsvError,
    fetchExportToCsv: fetchExportToCsv,
    fetchBulkData: fetchExportToCsvBulk,
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
    async function processDownload() {
      await downloadBulkCsv(
        exportBulkData.map((item) => ({
          fileUrl: item.fileUrl,
          fileName: item.fileName,
        }))
      );

      showPopup(
        `Successfully downloaded ${exportBulkData.length} files.`,
        PopupType.SUCCESS
      );

      setExporting(false);
      resetExportToCsv();
    }
    if (!exportBulkData || exportBulkData.length === 0) return;
    if (exportBulkData.length === 1) {
      const fileUrl = exportBulkData[0]?.fileUrl;
      const fileName = exportBulkData[0]?.fileName;
      if (!fileUrl || !fileName) {
        showPopup("No file available for download.", PopupType.INFO);
        setExporting(false);
        resetExportToCsv();
        return;
      }
      csvDownloadHelper(fileUrl, fileName)
        .then(() => {
          showPopup(
            `File ${fileName} downloaded successfully.`,
            PopupType.SUCCESS
          );
        })
        .catch((error) => {
          Logger.error("processDownload", "Failed to download file", error);
          showPopup("Failed to download the file.", PopupType.ERROR);
        })
        .finally(() => {
          setExporting(false);
          resetExportToCsv();
        });
    } else {
      processDownload();
    }
  }, [exportBulkData, showPopup, resetExportToCsv]);

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
    if (exporting) return;
    setExporting(true);
    if (selectedIds.length === 0) {
      showPopup("Please select at least one record to export.", PopupType.INFO);
      setExporting(false);
      return;
    }
    const paramsArray: GetExportToCsvQueryParams[] = selectedIds
      .map((period) => {
        const record = usageHistory.find((item) => item.period === period);
        if (!record) {
          showPopup(`Record for period ${period} not found.`, PopupType.ERROR);
          return null;
        }
        const selectedPeriod = optionalValue(new Date(record.period)).orToday();
        const dateRangeMonth =
          getStartAndEndDateOfMonthFromDate(selectedPeriod);
        return {
          startDate: formatDateToStringUTCWithoutMs(dateRangeMonth.startDate),
          endDate: formatDateToStringUTCWithoutMs(dateRangeMonth.endDate),
        };
      })
      .filter(
        (param): param is { startDate: string; endDate: string } =>
          param !== null
      );

    fetchExportToCsvBulk(paramsArray);
  }, [selectedIds, showPopup, usageHistory, exporting, fetchExportToCsvBulk]);

  const handleDownloadSingle = useCallback(
    (row: ElectricityUsageModel) => {
      if (exporting) {
        showPopup(
          "Please wait until the current export is finished.",
          PopupType.INFO
        );
        return;
      }
      setExporting(true);
      const selectedPeriod = optionalValue(new Date(row.period)).orToday();
      const dateRangeMonth = getStartAndEndDateOfMonthFromDate(selectedPeriod);
      fetchExportToCsv({
        startDate: formatDateToStringUTCWithoutMs(dateRangeMonth.startDate),
        endDate: formatDateToStringUTCWithoutMs(dateRangeMonth.endDate),
      });
    },
    [exporting, fetchExportToCsv, showPopup]
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
        {/* Export Button */}
        <button
          disabled={
            selectedIds.length === 0 || exporting || useGetExportToCsvLoading
          }
          className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDownload}
        >
          {useGetExportToCsvLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span>Download</span>
          )}
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
        data={usageHistory}
        pagination={pagination}
        isLoading={useGetElectricityUsageHistoryLoading}
        selectedIds={selectedIds}
        handleRowSelect={(id) => {
          if (exporting) return;
          setSelectedIds((prev) =>
            prev.includes(id)
              ? prev.filter((rowId) => rowId !== id)
              : [...prev, id]
          );
        }}
        handleSelectAll={() => {
          if (exporting) return;
          setSelectedIds((prev) =>
            prev.length === usageHistory.length
              ? []
              : usageHistory.map((row) => row.period)
          );
        }}
        gotoPage={(page) => {
          if (exporting) return;
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
          if (exporting) return;
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
          if (exporting) return;
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
