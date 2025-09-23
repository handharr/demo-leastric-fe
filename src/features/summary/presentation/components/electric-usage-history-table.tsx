"use client";
import "react-day-picker/dist/style.css";

import { TilePrimary } from "@/shared/presentation/components/tile-primary";
import { ShowMoreElectricUsageModalButton } from "@/features/summary/presentation/components/show-more-electric-usage-modal";
import { PeriodValueData } from "@/features/summary/domain/entities/summary-models";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";

interface ElectricUsageHistoryTableProps {
  data: PeriodValueData[];
  showAll?: boolean;
  className?: string;
  loading?: boolean;
}

export function ElectricUsageHistoryTable({
  data,
  showAll = false,
  className,
  loading = false,
}: ElectricUsageHistoryTableProps) {
  const displayData = showAll ? data : data.slice(0, 7);

  return (
    <TilePrimary
      title="Electricity Usage History"
      description="Overview of electricity consumption trends."
      topRightContent={<ShowMoreElectricUsageModalButton data={data} />}
      className={className || ""}
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
            {loading ? (
              <TableSkeletonLoading />
            ) : (
              displayData.map((record, index) => (
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
                      optionalValue(record.totalKwh).orZero(),
                      3
                    )}{" "}
                    kWh
                  </td>
                  <td className="py-3 px-2 text-sm text-typography-headline">
                    {formatNumberIndonesian(
                      optionalValue(record.totalCO2Emission).orZero(),
                      3
                    )}{" "}
                    kg
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </TilePrimary>
  );
}
