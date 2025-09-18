import { Pagination } from "@/shared/presentation/components/pagination";
import { useState } from "react";
import Image from "next/image";

const tableData = [
  { id: 0, month: "January", year: "2025", deviceName: "Device 1" },
  { id: 1, month: "February", year: "2025", deviceName: "Device 1" },
  { id: 2, month: "March", year: "2025", deviceName: "Device 1" },
  { id: 3, month: "April", year: "2025", deviceName: "Device 1" },
  { id: 4, month: "May", year: "2025", deviceName: "Device 1" },
  { id: 5, month: "June", year: "2025", deviceName: "Device 1" },
  { id: 6, month: "July", year: "2025", deviceName: "Device 1" },
  { id: 7, month: "August", year: "2025", deviceName: "Device 1" },
  { id: 8, month: "September", year: "2025", deviceName: "Device 1" },
  { id: 9, month: "October", year: "2025", deviceName: "Device 1" },
  { id: 10, month: "November", year: "2025", deviceName: "Device 1" },
  { id: 11, month: "December", year: "2025", deviceName: "Device 1" },
];

export function ReportTable() {
  const [selectedIds, setSelectedIds] = useState<number[]>([2, 3, 4]); // March, April, May selected by default

  const pagination = {
    page: 1,
    take: 10,
    itemCount: 50,
    pageCount: 5,
    hasPreviousPage: false,
    hasNextPage: true,
    size: 10,
  };

  const handleRowSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === tableData.length ? [] : tableData.map((row) => row.id)
    );
  };

  const goToPage = (page: number) => {
    console.log("Go to page:", page);
  };

  const previousPage = () => {
    console.log("Go to previous page");
  };

  const nextPage = () => {
    console.log("Go to next page");
  };

  const isAllSelected = selectedIds.length === tableData.length;

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
              <th className="px-4 py-3">Device Name</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRowSelect(row.id)}
                    className="flex items-center justify-center cursor-pointer w-5 h-5 focus:outline-none rounded"
                  >
                    <Image
                      src={
                        selectedIds.includes(row.id)
                          ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                          : "/resources/icons/checkbox/checkbox-default.svg"
                      }
                      alt={
                        selectedIds.includes(row.id)
                          ? "Unselect row"
                          : "Select row"
                      }
                      width={20}
                      height={20}
                      className="w-[20px] h-[20px]"
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.month}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.year}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.deviceName}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        model={pagination}
        onPageChange={(page) => goToPage(page)}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
      />
    </div>
  );
}
