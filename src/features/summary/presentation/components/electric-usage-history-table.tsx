"use client";

import { ElectricUsageHistoryTableProps } from "@/features/summary/presentation/types/ui";
import { TilePrimary } from "@/shared/presentation/components/tile-primary";

export function ElectricUsageHistoryTable({
  data,
  showAll = false,
  onShowMore,
}: ElectricUsageHistoryTableProps) {
  const displayData = showAll ? data : data.slice(0, 7);

  return (
    <TilePrimary
      title="Electricity Usage History"
      description="This is for description"
      topRightContent={
        !showAll &&
        onShowMore && (
          <button
            onClick={onShowMore}
            className="cursor-pointer text-sm text-leastric-primary hover:text-green-700 font-semibold"
          >
            Show more
          </button>
        )
      }
    >
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
    </TilePrimary>
  );
}
