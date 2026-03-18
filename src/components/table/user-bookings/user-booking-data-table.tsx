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
import {
  filterBookingRequest,
  useGetBookingListQueryCursor,
} from "@/services/apis/bookings/bookings.service";
import { Booking } from "@/services/apis/bookings/types/booking";
import { useTranslation } from "@/services/i18n/client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useInView } from "react-intersection-observer";
import { userBookingColumns } from "./user-bookings-columns";
import UserBookingCard from "@/components/cards/user-booking-card";
import useAuth from "@/services/auth/use-auth";
import CellWrapper from "./cell/cell-wrapper";

type Props = Omit<BookingSearchParams, "page"> & {
  ids?: string;
};

const UserBookingDataTable = function UserBookingDataTable({
  limit,
  ids,
  booking_statuses,
  createdAtFrom,
  createdAtTo,
  picName,
}: Props) {
  const { t } = useTranslation("user/bookings");
  const { user } = useAuth();

  const { ref: bottomRef, inView: isBottomInView } = useInView();

  const columns = userBookingColumns;

  const filters: filterBookingRequest = useMemo(() => {
    const filters: filterBookingRequest = {};
    if (booking_statuses && booking_statuses !== -1) {
      filters.booking_statuses = [booking_statuses];
    }

    if (picName) {
      filters.orderer_name = picName;
    }

    if (ids) {
      filters.ids = [ids];
    }

    // if (createdDate) {
    //   filters.createdAt = createdDate;
    // }

    if (createdAtFrom) {
      filters.createdAtFrom = createdAtFrom;
    }

    if (createdAtTo) {
      filters.createdAtTo = createdAtTo;
    }
    return filters;
  }, [booking_statuses, picName, ids, createdAtFrom, createdAtTo]);

  const filterBookingRequest = useMemo(
    () => ({
      limit: limit || 20,
      filters: filters,
    }),
    [filters, limit]
  );

  const {
    bookings,
    bookingsFetchNextPage,
    bookingsHasNextPage,
    bookingsIsFetching,
    bookingsLoading,
  } = useGetBookingListQueryCursor(filterBookingRequest, !!user);

  const handleFetchNextPage = useCallback(() => {
    bookingsFetchNextPage();
  }, [bookingsFetchNextPage]);

  useEffect(() => {
    // When has data and reach bottom and not fetching data and there is more data to fetch, fetch next page
    if (
      isBottomInView &&
      bookings &&
      !bookingsIsFetching &&
      bookingsHasNextPage
    ) {
      bookingsFetchNextPage();
    }
  }, [
    bookings,
    bookingsFetchNextPage,
    bookingsHasNextPage,
    bookingsIsFetching,
    isBottomInView,
  ]);

  const tableConfig: TableOptions<Booking> = useMemo(
    () => ({
      data: bookings,
      columns,
      getCoreRowModel: getCoreRowModel(),
      debugTable: true,
    }),
    [columns, bookings]
  );

  const table = useReactTable(tableConfig);

  const [bookingsMobile, setBookingsMobile] = useState(bookings.slice(0, 10));

  const handleShowMore = useCallback(() => {
    const length = bookingsMobile.length;
    if (bookings && !bookingsIsFetching && bookingsHasNextPage) {
      bookingsFetchNextPage();
    }
    setBookingsMobile([
      ...bookingsMobile,
      ...bookings.slice(length, length + 10),
    ]);
  }, [
    bookings,
    bookingsFetchNextPage,
    bookingsHasNextPage,
    bookingsIsFetching,
    bookingsMobile,
  ]);

  useEffect(() => {
    // When has data and not fetching data and there is more data to fetch, fetch next page
    if (
      (bookingsHasNextPage || bookings.length > bookingsMobile.length) &&
      !bookingsIsFetching &&
      bookingsMobile.length === 0
    ) {
      handleShowMore();
    }
  }, [
    bookingsHasNextPage,
    bookingsIsFetching,
    bookingsMobile.length,
    bookings.length,
    handleShowMore,
  ]);

  // Display skeleton on first load
  if (bookingsLoading) {
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
                className={`${bookingsHasNextPage ? "table-row" : "hidden"}`}
              >
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {bookingsHasNextPage && (
                    <Button
                      disabled={bookingsIsFetching}
                      onClick={handleFetchNextPage}
                    >
                      {bookingsIsFetching && (
                        <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin text-center" />
                      )}
                      {bookingsIsFetching
                        ? t("table.load-data.loading")
                        : t("table.load-data.title")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* <div ref={bottomRef} className="flex justify-center">
        {hasNextPage && (
          <Button
            disabled={isFetching}
            // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
            onClick={() => fetchNextPage()}
          >
            {isFetching && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isFetching
              ? t("table.load-data.loading")
              : t("table.load-data.title")}
          </Button>
        )}
      </div> */}
      </div>
      <div className="flex w-full flex-col gap-2 lg:hidden">
        {bookingsMobile.map((booking) => (
          <div key={booking.id}>
            <UserBookingCard booking={booking} />
          </div>
        ))}
        {bookings.length === 0 &&
          !bookingsIsFetching &&
          !bookingsHasNextPage && (
            <div className="mb-4 w-full text-center text-sm font-bold text-primary">
              {t("table.no-result")}
            </div>
          )}
        {(bookingsHasNextPage || bookings.length > bookingsMobile.length) &&
          !bookingsIsFetching && (
            <Button onClick={handleShowMore} className="mt-4">
              {t("table.load-data.title")}
            </Button>
          )}

        {bookingsIsFetching && <p>{t("table.load-data.loading")}</p>}
      </div>
    </>
  );
};
export default memo(UserBookingDataTable);
