import { useState } from "react";
import { ElectricUsageRecord } from "@/features/summary/presentation/types/ui";
import { Modal } from "@/shared/presentation/components/modal";
import { DateRangeModal } from "@/shared/presentation/components/date-range-modal";

function paginate<T>(array: T[], pageSize: number, page: number) {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

export function ShowMoreElectricUsageModalButton({
  data,
}: {
  data: ElectricUsageRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  const [startDate, setStartDate] = useState("1-7-2025");
  const [endDate, setEndDate] = useState("30-7-2025");

  const pagedData = paginate(data, pageSize, page);

  return (
    <>
      <button
        className="cursor-pointer text-sm text-leastric-primary hover:text-green-700 font-semibold"
        onClick={() => setOpen(true)}
      >
        Show more
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Electricity Usage History
          </h2>
          <p className="text-sm text-gray-500 mb-4">This is for description</p>
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
                {pagedData.map((record) => (
                  <tr
                    key={record.no}
                    className="border-b border-gray-50 last:border-b-0"
                  >
                    <td className="py-3 px-2 text-sm text-typography-headline">
                      {record.no}.
                    </td>
                    <td className="py-3 px-2 text-sm text-typography-headline">
                      {record.date}
                    </td>
                    <td className="py-3 px-2 text-sm text-typography-headline text-right">
                      {record.usage}
                    </td>
                    <td className="py-3 px-2 text-sm text-typography-headline">
                      {record.co2.toFixed(3)} kg
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
