"use client";

import { ElectricUsageHistoryTableProps } from "@/features/summary/presentation/types/ui";

export function ElectricUsageHistoryTable({
  data,
  showAll = false,
  onShowMore,
}: ElectricUsageHistoryTableProps) {
  const displayData = showAll ? data : data.slice(0, 7);

  return (
    <div className="bg-white rounded-xl border border-default-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-typography-headline mb-1">
            Electricity Usage History
          </h3>
          <p className="text-sm text-typography-secondary">
            This is for description
          </p>
        </div>
        {!showAll && onShowMore && (
          <button
            onClick={onShowMore}
            className="text-sm text-leastric-primary hover:text-green-700 font-medium"
          >
            Show more
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
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
            {displayData.map((record) => (
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
                <td className="py-3 px-2 text-sm text-typography-headline">
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
    </div>
  );
}
