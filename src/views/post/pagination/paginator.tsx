// this is where you'd implement some pagination logic like whether a next page is available, which can then be imported to the DataTable

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePaginationLinks } from "./genarate-pages";
import { memo, useCallback } from "react";

type PaginatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
};

const Paginator = ({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext,
}: PaginatorProps) => {
  // Ghi nhớ hàm handlePreviousClick để giảm trang
  const handlePreviousClick = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  // Ghi nhớ hàm handleNextClick để tăng trang
  const handleNextClick = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);
  return (
    <Pagination>
      <PaginationContent>
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePreviousClick}
              className={`text-xs ${
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              } `}
            />
          </PaginationItem>
        ) : null}
        {usePaginationLinks(currentPage, totalPages, onPageChange, 5)}
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationNext
              onClick={handleNextClick}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
};
export default memo(Paginator);
