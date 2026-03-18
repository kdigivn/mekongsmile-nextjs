import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IoIosCheckmark, IoIosSearch } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { Route } from "@/services/apis/routes/types/route";
import { MdOutlineRestartAlt } from "react-icons/md";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  subDays,
  isSameDay,
} from "date-fns";
import { MdArrowBackIos } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Operator } from "@/services/apis/operators/types/operator";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { useCountVoyageReactQuery } from "@/services/apis/voyages/voyages.service";
import { VoyagesCount } from "@/services/apis/voyages/types/voyage";

type DateItem = {
  date: string;
  day: string;
  weekday: string;
  isCurrent: boolean;
  isDisable: boolean;
};

type Props = {
  operatorId?: string;
  routeId?: string;
  routes?: Route[];
  onChangeRoute: (route: string) => void;
  onChangeTab: (tabId: string) => void;
  onDateClick: (date: Date) => void;
  operators: Operator[];
  minDate?: Date;
  routeDetails?: {
    departure_id: string;
    destination_id: string;
  } | null;
};

function VoyagesTableFilters({
  operatorId,
  routeId,
  routes,
  onChangeTab,
  onChangeRoute,
  onDateClick,
  operators,
  minDate,
  routeDetails,
}: Props) {
  const { t } = useTranslation("home");

  // Cache để lưu trữ voyageCounts
  const voyageCache = useRef<Map<string, VoyagesCount[]>>(new Map());

  // DatePicker
  const [activeDate, setActiveDate] = useState(addDays(new Date(), 1));

  // Calculate the date range for the API query
  const dateRange = useMemo(() => {
    const startDate = subDays(activeDate, 4);
    const endDate = addDays(activeDate, 68);
    return {
      depart_date_from: format(startDate, "yyyy-MM-dd"),
      depart_date_to: format(endDate, "yyyy-MM-dd"),
    };
  }, [activeDate]);

  // Tạo cache key dựa trên các tham số
  const cacheKey = useMemo(() => {
    return `${routeDetails?.departure_id || ""}_${
      routeDetails?.destination_id || ""
    }_${dateRange.depart_date_from}_${dateRange.depart_date_to}`;
  }, [
    routeDetails?.departure_id,
    routeDetails?.destination_id,
    dateRange.depart_date_from,
    dateRange.depart_date_to,
  ]);

  // Kiểm tra cache trước khi fetch
  const cachedVoyageCounts = voyageCache.current.get(cacheKey);

  // Fetch voyage counts using the API
  // Fetch voyage counts using the API nếu không có trong cache
  const { count: voyageCounts } = useCountVoyageReactQuery(
    useMemo(
      () => ({
        departure_id: routeDetails?.departure_id,
        destination_id: routeDetails?.destination_id,
        depart_date_from: format(
          new Date(dateRange.depart_date_from),
          "yyyy-MM-dd'T'HH:mm:ss'Z'"
        ),
        depart_date_to: format(
          new Date(dateRange.depart_date_to),
          "yyyy-MM-dd'T'HH:mm:ss'Z'"
        ),
      }),
      [
        dateRange.depart_date_from,
        dateRange.depart_date_to,
        routeDetails?.departure_id,
        routeDetails?.destination_id,
      ]
    ),
    !!(routeDetails?.departure_id && routeDetails?.destination_id) &&
      !cachedVoyageCounts // Chỉ fetch nếu không có cache
  );

  // Lưu dữ liệu vào cache khi fetch mới
  useEffect(() => {
    if (voyageCounts && !cachedVoyageCounts) {
      voyageCache.current.set(cacheKey, voyageCounts);
    }
  }, [voyageCounts, cacheKey, cachedVoyageCounts]);

  // Sử dụng dữ liệu từ cache hoặc API
  const finalVoyageCounts =
    cachedVoyageCounts && cachedVoyageCounts.length > 0
      ? cachedVoyageCounts
      : voyageCounts;

  // Process voyage counts to determine disabled dates
  const disabledDates = useMemo(() => {
    const dateMap: { [key: string]: number } = {};

    // Initialize all dates in the range with 0 available voyages
    const startDate = subDays(activeDate, 8);
    const endDate = addDays(activeDate, 68);
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dateMap[format(currentDate, "yyyy-MM-dd")] = 0;
      currentDate = addDays(currentDate, 1);
    }

    // Sum total_available_voyage by departure_date
    finalVoyageCounts?.forEach((voyage: VoyagesCount) => {
      if (voyage.departure_date) {
        const dateKey = voyage.departure_date.split("T")[0]; // Extract yyyy-MM-dd
        dateMap[dateKey] =
          (dateMap[dateKey] || 0) + voyage.total_available_voyage;
      }
    });

    // Return dates with 0 available voyages
    return Object.keys(dateMap).filter((date) => dateMap[date] === 0);
  }, [finalVoyageCounts, activeDate]);

  /**
   * Generates a list of dates for the date picker
   */
  const dateListData: DateItem[] = useMemo(() => {
    const dates: DateItem[] = [];
    const today = new Date();

    // Add previous 3 days
    for (let i = 1; i <= 3; i += 1) {
      const prevDate = subDays(activeDate, i);
      const dateStr = format(prevDate, "yyyy-MM-dd");
      dates.unshift({
        date: dateStr,
        day: format(prevDate, "dd"),
        weekday: format(prevDate, "EEEE"),
        isCurrent: false,
        isDisable:
          !isAfter(prevDate, subDays(today, 1)) ||
          disabledDates.includes(dateStr),
      });
    }

    const activeDateStr = format(activeDate, "yyyy-MM-dd");
    dates.push({
      date: activeDateStr,
      day: format(activeDate, "dd"),
      weekday: format(activeDate, "EEEE"),
      isCurrent: true,
      isDisable:
        !isAfter(activeDate, subDays(today, 1)) ||
        disabledDates.includes(activeDateStr),
    });

    // Add next 68 days
    for (let i = 1; i <= 68; i += 1) {
      const dateAfter = addDays(activeDate, i);
      const dateStr = format(dateAfter, "yyyy-MM-dd");
      dates.push({
        date: dateStr,
        day: format(dateAfter, "dd"),
        weekday: format(dateAfter, "EEEE"),
        isCurrent: false,
        isDisable:
          !isAfter(dateAfter, subDays(today, 1)) ||
          disabledDates.includes(dateStr),
      });
    }

    return dates;
  }, [activeDate, disabledDates]);

  // Handle initial active date and disabled dates
  // const [initialized, setInitialized] = useState(false);

  // Replace the existing useEffect and initialized state
  useEffect(() => {
    const today = new Date();
    const activeDateStr = format(activeDate, "yyyy-MM-dd");
    const activeDateItem = dateListData.find(
      (date) => date.date === activeDateStr
    );

    // If the current active date is valid (not disabled and after today), no need to change
    if (
      activeDateItem &&
      !activeDateItem.isDisable &&
      isAfter(activeDate, subDays(today, 1))
    ) {
      return;
    }

    // Find the next non-disabled date after the current active date
    const nextValidDate = dateListData.find(
      (date) =>
        !date.isDisable &&
        isAfter(new Date(date.date), subDays(today, 1)) &&
        isAfter(new Date(date.date), activeDate)
    );

    if (nextValidDate) {
      const newActiveDate = new Date(nextValidDate.date);
      setActiveDate(newActiveDate);
      onDateClick(newActiveDate);
    } else {
      // Fallback: If no valid future date is found, set to the first enabled date after today
      const firstValidDate = dateListData.find(
        (date) =>
          !date.isDisable && isAfter(new Date(date.date), subDays(today, 1))
      );
      if (firstValidDate) {
        const newActiveDate = new Date(firstValidDate.date);
        setActiveDate(newActiveDate);
        onDateClick(newActiveDate);
      }
    }
  }, [dateListData, disabledDates, activeDate, onDateClick]);

  // Handle date selection
  const handleDateClick = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const selectedDate = dateListData.find((d) => d.date === dateStr);

      // Only update if the selected date is not disabled
      if (selectedDate && !selectedDate.isDisable) {
        setActiveDate(date);
        onDateClick(date);
      }
    },
    [dateListData, onDateClick]
  );

  // Handle arrow navigation with disabled date skipping
  const arrowBackHandle = useCallback(() => {
    const newDate = subDays(activeDate, 1);
    const newDateStr = format(newDate, "yyyy-MM-dd");
    const newDateItem = dateListData.find((date) => date.date === newDateStr);

    if (newDateItem && !newDateItem.isDisable) {
      setActiveDate(newDate);
      onDateClick(newDate);
    } else {
      // Find the closest enabled date before the new date
      const prevValidDate = [...dateListData]
        .reverse()
        .find(
          (date) =>
            !date.isDisable &&
            isBefore(new Date(date.date), activeDate) &&
            isAfter(new Date(date.date), subDays(new Date(), 1))
        );

      if (prevValidDate) {
        const validDate = new Date(prevValidDate.date);
        setActiveDate(validDate);
        onDateClick(validDate);
      }
    }
  }, [activeDate, dateListData, onDateClick]);

  const arrowForwardHandle = useCallback(() => {
    const newDate = addDays(activeDate, 1);
    const newDateStr = format(newDate, "yyyy-MM-dd");
    const newDateItem = dateListData.find((date) => date.date === newDateStr);

    if (newDateItem && !newDateItem.isDisable) {
      setActiveDate(newDate);
      onDateClick(newDate);
    } else {
      // Find the closest enabled date after the new date
      const nextValidDate = dateListData.find(
        (date) =>
          !date.isDisable &&
          isAfter(new Date(date.date), newDate) &&
          isAfter(new Date(date.date), subDays(new Date(), 1))
      );

      if (nextValidDate) {
        const validDate = new Date(nextValidDate.date);
        setActiveDate(validDate);
        onDateClick(validDate);
      }
    }
  }, [activeDate, dateListData, onDateClick]);

  // Rest of the existing code remains unchanged
  const sortedRoutes = routes?.sort((a, b) =>
    a.departure_name.localeCompare(b.departure_name)
  );

  const [activeTab, setActiveTab] = useState("");
  const [checkTabChange, setCheckTabChange] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      setCheckTabChange(true);
      onChangeTab(tabId);
    },
    [onChangeTab]
  );

  const handleSelect = useCallback(
    (currentValue: string) => {
      onChangeRoute(currentValue);
      setOpenPopover(false);
    },
    [onChangeRoute]
  );

  const createHandleSelectCallback = useCallback(
    (id: string) => () => handleSelect(id),
    [handleSelect]
  );

  const selectedRoute = useMemo(() => {
    if (!routeId) return undefined;
    return sortedRoutes?.find((r) => r.id.toString() === routeId);
  }, [sortedRoutes, routeId]);

  const orgRouteId =
    useOrganizationContext().organization?.setting?.application
      ?.default_route_id;

  const handleReset = () => {
    setActiveTab("All");
    onChangeTab("All");
    onChangeRoute(`${orgRouteId}`);
    const newDate = addDays(new Date(), 1);
    setActiveDate(newDate);
    onDateClick(newDate);
  };

  // Arrow navigation handlers are now defined above with disabled date skipping logic

  const canBack = !dateListData?.find(
    (date) => date.date === format(subDays(activeDate, 1), "yyyy-MM-dd")
  )?.isDisable;

  const canForward = !dateListData?.find(
    (date) => date.date === format(addDays(activeDate, 1), "yyyy-MM-dd")
  )?.isDisable;

  const canTabBack = operators && activeTab !== "All" && activeTab !== "";
  const canTabForward =
    operators && activeTab !== (operators[operators.length - 1]?.id || "");

  const arrowBackTabHandle = useCallback(() => {
    const allTabs = ["All", ...(operators?.map((op) => op.id) || [])];
    const currentIndex = allTabs.indexOf(activeTab || "All");
    if (currentIndex > 0) {
      const newTab = allTabs[currentIndex - 1];
      handleTabClick(newTab);
    }
  }, [activeTab, operators, handleTabClick]);

  const arrowForwardTabHandle = useCallback(() => {
    const allTabs = ["All", ...(operators?.map((op) => op.id) || [])];
    const currentIndex = allTabs.indexOf(activeTab || "All");
    if (currentIndex < allTabs.length - 1) {
      const newTab = allTabs[currentIndex + 1];
      handleTabClick(newTab);
    }
  }, [activeTab, operators, handleTabClick]);

  useEffect(() => {
    if (minDate) {
      setActiveDate(minDate);
      onDateClick(minDate);
    }
  }, [minDate, onDateClick]);

  return (
    <>
      {/* DatePicker */}
      <div className="">
        <div className="flex items-center justify-center gap-2 md:gap-3 md:px-4">
          <div className="cursor-pointer text-default-600 hover:text-primary">
            {canBack && <MdArrowBackIos onClick={arrowBackHandle} />}
          </div>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex w-max space-x-2 py-4 text-xs font-semibold lg:text-sm">
              {dateListData ? (
                dateListData.map((date, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!date.isDisable) {
                        const newDate = new Date(date.date);
                        handleDateClick(newDate);
                      }
                    }}
                    className={`${
                      isSameDay(activeDate, new Date(date.date))
                        ? "!bg-primary-600 text-white"
                        : date.isCurrent
                          ? "border-primary bg-primary-600"
                          : "border-default-50"
                    } ${
                      date.isDisable
                        ? "border-1 border-white bg-default-400"
                        : "cursor-pointer bg-primary-100 hover:border-primary"
                    } flex snap-center flex-col items-center justify-center gap-0 rounded-md border-1 p-1 shadow-sm transition-colors duration-200 ease-in-out`}
                  >
                    <div
                      className={`${
                        isSameDay(activeDate, new Date(date.date))
                          ? "text-white"
                          : date.isCurrent
                            ? "text-primary-foreground"
                            : "text-black dark:text-white"
                      } text-xs transition-colors duration-200 ease-in-out lg:text-sm`}
                    >
                      {format(new Date(date.date), "dd/MM")}
                    </div>
                  </div>
                ))
              ) : (
                <div>{t("filterResultEmpty")}</div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="cursor-pointer text-default-600 hover:text-primary">
            {canForward && <MdArrowForwardIos onClick={arrowForwardHandle} />}
          </div>
        </div>
      </div>
      {/* Filter */}
      <div className="flex w-full flex-col items-center justify-center md:flex-row md:justify-between md:gap-2">
        <div className="flex w-full max-w-[776px] items-center gap-0 md:w-auto md:flex-1 md:gap-2 md:overflow-y-auto md:whitespace-nowrap">
          <div className="cursor-pointer text-default-600 hover:text-primary">
            {canTabBack && <MdArrowBackIos onClick={arrowBackTabHandle} />}
          </div>
          <ScrollArea className="whitespace-nowrap">
            <div className="flex space-x-2 p-4 pl-0 text-xs font-semibold lg:text-sm">
              <button
                key={0}
                className={`tab-button ${
                  activeTab === "All" || (activeTab === "" && !operatorId)
                    ? "border-b-2 border-solid border-default-800 font-semibold text-default-800"
                    : "font-normal text-default-600"
                } p-2`}
                onClick={() => handleTabClick("All")}
              >
                {t("table.filter.tab")}
              </button>
              {operators?.map((operator) => (
                <button
                  key={operator.id}
                  className={`tab-button ${
                    (operatorId && !checkTabChange ? operatorId : activeTab) ===
                    operator.id
                      ? "border-b-2 border-solid border-default-800 font-semibold text-default-800"
                      : "font-normal text-default-600"
                  } p-2`}
                  onClick={() => handleTabClick(operator.id)}
                >
                  {operator.operator_name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="cursor-pointer text-default-600 hover:text-primary">
            {canTabForward && (
              <MdArrowForwardIos onClick={arrowForwardTabHandle} />
            )}
          </div>
        </div>

        <div className="mb-2 mt-2 flex w-full flex-none justify-end gap-3 md:mb-0 md:mt-0 md:w-96">
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="flex w-72 items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap"
                aria-label="Filter by route"
              >
                <div className="flex gap-1 truncate text-sm font-normal">
                  <IoIosSearch className="mr-2 h-5 w-5 shrink-0" />
                  <span className="text-sm">
                    {selectedRoute
                      ? `${selectedRoute.departure_name} - ${selectedRoute.destination_name}`
                      : t("table.filter.route")}
                  </span>
                </div>
                <MdExpandMore className="ml-2 h-6 w-6 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Tìm tuyến..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy tuyến.</CommandEmpty>
                  <CommandGroup>
                    {sortedRoutes?.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.departure_name} - ${item.destination_name}`}
                        onSelect={createHandleSelectCallback(
                          item.id.toString()
                        )}
                      >
                        <IoIosCheckmark
                          className={`mr-2 h-4 w-4 ${
                            (routeId ? routeId : "") === item.id.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {item.departure_name + " - " + item.destination_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <button
            className="rounded-md border border-transparent bg-primary-100 px-2 py-1 hover:border-primary"
            onClick={handleReset}
            aria-label="Reset voyage table data"
          >
            <MdOutlineRestartAlt className="text-2xl" />
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(VoyagesTableFilters);
