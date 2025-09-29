import { Pagination } from "@/shared/presentation/components/pagination";
import { useState } from "react";
import Image from "next/image";
import { PeriodValueModel } from "@/features/summary/domain/entities/summary-models";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";

interface ReportTableProps {
  data: PeriodValueModel[];
  pagination: PaginationModel;
  isLoading?: boolean;
  gotoPage?: (page: number) => void;
  previousPage?: () => void;
  nextPage?: () => void;
}

export function ReportTable({
  data,
  pagination,
  isLoading = false,
  gotoPage,
  previousPage,
  nextPage,
}: ReportTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["2", "3", "4"]); // March, April, May selected by default

  const handleRowSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === data.length ? [] : data.map((row) => row.period)
    );
  };

  const isAllSelected = selectedIds.length === data.length;

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full">
          <thead className="bg-brand-subtle-2 border-b border-gray-200">
            <tr className="text-left text-sm font-medium text-typography-headline">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center cursor-pointer w-5 h-5 focus:outline-none rounded"
                >
                  <Image
                    src={
                      isAllSelected
                        ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                        : "/resources/icons/checkbox/checkbox-default.svg"
                    }
                    alt={isAllSelected ? "Unselect all" : "Select all"}
                    width={20}
                    height={20}
                    className="w-[20px] h-[20px]"
                  />
                </button>
              </th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeletonLoading colCount={4} />
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRowSelect(row.period)}
                      className="flex items-center justify-center cursor-pointer w-5 h-5 focus:outline-none rounded"
                    >
                      <Image
                        src={
                          selectedIds.includes(row.period)
                            ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                            : "/resources/icons/checkbox/checkbox-default.svg"
                        }
                        alt={
                          selectedIds.includes(row.period)
                            ? "Unselect row"
                            : "Select row"
                        }
                        width={20}
                        height={20}
                        className="w-[20px] h-[20px]"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {/* Month from YYYY-MM-DD */}
                    {new Date(row.period).toLocaleString("default", {
                      month: "long",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {/* Year from YYYY-MM-DD */}
                    {new Date(row.period).getFullYear()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Image
                        src="/resources/icons/arrow/download.svg"
                        alt="Edit"
                        width={16}
                        height={16}
                        className="w-[16px] h-[16px]"
                      />
                    </button>
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
        onPageChange={(page) => gotoPage?.(page)}
        onPreviousPage={() => previousPage?.()}
        onNextPage={() => nextPage?.()}
      />
    </div>
  );
}
