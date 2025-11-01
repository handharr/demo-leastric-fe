import { Pagination } from "@/shared/presentation/components/pagination";
import Image from "next/image";
import { PaginationModel } from "@/core/domain/entities/base-model";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import { EmptyData } from "@/shared/presentation/components/empty-data";

interface ReportTableProps {
  reportData: string[];
  pagination: PaginationModel;
  isLoading?: boolean;
  selectedIds: string[];
  handleRowSelect?: (id: string) => void;
  handleSelectAll?: () => void;
  gotoPage?: (page: number) => void;
  previousPage?: () => void;
  nextPage?: () => void;
  onDownloadSingle?: (id: string) => void;
}

export function ReportTable({
  reportData,
  pagination,
  isLoading = false,
  selectedIds = [],
  handleRowSelect,
  handleSelectAll,
  gotoPage,
  previousPage,
  nextPage,
  onDownloadSingle,
}: ReportTableProps) {
  const isAllSelected =
    selectedIds.length === reportData.length && reportData.length > 0;
  const isEmptyData = reportData.length === 0 && !isLoading;

  const tableContent = isLoading ? (
    <TableSkeletonLoading colCount={4} />
  ) : (
    reportData.map((row, index) => (
      <tr key={index} className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <button
            onClick={() => handleRowSelect?.(row)}
            className="flex items-center justify-center cursor-pointer w-5 h-5 focus:outline-none rounded"
          >
            <Image
              src={
                selectedIds.includes(row)
                  ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                  : "/resources/icons/checkbox/checkbox-default.svg"
              }
              alt={selectedIds.includes(row) ? "Unselect row" : "Select row"}
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {/* Month from YYYY-MM */}
          {new Date(row).toLocaleString("default", {
            month: "long",
          })}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {/* Year from YYYY-MM */}
          {new Date(row).getUTCFullYear()}
        </td>
        <td className="px-4 py-3">
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => {
              if (onDownloadSingle) {
                const rowData = reportData.find((item) => item === row);
                if (rowData) {
                  onDownloadSingle(rowData);
                }
              }
            }}
          >
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
  );

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
            {isEmptyData ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  <EmptyData />
                </td>
              </tr>
            ) : (
              tableContent
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
