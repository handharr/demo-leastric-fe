"use client";
import "react-day-picker/dist/style.css";

import { TilePrimary } from "@/shared/presentation/components/tile-primary";
import { ShowMoreElectricUsageModalButton } from "@/features/summary/presentation/components/show-more-electric-usage-modal";
import { PeriodValueData } from "@/features/summary/domain/entities/summary-models";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { EmptyData } from "@/shared/presentation/components/empty-data";
import { DateRange } from "@/shared/domain/entities/models";

interface ElectricUsageHistoryTableProps {
  data: PeriodValueData[];
  className?: string;
  loading?: boolean;
  pagination: PaginationModel;
  dateRange: DateRange;
  onModalNextPage: () => void;
  onModalPreviousPage: () => void;
  onModalPageChange: (page: number) => void;
  onChangeDateRange?: (dateRange: DateRange) => void;
}

export function ElectricUsageHistoryTable({
  data,
  className,
  loading = false,
  pagination,
  dateRange,
  onModalNextPage,
  onModalPreviousPage,
  onModalPageChange,
  onChangeDateRange,
}: ElectricUsageHistoryTableProps) {
  const TableContent = ({ isLoading }: { isLoading: boolean }) => {
    return (
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
          {isLoading ? (
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
    );
  };

  const MainContent = () => {
    if (!loading && data.length === 0) {
      return <EmptyData />;
    }

    return <TableContent isLoading={loading} />;
  };

  return (
    <TilePrimary
      title="Electricity Usage History"
      description="Overview of electricity consumption trends."
      topRightContent={
        <ShowMoreElectricUsageModalButton
          data={data}
          pagination={pagination}
          dateRange={dateRange}
          onNextPage={onModalNextPage}
          onPreviousPage={onModalPreviousPage}
          onPageChange={onModalPageChange}
          onChangeDateRange={onChangeDateRange}
        />
      }
      className={className || ""}
    >
      <div className="overflow-x-auto">
        <MainContent />
      </div>
    </TilePrimary>
  );
}
