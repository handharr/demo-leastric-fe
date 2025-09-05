import { Pagination } from "@/shared/presentation/components/pagination";

export function ReportTable() {
  const pagination = {
    page: 1,
    take: 10,
    itemCount: 50,
    pageCount: 5,
    hasPreviousPage: false,
    hasNextPage: true,
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

  return (
    <div>
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
