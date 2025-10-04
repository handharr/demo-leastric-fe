import { useEffect, useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DateRangeModal } from "@/shared/presentation/components/date-range-modal";
import { Pagination } from "@/shared/presentation/components/pagination";
import {
  formatDateToStringUTCWithoutMs,
  getCurrentMonthDateRangeUntilToday,
} from "@/shared/utils/helpers/date-helpers";
import { DateRange } from "@/shared/domain/entities/models";
import { useGetElectricityUsageHistory } from "@/features/summary/presentation/hooks/use-get-electricity-usage-history";
import { aggregateElectricityUsageByPeriod } from "@/features/summary/utils/summary-helper";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";

export function ShowMoreElectricUsageModalButton() {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(
    getCurrentMonthDateRangeUntilToday()
  );
  const { showPopup } = usePopup();
  const {
    usageHistory: electricityUsageHistory,
    loading,
    error,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    fetchUsageHistory,
    reset,
  } = useGetElectricityUsageHistory();

  const data = aggregateElectricityUsageByPeriod(electricityUsageHistory);

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
    if (open) {
      fetchUsageHistory({
        startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
        endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
      });
    } else {
      reset();
    }
  }, [open, dateRange, fetchUsageHistory, reset]);

  return (
    <>
      <button
        className="cursor-pointer text-sm text-leastric-primary hover:text-green-700 font-semibold"
        onClick={() => setOpen(true)}
      >
        Show more
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
        title="Electricity Usage History"
        description="Overview of electricity consumption trends."
        zValue={52}
      >
        {/* Content container */}
        <div className="w-auto mb-[16px] flex flex-col gap-y-[16px]">
          {/* Date range filter placeholder */}
          <div>
            <DateRangeModal
              dateRange={dateRange}
              onApply={(range) => {
                setDateRange(range);
                fetchUsageHistory({
                  startDate: formatDateToStringUTCWithoutMs(range.startDate),
                  endDate: formatDateToStringUTCWithoutMs(range.endDate),
                });
              }}
            />
          </div>
          {/* Table content */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-default-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-typography-secondary">
                    No.
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-typography-secondary">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-typography-secondary">
                    Usage (kWh)
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-typography-secondary">
                    CO₂
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonLoading />
                ) : (
                  data.map((record, index) => (
                    <tr
                      key={record.period}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <td className="py-3 px-2 text-sm text-typography-headline">
                        {index + 1}.
                      </td>
                      <td className="py-3 px-2 text-sm text-typography-headline">
                        {record.period}
                      </td>
                      <td className="py-3 px-2 text-sm text-typography-headline text-right">
                        {formatNumberIndonesian(
                          optionalValue(record.totalKwh).orZero()
                        )}{" "}
                        kWh
                      </td>
                      <td className="py-3 px-2 text-sm text-typography-headline text-right">
                        {formatNumberIndonesian(
                          optionalValue(record.totalCO2Emission).orZero()
                        )}{" "}
                        kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            model={pagination}
            onNextPage={() =>
              nextPage({
                startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
                endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
              })
            }
            onPageChange={(page) =>
              goToPage({
                page,
                startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
                endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
              })
            }
            onPreviousPage={() =>
              previousPage({
                startDate: formatDateToStringUTCWithoutMs(dateRange.startDate),
                endDate: formatDateToStringUTCWithoutMs(dateRange.endDate),
              })
            }
          />
        </div>
      </Modal>
    </>
  );
}
