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
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { useGetExportToCsv } from "@/features/summary/presentation/hooks/use-get-export-to-csv";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import {
  ElectricityUsageModel,
  ExportToCsvDownloadModel,
  GetExportToCsvModel,
} from "@/features/summary/domain/entities/summary-models";
import { Logger } from "@/shared/utils/logger/logger";
import { GetExportToCsvQueryParams } from "@/features/summary/domain/params/query-params";
import {
  formatDateToStringUTCWithoutMs,
  getStartAndEndDateOfMonthFromDate,
} from "@/shared/utils/helpers/date-helpers";

const downloadCsv = (fileUrl: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const downloadBulkCsv = async (
  models: GetExportToCsvModel[]
): Promise<ExportToCsvDownloadModel> => {
  const downloadModel: ExportToCsvDownloadModel = {
    count: 0,
  };

  for (const model of models) {
    if (model && model.fileUrl) {
      try {
        const fileName = model.fileName || `export_${Date.now()}.csv`;
        await downloadCsv(model.fileUrl, fileName);
      } catch (error) {
        Logger.error("downloadBulkCsv", "Failed to download file", error);
        continue;
      }
      downloadModel.count++;
    }
  }
  return downloadModel;
};

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
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
    data: singleCsvData,
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
  }, [
    useGetElectricityUsageHistoryError,
    showPopup,
    resetUsageHistory,
    resetExportToCsv,
    useGetExportToCsvError,
  ]);

  useEffect(() => {
    async function processDownload() {
      const result = await downloadBulkCsv(exportBulkData);
      if (result.count > 0) {
        showPopup(
          `Successfully downloaded ${result.count} file(s).`,
          PopupType.SUCCESS
        );
      } else {
        showPopup("No files were downloaded.", PopupType.INFO);
      }
      setExporting(false);
      resetExportToCsv();
    }
    if (exportBulkData.length > 0) {
      processDownload();
    }
  }, [exportBulkData, showPopup, resetExportToCsv]);

  useEffect(() => {
    async function processSingleDownload() {
      if (singleCsvData && singleCsvData.fileUrl) {
        try {
          const fileName = singleCsvData.fileName || `export_${Date.now()}.csv`;
          await downloadCsv(singleCsvData.fileUrl, fileName);
          showPopup(
            `File ${fileName} downloaded successfully.`,
            PopupType.SUCCESS
          );
        } catch (error) {
          Logger.error(
            "processSingleDownload",
            "Failed to download file",
            error
          );
          showPopup("Failed to download the file.", PopupType.ERROR);
        }
      } else {
        showPopup("No file available for download.", PopupType.INFO);
      }
      setExporting(false);
      resetExportToCsv();
    }
    if (singleCsvData) {
      processSingleDownload();
    }
  }, [singleCsvData, showPopup, resetExportToCsv]);

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
          filterMeta={reportFilterMeta}
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
