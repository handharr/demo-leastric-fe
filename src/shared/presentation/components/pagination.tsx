export interface PaginationModel {
  total: number;
  page: number;
  pageSize: number;
}

interface PaginationProps {
  model: PaginationModel;
  onPageChange: (page: number) => void;
}

export function Pagination({ model, onPageChange }: PaginationProps) {
  const { total, page, pageSize } = model;
  const totalPages = Math.ceil(total / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="w-full bg-gray-50 border-t rounded-b-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 text-gray-600 text-sm gap-2">
        <span>
          Show{" "}
          <b>
            {start}-{end}
          </b>{" "}
          of <b>{total}</b> data
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <span className={page === 1 ? "text-gray-400" : "text-gray-600"}>
              &laquo;
            </span>
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              className={`px-2 py-1 rounded ${
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
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => onPageChange(page + 1)}
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
