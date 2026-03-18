"use client";

import Paginator from "./pagination/paginator";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback } from "react";

type Props = {
  pagination?: boolean;
  pageNumber: string;
  totalPage: number;
};

function BlogPaginator({ pageNumber, totalPage, pagination }: Props) {
  const router = useRouter(); // Sử dụng router để điều hướng
  const pathName = usePathname(); // ex: /posts/page/2 or /posts
  const pathSegments = pathName.split("/").filter((segment) => segment !== "");
  const parentSlug =
    pathSegments.length > 2 && pathSegments[pathSegments.length - 2] === "page"
      ? pathSegments.slice(0, pathSegments.length - 2).join("/")
      : pathSegments.join("/"); // Lấy slug của trang cha ex: posts

  const handlePageChange = useCallback(
    (newPageNumber: number) => {
      if (newPageNumber === 1) {
        router.push(`/${parentSlug}`); // Điều hướng về trang đầu tiên
        return;
      }
      router.push(`/${parentSlug}/page/${newPageNumber}`); // Điều hướng đến trang tương ứng
    },
    [parentSlug, router] // Chỉ tạo lại hàm khi router thay đổi
  );
  return (
    <>
      {pagination && totalPage > 1 && (
        <div className="mb-10 mt-4 flex h-12 justify-center rounded-lg bg-white">
          <Paginator
            currentPage={Number(pageNumber)}
            totalPages={totalPage}
            onPageChange={handlePageChange}
            showPreviousNext
          />
        </div>
      )}
    </>
  );
}

export default memo(BlogPaginator);
