import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import React, { useCallback, useMemo } from "react";

export const usePaginationLinks = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
  maxVisiblePages: number = 5
) => {
  // Tạo hàm handleClick với useCallback để sử dụng trong onClick
  const handleClick = useCallback(
    (page: number) => () => {
      onPageChange(page);
    },
    [onPageChange]
  );

  // Tính toán mảng pages với useMemo
  const pages = useMemo(() => {
    const pageElements: React.JSX.Element[] = [];

    // Nếu tổng số trang nhỏ hơn hoặc bằng maxVisiblePages, hiển thị tất cả các trang
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageElements.push(
          <PaginationItem key={i} className="cursor-pointer">
            <PaginationLink
              onClick={handleClick(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - 2); // Bắt đầu từ trang cách currentPage 2 trang
      let endPage = Math.min(totalPages, currentPage + 2); // Kết thúc ở trang cách currentPage 2 trang

      // Điều chỉnh nếu không đủ trang sau currentPage
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (currentPage < 3) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        } else if (currentPage > totalPages - 2) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }

      // Hiển thị trang đầu tiên và ellipsis nếu cần
      if (startPage > 1) {
        pageElements.push(
          <PaginationItem key={1} className="cursor-pointer">
            <PaginationLink
              onClick={handleClick(1)}
              isActive={1 === currentPage}
            >
              1
            </PaginationLink>
          </PaginationItem>
        );
        if (startPage > 2) {
          pageElements.push(<PaginationEllipsis key="start-ellipsis" />);
        }
      }

      // Hiển thị các trang từ startPage đến endPage
      for (let i = startPage; i <= endPage; i++) {
        pageElements.push(
          <PaginationItem key={i} className="cursor-pointer">
            <PaginationLink
              onClick={handleClick(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Hiển thị ellipsis và trang cuối cùng nếu cần
      if (endPage < totalPages - 1) {
        pageElements.push(<PaginationEllipsis key="end-ellipsis" />);
        pageElements.push(
          <PaginationItem key={totalPages} className="cursor-pointer">
            <PaginationLink
              onClick={handleClick(totalPages)}
              isActive={totalPages === currentPage}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Thêm điều kiện hiển thị trang cuối cùng nếu currentPage ở gần cuối
      if (currentPage === totalPages - 3) {
        pageElements.push(
          <PaginationItem key={totalPages} className="cursor-pointer">
            <PaginationLink
              onClick={handleClick(totalPages)}
              isActive={totalPages === currentPage}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pageElements;
  }, [currentPage, totalPages, maxVisiblePages, handleClick]);

  return pages;
};
