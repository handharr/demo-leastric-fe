interface TableSkeletonLoadingProps {
  rowCount?: number;
  colCount?: number;
}

const TableSkeletonLoadingItem = () => (
  <td className="px-4 py-3">
    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
  </td>
);

export const TableSkeletonLoading = ({
  rowCount = 3,
  colCount = 6,
}: TableSkeletonLoadingProps) => (
  <>
    {Array.from({ length: rowCount }).map((_, i) => (
      <tr
        key={`skeleton-${i}`}
        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
      >
        {Array.from({ length: colCount }).map((_, j) => (
          <TableSkeletonLoadingItem key={`skeleton-item-${j}`} />
        ))}
      </tr>
    ))}
  </>
);
