"use client";

import TransactionCard from "@/components/cards/transaction-card";
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
import { cn } from "@/lib/utils";
import { useGetTransactionListQueryCursor } from "@/services/apis/bookings/transactions/transactions.service";
import { Transaction } from "@/services/apis/bookings/transactions/types/transaction";
import { TransactionOwnerTypeEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { useTranslation } from "@/services/i18n/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { useInView } from "react-intersection-observer";

interface DataTableProps {
  columns: ColumnDef<Transaction>[];
  bookingId: string;
  isOpen?: boolean;
}

function TransactionDataTable({ columns, bookingId, isOpen }: DataTableProps) {
  const { t } = useTranslation("user/booking-detail");

  const { t: tBooking } = useTranslation("user/bookings");

  const { ref: bottomRef, inView: isBottomInView } = useInView();

  const filterTransactionRequest = useMemo(
    () => ({
      limit: 20,
      filters: {
        booking_id: bookingId,
        owner_types: [TransactionOwnerTypeEnum.Customer],
      },
    }),
    [bookingId]
  );

  // Transaction with pagination cursor
  const {
    transactions,
    transactionsFetchNextPage,
    transactionsHasNextPage,
    transactionsIsFetching,
    transactionsLoading,
  } = useGetTransactionListQueryCursor(filterTransactionRequest, isOpen);

  const tableConfig: TableOptions<Transaction> = useMemo(
    () => ({
      data: transactions,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    [columns, transactions]
  );
  const table = useReactTable(tableConfig);

  const handleFetchNextPage = useCallback(() => {
    transactionsFetchNextPage();
  }, [transactionsFetchNextPage]);

  const [transactionsMobile, setTransactionsMobile] = useState(
    transactions.slice(0, 10)
  );

  const handleShowMore = useCallback(() => {
    const length = transactionsMobile.length;
    if (transactions && !transactionsIsFetching && transactionsHasNextPage) {
      transactionsFetchNextPage();
    }
    setTransactionsMobile([
      ...transactionsMobile,
      ...transactions.slice(length, length + 10),
    ]);
  }, [
    transactions,
    transactionsFetchNextPage,
    transactionsHasNextPage,
    transactionsIsFetching,
    transactionsMobile,
  ]);

  useEffect(() => {
    // When has data and reach bottom and not fetching data and there is more data to fetch, fetch next page
    if (
      isBottomInView &&
      transactions &&
      !transactionsIsFetching &&
      transactionsHasNextPage
    ) {
      transactionsFetchNextPage();
    }
  }, [
    isBottomInView,
    transactions,
    transactionsFetchNextPage,
    transactionsHasNextPage,
    transactionsIsFetching,
  ]);

  useEffect(() => {
    // When has data and not fetching data and there is more data to fetch, fetch next page
    if (
      (transactionsHasNextPage ||
        transactions.length > transactionsMobile.length) &&
      !transactionsIsFetching &&
      transactionsMobile.length === 0
    ) {
      handleShowMore();
    }
  }, [
    handleShowMore,
    transactions.length,
    transactionsHasNextPage,
    transactionsIsFetching,
    transactionsMobile.length,
  ]);

  // Display skeleton on first load
  if (transactionsLoading) {
    return (
      <>
        <div className="hidden gap-2 lg:flex lg:flex-col">
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
    <div>
      <div className="hidden min-w-[600px] flex-col rounded-md border lg:flex">
        {table && (
          <Table classNameRoot="!max-h-fit">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-neutral-100">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn("border text-black")}
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
              {table.getRowModel?.()?.rows.length ? (
                table.getRowModel?.()?.rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "overflow-hidden text-ellipsis border align-top",
                          cell.column.id === "id" && "max-w-32"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Chưa có thông tin
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                ref={bottomRef}
                className={`${transactionsHasNextPage ? "table-row" : "hidden"}`}
              >
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {transactionsHasNextPage && (
                    <Button
                      disabled={transactionsIsFetching}
                      onClick={handleFetchNextPage}
                    >
                      {transactionsIsFetching && (
                        <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin text-center" />
                      )}
                      {transactionsIsFetching
                        ? tBooking("table.load-data.loading")
                        : tBooking("table.load-data.title")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 lg:hidden">
        {transactionsMobile.map((transaction) => (
          <div key={transaction.id}>
            <TransactionCard transaction={transaction} />
          </div>
        ))}
        {transactions.length === 0 &&
          !transactionsIsFetching &&
          !transactionsHasNextPage && (
            <div className="mb-4 w-full text-center text-sm font-bold text-primary">
              Chưa có thông tin
            </div>
          )}
        {(transactionsHasNextPage ||
          transactions.length > transactionsMobile.length) &&
          !transactionsIsFetching && (
            <Button onClick={handleShowMore} className="mt-4">
              {t("table.load-data.title")}
            </Button>
          )}

        {transactionsIsFetching && <p>{t("table.load-data.loading")}</p>}
      </div>
    </div>
  );
}

export default TransactionDataTable;
