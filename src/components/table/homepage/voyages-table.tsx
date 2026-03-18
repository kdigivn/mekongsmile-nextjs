/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import React, { useMemo, useEffect, memo, useState, useCallback } from "react";
import { useVoyagesFindByLocationAndDateQueryCursor } from "@/services/apis/voyages/voyages.service"; // Adjust the import path as needed
import { voyagesColumns } from "./columns";
import {
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/services/i18n/client";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVoyages } from "@/app/(language)/schedules/search-helpers";
import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import { checkVoyageValid } from "@/app/(language)/schedules/search-helpers";
import { addDays } from "date-fns";
import VoyagesTableFilters from "./voyages-table-filters";
import { Route } from "@/services/apis/routes/types/route";
import { Operator } from "@/services/apis/operators/types/operator";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import CardVoyageWithModal from "@/components/cards/card-voyage-with-modal";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import { objectToArray } from "@/services/helpers/objectUtils";
import { useRouter } from "next/navigation";
import {
  LocalFormKey,
  LocalSelectedTicketFormData,
} from "@/services/form/types/form-types";
import { cn } from "@/lib/utils";
import { DisableRoute } from "@/services/infrastructure/wordpress/types/sideBar";
import LinkBase from "@/components/link-base";

type VoyagesTableProps = {
  routeId: number;
  disableRoutes?: DisableRoute[];
  operatorId?: string;
  operators: Operator[];
  routes: Route[];
  customizeSelectAction?: (voyage: VoyageItem) => void;
  minDate?: Date;
  hidden?: boolean;
};

const VoyagesTable = ({
  routeId,
  operatorId,
  routes,
  operators,
  customizeSelectAction,
  minDate,
  hidden,
  disableRoutes,
}: VoyagesTableProps) => {
  const { t } = useTranslation("home");
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    addDays(new Date(), 1)
  );
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  const [routeDetails, setRouteDetails] = useState<{
    departure_id: string;
    destination_id: string;
  } | null>(null);

  // const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const isMobile = useCheckMobile();

  const [currentNumberOfVoyages, setCurrentNumberOfVoyages] = useState(2);

  const router = useRouter();

  const [isRouteEnabled, setIsRouteEnabled] = useState(
    !routes.find((route) => route.id === routeId)?.disable || false
  );

  const toggleSorting = (id: string) => {
    setSorting((currentSorting) => {
      const existingSort = currentSorting.find((sort) => sort.id === id);
      if (existingSort) {
        // Toggle between ascending, descending, and no sort
        return existingSort.desc
          ? currentSorting.filter((sort) => sort.id !== id)
          : currentSorting.map((sort) =>
              sort.id === id ? { id: id, desc: true } : sort
            );
      }
      // Add new sort
      return [...currentSorting, { id: id, desc: false }];
    });
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { ref: bottomRef, inView: isBottomInView } = useInView();
  const columns = useMemo(
    () => voyagesColumns(toggleSorting, customizeSelectAction),
    [customizeSelectAction]
  ); // Pass the handler to the columns function

  // const presetRoutesAndOperators = useMemo(() => {
  //   if (departureSlug) {
  //     const route = routes?.find(
  //       (route) => route.departure_abbreviation === departureSlug
  //     );
  //     const routeId = route?.departure_id ?? null; // Trả về departure_id hoặc null nếu không tìm thấy
  //     const operatorIds =
  //       route?.operators
  //         ?.map((operator) => operator.operator_id)
  //         ?.filter(
  //           (operatorId): operatorId is string => operatorId !== undefined
  //         ) ?? []; // Loại bỏ undefined

  //     return {
  //       route,
  //       routeId,
  //       operatorIds,
  //     };
  //   } else if (destinationSlug) {
  //     const route = routes?.find(
  //       (route) => route.destination_abbreviation === destinationSlug
  //     );
  //     const routeId = route?.destination_id ?? null; // Trả về destination_id hoặc null nếu không tìm thấy
  //     const operatorIds =
  //       route?.operators
  //         ?.map((operator) => operator.operator_id)
  //         ?.filter(
  //           (operatorId): operatorId is string => operatorId !== undefined
  //         ) ?? []; // Loại bỏ undefined

  //     return {
  //       route,
  //       routeId,
  //       operatorIds,
  //     };
  //   }

  //   return { route: null, routeId: null, operatorIds: [] };
  // }, [departureSlug, destinationSlug, routes]);
  // end load route list

  // handle logic routeId
  const filteredRouteId = useMemo(() => {
    const res = { departure_id: "", destination_id: "" };
    let route = null;

    // if (presetRoutesAndOperators.routeId) {
    //   res.departure_id = departureSlug ? presetRoutesAndOperators.routeId : "";
    //   res.destination_id = destinationSlug
    //     ? presetRoutesAndOperators.routeId
    //     : "";

    //   route = presetRoutesAndOperators.route;
    // } else
    if (routeId) {
      route = routes?.find((r) => r.id.toString() === routeId?.toString());
      res.departure_id = route?.departure_id ?? "";
      res.destination_id = route?.destination_id ?? "";
    }

    // Lưu thông tin departure_id và destination_id vào state
    setRouteDetails(res);
    setSelectedRoute(route?.id.toString() ?? "");
    setIsRouteEnabled(!route?.disable || false);
    return res;
  }, [routeId, routes]);

  const requestVoyages = useMemo(() => {
    setCurrentNumberOfVoyages(2);
    return {
      departure_date: selectedDate
        ? formatDate(selectedDate)
        : formatDate(new Date()),
      limit: 20,
      filter: {
        operator_ids:
          selectedTab === "All"
            ? []
            : selectedTab
              ? [selectedTab.toString()]
              : operatorId
                ? [operatorId as string]
                : // : presetRoutesAndOperators.operatorIds.length > 0
                  //   ? presetRoutesAndOperators.operatorIds
                  [],
        // depart_time: selectedDateTime ? selectedDateTime.toString() : "",
      },
      departure_id: routeDetails?.departure_id
        ? routeDetails.departure_id
        : filteredRouteId.departure_id
          ? filteredRouteId.departure_id
          : // : departureSlug
            //   ? (presetRoutesAndOperators.routeId ?? "")
            "",
      destination_id: routeDetails?.destination_id
        ? routeDetails.destination_id
        : filteredRouteId.destination_id
          ? filteredRouteId.destination_id
          : // : departureSlug
            //   ? (presetRoutesAndOperators.routeId ?? "")
            "",
      sort: [],
    };
  }, [
    filteredRouteId.departure_id,
    filteredRouteId.destination_id,
    operatorId,
    routeDetails?.departure_id,
    routeDetails?.destination_id,
    selectedDate,
    selectedTab,
  ]);

  const { voyages: updateVoyages, voyagesLoading: updateVoyagesLoading } =
    useVoyagesFindByLocationAndDateQueryCursor(requestVoyages, isRouteEnabled, {
      cache: "no-store",
    });

  const {
    voyages,
    voyagesFetchNextPage,
    voyagesHasNextPage,
    voyagesIsFetching,
    voyagesLoading,
  } = useVoyagesFindByLocationAndDateQueryCursor(
    requestVoyages,
    isRouteEnabled,
    {
      cache: "no-store",
    }
  );

  useEffect(() => {
    // When has data and reach bottom and not fetching data and there is more data to fetch, fetch next page
    if (isBottomInView && voyages && !voyagesIsFetching && voyagesHasNextPage) {
      voyagesFetchNextPage();
    }
  }, [
    voyages,
    voyagesFetchNextPage,
    voyagesHasNextPage,
    isBottomInView,
    voyagesIsFetching,
  ]);

  // flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(() => {
    // If the voyages are expired or empty, and the updateVoyages is available, update the voyages
    if (voyages.length === 0 && !updateVoyagesLoading && updateVoyages) {
      return formatVoyages(
        updateVoyages.map((voyage) => {
          const oldVoyage = voyages.find(
            (oldVoyage) => oldVoyage.voyage.id === voyage.voyage.id
          );
          if (oldVoyage) {
            return {
              ...oldVoyage,
              no_remain: voyage.voyage.no_remain,
            };
          }
          return voyage;
        }) as VoyageItem[],
        {
          filterDisable: true,
          filterRemaining: true,
        }
      );
    }

    return formatVoyages(voyages as VoyageItem[], {
      filterDisable: true,
      filterRemaining: true,
    });
  }, [updateVoyages, updateVoyagesLoading, voyages]);

  const loadMoreTrigger = useCallback(() => {
    if (flatData.length > currentNumberOfVoyages) {
      const addNum = flatData.length - currentNumberOfVoyages > 2 ? 2 : 1;
      setCurrentNumberOfVoyages((prev) => prev + addNum);
    }
  }, [currentNumberOfVoyages, flatData.length]);

  const handleGoToTicketDetail = useCallback(
    (voyage: Voyage) => {
      const queryParams: TicketDetailParams = {
        departVoyageId: voyage?.id,
        numberOfPassengers: 1,
      };

      const ticketFormData: LocalSelectedTicketFormData = {
        selectedVoyages: {
          departVoyage: voyage,
        },
        numberOfPassengers: 1,
      };

      localStorage.setItem(
        LocalFormKey.selectedTicketData,
        JSON.stringify(ticketFormData)
      );

      // Create query path. Add a timestamp to trigger API fetch when click search button
      const path = `/ticket-detail?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;

      router.push(path);
    },
    [router]
  );

  const tableConfig = useMemo(
    () => ({
      data: flatData,
      columns,
      state: { sorting },
      getCoreRowModel: getCoreRowModel(),
      debugTable: true,
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
    }),
    [columns, flatData, sorting]
  );

  const table = useReactTable(tableConfig);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleRouteClick = useCallback(
    (routeId: string) => {
      const route = routes?.find((r) => r.id.toString() === routeId);

      const departure_id = route?.departure_id ?? "";

      const destination_id = route?.destination_id ?? "";

      if (route && !route.disable) {
        setIsRouteEnabled(true);
        // Lưu thông tin departure_id và destination_id vào state
        setRouteDetails({
          departure_id: departure_id,
          destination_id: destination_id,
        });
        setSelectedRoute(`${route.id}`);
      } else {
        setIsRouteEnabled(false);
        // Xử lý nếu không tìm thấy route
        setRouteDetails(null);
        setSelectedRoute(routeId ? routeId.toString() : "");
      }
    },
    [routes]
  );

  const handleTabClick = useCallback((tabId: string) => {
    setSelectedTab(tabId);
  }, []);

  const handleFetchNextPage = useCallback(() => {
    voyagesFetchNextPage();
  }, [voyagesFetchNextPage]);

  const handleClickVoyageCardOnMobile = useCallback(
    (voyage: VoyageItem) => {
      if (customizeSelectAction) {
        customizeSelectAction(voyage);
      } else handleGoToTicketDetail(voyage.voyage);
    },
    [customizeSelectAction, handleGoToTicketDetail]
  );

  const tableData = useMemo(() => {
    if (isMobile) return null;

    if (!isRouteEnabled) {
      if (selectedRoute === "")
        return (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {t("table.chooseVoyage")}
            </TableCell>
          </TableRow>
        );
      const disableRoute = disableRoutes?.find(
        (r) => r.routeId.toString() === selectedRoute
      );
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="post-detail h-24 text-center"
          >
            {disableRoute ? (
              <>
                {`Vui lòng tham khảo bài viết chi tiết: `}
                <LinkBase
                  href={disableRoute?.linkPost || ""}
                  className="text-info-500"
                >
                  {disableRoute?.text}
                </LinkBase>{" "}
              </>
            ) : (
              t("table.disabled")
            )}
          </TableCell>
        </TableRow>
      );
    }
    if (table.getRowModel().rows?.length) {
      return (
        <>
          {table.getRowModel().rows.map((row) => {
            if (checkVoyageValid(row.original.voyage)) {
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-default-20% border border-dashed text-default-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "border-default-20% border border-dashed text-xs lg:text-sm",
                        cell.id.includes("ticket_prices") && "min-w-28"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            }
            return <></>;
          })}
          <TableRow
            ref={bottomRef}
            className={`${voyagesHasNextPage ? "table-row" : "hidden"}`}
          >
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {voyagesHasNextPage && (
                <Button
                  disabled={voyagesIsFetching}
                  onClick={handleFetchNextPage}
                >
                  {voyagesIsFetching && (
                    <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin text-center" />
                  )}
                  {voyagesIsFetching
                    ? t("table.load-data.loading")
                    : t("table.load-data.title")}
                </Button>
              )}
            </TableCell>
          </TableRow>
        </>
      );
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {t("table.no-result")}
        </TableCell>
      </TableRow>
    );
  }, [
    bottomRef,
    columns.length,
    disableRoutes,
    handleFetchNextPage,
    isMobile,
    isRouteEnabled,
    selectedRoute,
    t,
    table,
    voyagesHasNextPage,
    voyagesIsFetching,
  ]);

  const renderLoadMoreMobile = () => {
    if (!isRouteEnabled) {
      const disableRoute = disableRoutes?.find(
        (r) => r.routeId.toString() === selectedRoute
      );
      return (
        <div className="post-detail flex h-[338px] flex-row items-center justify-center rounded-lg border-1 text-center">
          {disableRoute ? (
            <>
              {`Vui lòng tham khảo bài viết chi tiết: `}
              <LinkBase
                href={disableRoute?.linkPost || ""}
                className="text-info-500"
              >
                {disableRoute?.text}
              </LinkBase>{" "}
            </>
          ) : (
            t("table.disabled")
          )}
        </div>
      );
    }
    if (flatData.length > currentNumberOfVoyages) {
      return (
        <Button onClick={loadMoreTrigger} className="w-full">
          {t("table.load-data.title")}
        </Button>
      );
    }
    if (flatData.length === 0) {
      return (
        <div className="flex h-[338px] flex-row items-center justify-center rounded-lg border-1 text-center">
          {t("table.no-result")}
        </div>
      );
    }

    if (voyagesHasNextPage) {
      return (
        <Button
          disabled={voyagesIsFetching}
          onClick={handleFetchNextPage}
          className="w-full"
        >
          {voyagesIsFetching && (
            <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin text-center" />
          )}
          {voyagesIsFetching
            ? t("table.load-data.loading")
            : t("table.load-data.title")}
        </Button>
      );
    }
    return null;
  };

  // Display skeleton on first load
  if (voyagesLoading) {
    return (
      <div className="mb-3 mt-6 flex flex-col gap-2">
        {/* table header */}
        <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
        {/* table body */}
        <div className="grid w-full grid-cols-6 gap-2">
          {Array.from({ length: 60 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-3 w-full rounded-md", hidden && "hidden")}>
      {/* <h1 className="pt-2 text-center text-xl font-semibold md:text-2xl lg:text-3xl">
          {t("title1")}
        </h1> */}

      {/* <DatePicker onDateClick={handleDateClick} /> */}
      <VoyagesTableFilters
        onChangeRoute={handleRouteClick}
        onDateClick={handleDateClick}
        onChangeTab={handleTabClick}
        operatorId={operatorId}
        routeId={selectedRoute}
        routes={routes}
        operators={operators}
        minDate={minDate}
        routeDetails={routeDetails}
      />

      {/* Data Table */}
      {!isMobile ? (
        voyagesIsFetching ? (
          <div className="rounded-b-md border p-2">
            <Skeleton className="mb-4 h-10 w-full rounded-md bg-neutral-200"></Skeleton>
            <div className="grid w-full grid-cols-6 gap-2">
              {Array.from({ length: 42 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 rounded-lg bg-neutral-200"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-background">
            {/* Data Table */}
            <div className="rounded-b-md border">
              <Table className="text-sm" classNameRoot="max-h-[382px] ">
                <TableHeader>
                  {table.getHeaderGroups()?.map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-default-20% border-b border-dashed text-default-600"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="border-default-20% border border-dashed bg-default-200 text-xs font-semibold text-default-600 lg:text-sm"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>{tableData}</TableBody>
              </Table>
            </div>
          </div>
        )
      ) : voyagesIsFetching ? (
        <div className="mt-4 flex justify-center">
          <Skeleton className="w-ful flex h-80 flex-col gap-2 rounded-lg bg-neutral-200" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {isRouteEnabled &&
            flatData.length > 0 &&
            flatData
              .slice(0, currentNumberOfVoyages)
              .map((voyage) => (
                <CardVoyageWithModal
                  key={voyage.voyage.id}
                  voyageItem={voyage}
                  isLoaded
                  onCardPrimaryButtonPress={() =>
                    handleClickVoyageCardOnMobile(voyage)
                  }
                />
              ))}

          {renderLoadMoreMobile()}
        </div>
      )}
    </div>
  );
};

export default memo(VoyagesTable);
