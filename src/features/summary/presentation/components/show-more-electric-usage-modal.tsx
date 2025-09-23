import { useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DateRangeModal } from "@/shared/presentation/components/date-range-modal";
import { format } from "date-fns";
import { PeriodValueData } from "@/features/summary/domain/entities/summary-models";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

function paginate<T>(array: T[], pageSize: number, page: number) {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

export function ShowMoreElectricUsageModalButton({
  data,
}: {
  data: PeriodValueData[];
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const pagedData = paginate(data, pageSize, page);

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
        <div className="w-auto">
          {/* Date range filter placeholder */}
          <div className="mb-4">
            <DateRangeModal
              startDate={startDate}
              endDate={endDate}
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
                {pagedData.map((record, index) => (
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
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              Show {pagedData.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {(page - 1) * pageSize + pagedData.length} of {data.length} data
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="First"
              >
                &laquo;
              </button>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Prev"
              >
                &lsaquo;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-2 py-1 rounded ${
                    page === i + 1
                      ? "bg-gray-200 font-bold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next"
              >
                &rsaquo;
              </button>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                aria-label="Last"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
