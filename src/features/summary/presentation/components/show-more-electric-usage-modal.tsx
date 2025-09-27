import { useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DateRangeModal } from "@/shared/presentation/components/date-range-modal";
import { PeriodValueData } from "@/features/summary/domain/entities/summary-models";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { Pagination } from "@/shared/presentation/components/pagination";
import {
  formatDateToStringUTCWithoutMs,
  getDateRangeByTimePeriod,
} from "@/shared/utils/helpers/date-helpers";
import { TimePeriod } from "@/shared/domain/enum/enums";
import { DateRange } from "@/shared/domain/entities/models";

export interface ShowMoreElectricUsageModalButtonProps {
  data: PeriodValueData[];
  pagination: PaginationModel;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageChange: (page: number) => void;
  dateRange?: DateRange;
}

export function ShowMoreElectricUsageModalButton({
  data,
  pagination,
  onNextPage,
  onPreviousPage,
  onPageChange,
  dateRange = getDateRangeByTimePeriod(TimePeriod.Daily),
}: ShowMoreElectricUsageModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);

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
        description="This is for description"
      >
        <div className="w-auto max-h-[50vh] lg:max-h-[70vh] mb-[16px]">
          {/* Date range filter placeholder */}
          <div className="mb-4">
            <DateRangeModal
              startDate={formatDateToStringUTCWithoutMs(startDate)}
              endDate={formatDateToStringUTCWithoutMs(endDate)}
              onApply={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default-border">
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
                {data.map((record, index) => (
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
                      {optionalValue(record.totalKwh).orZero().toFixed(3)} kWh
                    </td>
                    <td className="py-3 px-2 text-sm text-typography-headline">
                      {optionalValue(record.totalCO2Emission)
                        .orZero()
                        .toFixed(3)}{" "}
                      kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            model={pagination}
            onNextPage={onNextPage}
            onPageChange={onPageChange}
            onPreviousPage={onPreviousPage}
          />
        </div>
      </Modal>
    </>
  );
}
