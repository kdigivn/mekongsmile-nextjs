"use client";

import {
  TableOptions,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { BookingSearchParams } from "@/app/(language)/user/bookings/booking-search-param-type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/services/i18n/client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useInView } from "react-intersection-observer";
import useAuth from "@/services/auth/use-auth";
import {
  CancelTicketRequest,
  FilterCancelTicketRequestItem,
} from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import { useGetCancelTicketRequestListQueryCursor } from "@/services/apis/cancel-ticket-request/cancel-ticket-request.service";
import CellWrapper from "./cell/cell-wrapper";
import CancelTicketRequestCard from "@/components/cards/cancel-ticket-request-card";
import { useGetUserCancelTicketRequestColumns } from "./user-cancel-ticket-request-columns";

type Props = Omit<BookingSearchParams, "page"> & {
  ids?: string;
};

const UserCancelTicketRequest = function UserCancelTicketRequest({
  limit,
}: Props) {
  const { t } = useTranslation("user/cancel-ticket-request");
  const { user } = useAuth();

  const { ref: bottomRef, inView: isBottomInView } = useInView();

  const columns = useGetUserCancelTicketRequestColumns();

  const filters: FilterCancelTicketRequestItem = useMemo(() => {
    const filters: FilterCancelTicketRequestItem = {};

    return filters;
  }, []);

  const filterCancelTicketRequest = useMemo(
    () => ({
      limit: limit || 20,
      filters: filters,
    }),
    [filters, limit]
  );

  const {
    cancelTicketRequestsData,
    cancelTicketRequestsFetchNextPage,
    cancelTicketRequestsHasNextPage,
    cancelTicketRequestsIsFetching,
    cancelTicketRequestsLoading,
  } = useGetCancelTicketRequestListQueryCursor(
    filterCancelTicketRequest,
    !!user
  );

  const handleFetchNextPage = useCallback(() => {
    cancelTicketRequestsFetchNextPage();
  }, [cancelTicketRequestsFetchNextPage]);

  useEffect(() => {
    // When has data and reach bottom and not fetching data and there is more data to fetch, fetch next page
    if (
      isBottomInView &&
      cancelTicketRequestsData &&
      !cancelTicketRequestsIsFetching &&
      cancelTicketRequestsHasNextPage
    ) {
      cancelTicketRequestsFetchNextPage();
    }
  }, [
    cancelTicketRequestsData,
    cancelTicketRequestsFetchNextPage,
    cancelTicketRequestsHasNextPage,
    cancelTicketRequestsIsFetching,
    isBottomInView,
  ]);

  const tableConfig: TableOptions<CancelTicketRequest> = useMemo(
    () => ({
      data: cancelTicketRequestsData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      debugTable: true,
    }),
    [columns, cancelTicketRequestsData]
  );

  const table = useReactTable(tableConfig);

  const [cancelTicketRequestMobile, setCancelTicketRequestMobile] = useState(
    cancelTicketRequestsData.slice(0, 10)
  );

  const handleShowMore = useCallback(() => {
    const length = cancelTicketRequestMobile.length;
    if (
      cancelTicketRequestsData &&
      !cancelTicketRequestsIsFetching &&
      cancelTicketRequestsHasNextPage
    ) {
      cancelTicketRequestsFetchNextPage();
    }
    setCancelTicketRequestMobile([
      ...cancelTicketRequestMobile,
      ...cancelTicketRequestsData.slice(length, length + 10),
    ]);
  }, [
    cancelTicketRequestMobile,
    cancelTicketRequestsData,
    cancelTicketRequestsFetchNextPage,
    cancelTicketRequestsHasNextPage,
    cancelTicketRequestsIsFetching,
  ]);

  useEffect(() => {
    // When has data and not fetching data and there is more data to fetch, fetch next page
    if (
      (cancelTicketRequestsHasNextPage ||
        cancelTicketRequestsData.length > cancelTicketRequestMobile.length) &&
      !cancelTicketRequestsIsFetching &&
      cancelTicketRequestMobile.length === 0
    ) {
      handleShowMore();
    }
  }, [
    handleShowMore,
    cancelTicketRequestsHasNextPage,
    cancelTicketRequestsData.length,
    cancelTicketRequestMobile.length,
    cancelTicketRequestsIsFetching,
  ]);

  // Display skeleton on first load
  if (cancelTicketRequestsLoading) {
    return (
      <>
        <div className="hidden gap-2 p-2 lg:flex lg:flex-col">
          {/* table header */}
          <Skeleton className="h-10 w-full rounded-md bg-neutral-200"></Skeleton>
          {/* table body */}
          <div className="grid w-full grid-cols-6 gap-2">
            {Array.from({ length: 42 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 rounded-lg bg-neutral-200"
              ></Skeleton>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 lg:hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-36 w-full rounded-lg bg-neutral-200"
            ></Skeleton>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden w-full flex-col gap-2 p-2 lg:flex">
        <div className="rounded-b-md border">
          <Table>
            <TableHeader className="sticky top-0 z-30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-default-20% border-b border-dashed text-default-600"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="border-default-20% border border-dashed bg-default-200 text-xs font-semibold text-default-600 lg:text-sm"
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-default-20% border border-dashed text-default-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <CellWrapper
                          key={cell.id}
                          cell={cell}
                          className="border-default-20% border border-dashed text-xs lg:text-sm"
                        />
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("table.no-result")}
                  </TableCell>
                </TableRow>
              )}

              <TableRow
                ref={bottomRef}
                className={`${cancelTicketRequestsHasNextPage ? "table-row" : "hidden"}`}
              >
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {cancelTicketRequestsHasNextPage && (
                    <Button
                      disabled={cancelTicketRequestsIsFetching}
                      onClick={handleFetchNextPage}
                    >
                      {cancelTicketRequestsIsFetching && (
                        <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin text-center" />
                      )}
                      {cancelTicketRequestsIsFetching
                        ? t("table.load-data.loading")
                        : t("table.load-data.title")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 lg:hidden">
        {cancelTicketRequestMobile &&
          cancelTicketRequestMobile.map((data) => (
            <div key={data?.id}>
              <CancelTicketRequestCard data={data} />
            </div>
          ))}
        {cancelTicketRequestsData.length === 0 &&
          !cancelTicketRequestsIsFetching &&
          !cancelTicketRequestsHasNextPage && (
            <div className="mb-4 w-full text-center text-sm font-bold text-primary">
              {t("table.no-result")}
            </div>
          )}
        {(cancelTicketRequestsHasNextPage ||
          cancelTicketRequestsData.length > cancelTicketRequestMobile.length) &&
          !cancelTicketRequestsIsFetching && (
            <Button onClick={handleShowMore} className="mt-4">
              {t("table.load-data.title")}
            </Button>
          )}

        {cancelTicketRequestsIsFetching && (
          <p>{t("table.load-data.loading")}</p>
        )}
      </div>
    </>
  );
};
export default memo(UserCancelTicketRequest);
