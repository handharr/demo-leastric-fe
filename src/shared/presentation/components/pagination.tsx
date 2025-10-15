import { PaginationModel } from "@/core/domain/entities/base-model";
interface PaginationProps {
  model: PaginationModel;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function Pagination({
  model,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: PaginationProps) {
  const { itemCount, page, size } = model;
  const totalPages = Math.ceil(itemCount / size);
  // const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, itemCount);
  const maxPageControls = 5;
  let startPage = Math.max(1, page - Math.floor(maxPageControls / 2));
  let endPage = startPage + maxPageControls - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageControls + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="w-full bg-gray-50 border-t rounded-b-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 text-gray-600 text-sm gap-2">
        {/* Pagination info */}
        <span className="shrink-0">
          Show{" "}
          <b>
            {start}-{end}
          </b>{" "}
          of <b>{itemCount}</b> data
        </span>
        {/* Page controls */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            className="cursor-pointer p-1 rounded hover:bg-gray-200"
            onClick={() => onPreviousPage()}
            disabled={page === 1}
          >
            <span className={page === 1 ? "text-gray-400" : "text-gray-600"}>
              &laquo;
            </span>
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              className={`cursor-pointer px-2 py-1 rounded ${
                n === page
                  ? "bg-green-100 border border-brand-secondary text-brand-primary"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="cursor-pointer p-1 rounded hover:bg-gray-200"
            onClick={() => onNextPage()}
            disabled={page === totalPages}
          >
            <span
              className={
                page === totalPages ? "text-gray-400" : "text-gray-600"
              }
            >
              &raquo;
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
