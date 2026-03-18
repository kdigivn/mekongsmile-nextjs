/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { Location } from "@/services/apis/locations/types/location";
import { useGetRoutesService } from "@/services/apis/routes/routes.service";
import { Route } from "@/services/apis/routes/types/route";
import { objectToArray } from "@/services/helpers/objectUtils";
import { useTranslation } from "@/services/i18n/client";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  formatDate,
  startOfMonth,
} from "date-fns";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useMemo,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DateRange } from "react-day-picker";
import { IoIosSearch } from "react-icons/io";
import { MdExpandMore, MdOutlinePermIdentity } from "react-icons/md";
import { RiMapPinLine, RiMapPinRangeLine } from "react-icons/ri";
import SelectLocationComboboxResponsive from "../combobox/select-location-combobox-responsive";
import DatePickerWithRange from "../ui/date-range-picker";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { SchedulesQueryParams } from "@/app/(language)/schedules/_types/route-search-params";
import { HighlightRouteMain } from "@/services/infrastructure/wordpress/types/sideBar";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { LiaExchangeAltSolid } from "react-icons/lia";
import React from "react";
import { useGetLocations } from "@/services/apis/locations/locations.service";
import { VoyagesCount } from "@/services/apis/voyages/types/voyage";
import { useCountVoyageReactQuery } from "@/services/apis/voyages/voyages.service";
import { useCheckMobile } from "@/hooks/use-check-screen-type";

type Key = string | number;

type Props = {
  /**
   * Default departure id
   */
  initDepartureId?: string;
  /**
   * Default destination id
   */
  initDestinationId?: string;
  /**
   * Default from & to date
   */
  initFromTo?: DateRange;
  /**
   * Default number of passengers
   */
  initPassengers?: string;
  /**
   * Routes fetch in server component
   */
  initRoutes?: Route[];
  /**
   * Tailwind css class name
   */
  className?: string;

  /**
   * Layout of form
   */
  layout?: "default" | "homeLayout";

  /**
   * Default Route
   */
  routeDefault?: Route;

  /**
   * Highlight Routes
   */
  highlightRouteMain?: HighlightRouteMain[];
};

const maxPassengers =
  Number(process.env.NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS) ?? 30;

const SearchTicketForm = ({
  initDepartureId,
  initDestinationId,
  initFromTo,
  initPassengers,
  initRoutes,
  className,
  layout = "default",
  routeDefault,
  highlightRouteMain,
}: Props) => {
  const { t } = useTranslation("search-ticket-form");

  const router = useRouter();
  const fetchRoutes = useGetRoutesService();
  const { locations } = useGetLocations();

  const destinationSelectRef = useRef<HTMLButtonElement | null>(null);

  const voyageCountCache = useRef<Map<string, VoyagesCount[]>>(new Map());

  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  // Store Route data fetched from API
  const [routes, setRoutes] = useState<Route[]>([]);
  // Store departure data extracted from route
  const [departures, setDepartures] = useState<Location[]>([]);
  // Store destination data extracted from route
  const [destinations, setDestinations] = useState<Location[]>([]);
  // Store selected departure of user
  const [selectedDeparture, setSelectedDeparture] = useState<Location>();

  // Store selected destination of user
  const [selectedDestination, setSelectedDestination] = useState<Location>();
  // Store selected number of passenger of user
  const [passengers, setPassengers] = useState(initPassengers ?? "1");
  // Store selected from & to date of user. We don't need to use useState as the date already managed by DatePickerWithRange component
  const [selectedDate, setSelectedDate] = useState(
    initFromTo?.from
      ? initFromTo
      : {
          from: addDays(new Date(), 1),
        }
  );

  /**
   * Set selected departure & create list of destination base on departure location
   * @param routes List of available routes
   * @param departure departure location
   * @param expectedDestinationId ID of expected destination
   */
  const processSelectDeparture = useCallback(
    (routes: Route[], departure: Location, expectedDestinationId?: Key) => {
      setSelectedDeparture(departure);

      // Get list of destinations from departure id
      const destinationIds = routes
        ?.filter((route) => route.departure_id === departure?.id)
        .map((route) => route.destination_id);

      if (destinationIds.length > 0) {
        // Create list destination base on `destinationIds`
        const destinations = locations
          // find locations that are departure of routes
          .filter((location) => destinationIds.includes(location.id))
          // then sort location name by alphabet
          .sort((a, b) =>
            a.location_name
              .toLowerCase()
              .localeCompare(b.location_name.toLowerCase())
          );

        // Add delay to avoid UI flash because of NextUI animations
        setTimeout(() => {
          setDestinations(destinations);
        }, 50);

        // Check if expected destination id valid
        const expectedDestination = destinations.find(
          (destination) => destination.id === expectedDestinationId
        );
        if (expectedDestinationId && expectedDestination) {
          // Add delay to avoid UI flash because of NextUI animations
          setTimeout(() => {
            setSelectedDestination(expectedDestination);
          }, 50);
        } else {
          // Add delay to avoid UI flash because of NextUI animations
          setTimeout(() => {
            setSelectedDestination(destinations[0]);
          }, 50);
        }
      }
    },
    [locations]
  );

  /**
   * Process route data: get departures and destinations list from routes list
   */
  const processRouteData = useCallback(
    (routes: Route[]) => {
      setRoutes(routes);

      // Set list departure
      // Get list departure ID from routes
      const departureIds = routes.map((route) => route.departure_id);
      // Create list departures base on `departureIds`
      const departures = locations
        // find locations that are departure of routes
        .filter((location) => departureIds.includes(location.id))
        // then sort location name by alphabet
        .sort((a, b) =>
          a.location_name
            .toLowerCase()
            .localeCompare(b.location_name.toLowerCase())
        );

      setDepartures(departures);

      // if has initDepartureId and initDepartureId valid
      const initDeparture = departures.find(
        (location) => location.id === initDepartureId
      );
      const defaultDeparture = departures.find(
        (departure) => departure.id === routeDefault?.departure_id
      );
      const defaultDestinationId = routes.find(
        (route) => route.destination_id === routeDefault?.destination_id
      )?.destination_id;

      if (initDepartureId && initDeparture) {
        processSelectDeparture(routes, initDeparture, initDestinationId);
      } else if (defaultDeparture && defaultDestinationId) {
        // Use Sóc Trăng as default departure and Côn Đảo as default destination
        processSelectDeparture(routes, defaultDeparture, defaultDestinationId);
      } else {
        processSelectDeparture(routes, departures[0]);
      }
    },
    [
      initDepartureId,
      initDestinationId,
      locations,
      processSelectDeparture,
      routeDefault?.departure_id,
      routeDefault?.destination_id,
    ]
  );

  useEffect(() => {
    async function fetchRoutesData() {
      const { data, status } = await fetchRoutes();

      if (status === HTTP_CODES_ENUM.OK) {
        processRouteData(data.data);
      }
    }

    if (initRoutes) {
      processRouteData(initRoutes);
    } else {
      fetchRoutesData();
    }
  }, [fetchRoutes, processRouteData, initRoutes]);

  const handleDepartureSelectionChange = useCallback(
    (location: Location | null) => {
      if (location) {
        processSelectDeparture(routes, location);
        setTimeout(() => {
          destinationSelectRef.current?.click();
        }, 100);
      }
    },
    [processSelectDeparture, routes]
  );

  const handleDestinationSelectionChange = useCallback(
    (location: Location | null) => {
      if (location) {
        setSelectedDestination(location);
      }
    },
    []
  );

  const handlePassengerValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (Number(value) > maxPassengers)
        setPassengers(maxPassengers.toString());
      else setPassengers(value);
    },
    []
  );

  const handlePassengerValueBlur = useCallback(() => {
    if (!passengers) setPassengers("1");
    if (Number(passengers) < 1) setPassengers("1");
    if (Number(passengers) > maxPassengers)
      setPassengers(maxPassengers.toString());
  }, [passengers]);

  const handleSearchAction = useCallback(() => {
    if (selectedDeparture && selectedDestination) {
      const selectedRoute = routes.find(
        (route) =>
          route.departure_id === selectedDeparture.id &&
          route.destination_id === selectedDestination.id
      );

      // TODO: show toast about route error
      if (!selectedRoute) {
        return;
      }

      const queryParams: SchedulesQueryParams = {
        from: formatDate(selectedDate.from!, "yyyy-MM-dd"),
        p: passengers,
      };

      if (selectedDate.to) {
        queryParams.to = formatDate(selectedDate.to, "yyyy-MM-dd");
      }

      // Create path.
      const params = [
        selectedRoute.id,
        selectedRoute.departure_abbreviation,
        selectedRoute.destination_abbreviation,
      ];

      const path = `/schedules/${params.join("-")}?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;

      router.push(path);
    }
  }, [
    selectedDeparture,
    selectedDestination,
    routes,
    passengers,
    selectedDate.from,
    selectedDate.to,
    router,
  ]);

  const selectorIcon = useMemo(
    () => <MdExpandMore className="mb-4 h-6 w-6 text-black" />,
    []
  );

  const handleSwapLocation = useCallback(() => {
    if (selectedDeparture && selectedDestination) {
      processSelectDeparture(routes, selectedDestination, selectedDeparture.id);
      setEffect(true);
      setActiveButtonId("");
    }
  }, [processSelectDeparture, routes, selectedDeparture, selectedDestination]);

  const [effect, setEffect] = useState(false);

  const [activeButtonId, setActiveButtonId] = useState("");

  const handleFillLocation = useCallback((item: HighlightRouteMain) => {
    if (item.selectedDeparture) {
      setSelectedDeparture(item.selectedDeparture);
    }
    if (item.selectedDestination) {
      setSelectedDestination(item.selectedDestination);
    }
    setEffect(true);
  }, []);

  // Date disable

  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate?.from ?? new Date()
  ); // Track displayed month

  const [currentMonthReturn, setCurrentMonthReturn] = useState<Date>(
    selectedDate?.to ?? new Date()
  ); // Track displayed month

  const isMobile = useCheckMobile();
  const numberOfMonths = isMobile ? 1 : 2;
  const getMonthRange = useCallback(
    (month: Date) => {
      const from = startOfMonth(month);
      const to =
        numberOfMonths === 2
          ? endOfMonth(addMonths(month, 1))
          : endOfMonth(month);
      return { from, to };
    },
    [numberOfMonths]
  );

  const getMonthRangeReturn = useCallback(
    (month: Date) => {
      const from = startOfMonth(month);
      const to =
        numberOfMonths === 2
          ? endOfMonth(addMonths(month, 2))
          : endOfMonth(month);
      return { from, to };
    },
    [numberOfMonths]
  );

  const generateCacheKey = (
    month: Date,
    departureId?: string,
    destinationId?: string
  ) => {
    const monthKey = format(month, "yyyy-MM");
    return `${monthKey}_${departureId || ""}_${destinationId || ""}`;
  };

  // Helper function để lấy hoặc lưu dữ liệu vào cache
  const getCachedVoyageCount = (
    month: Date,
    departureId?: string,
    destinationId?: string
  ) => {
    const cacheKey = generateCacheKey(month, departureId, destinationId);
    return voyageCountCache.current.get(cacheKey);
  };

  const setCachedVoyageCount = (
    month: Date,
    departureId?: string,
    destinationId?: string,
    data?: VoyagesCount[]
  ) => {
    const cacheKey = generateCacheKey(month, departureId, destinationId);
    voyageCountCache.current.set(cacheKey, data || []);
  };

  useEffect(() => {
    if (openStartDate) {
      // Reset or update currentMonth when the start date picker opens
      setCurrentMonth(selectedDate?.from ?? new Date());
      setOpenStartDate(false);
    }
  }, [openStartDate, selectedDate?.from]);
  // Helper function to get disabled dates for a given route
  // Sửa lại hàm useDisabledDates
  const useDisabledDates = (departureId?: string, destinationId?: string) => {
    const { from: dateFrom, to: dateTo } = getMonthRange(currentMonth);

    // Kiểm tra cache trước
    const cachedData = getCachedVoyageCount(
      currentMonth,
      departureId,
      destinationId
    );

    const { count: voyageCounts } = useCountVoyageReactQuery(
      useMemo(
        () => ({
          departure_id: departureId,
          destination_id: destinationId,
          depart_date_from: format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          depart_date_to: format(dateTo, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        }),
        [dateFrom, dateTo, departureId, destinationId]
      ),
      !!(departureId && destinationId && !cachedData) // Chỉ fetch nếu không có trong cache
    );

    // Lưu dữ liệu mới vào cache
    useEffect(() => {
      if (voyageCounts && departureId && destinationId) {
        setCachedVoyageCount(
          currentMonth,
          departureId,
          destinationId,
          voyageCounts
        );
      }
    }, [voyageCounts, departureId, destinationId]);

    return useMemo(() => {
      const data =
        cachedData && cachedData.length > 0 ? cachedData : voyageCounts;

      // Group by departure_date và tính tổng total_available_voyage
      const voyageMap = new Map<string, number>();
      data.forEach((voyage: VoyagesCount) => {
        const dateKey = voyage.departure_date?.split("T")[0];
        if (dateKey) {
          const currentTotal = voyageMap.get(dateKey) || 0;
          voyageMap.set(
            dateKey,
            currentTotal + (voyage.total_available_voyage || 0)
          );
        }
      });

      // Tạo danh sách các ngày disabled
      const disabled: Date[] = [];
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Thêm các ngày trước hôm nay
      for (let d = new Date(startDate); d < today; d.setDate(d.getDate() + 1)) {
        disabled.push(new Date(d));
      }

      // Thêm các ngày không có chuyến
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = format(d, "yyyy-MM-dd");
        if (!voyageMap.has(dateKey) || (voyageMap.get(dateKey) || 0) === 0) {
          disabled.push(new Date(d));
        }
      }

      return disabled;
    }, [cachedData, voyageCounts, dateFrom, dateTo]);
  };

  useEffect(() => {
    if (openEndDate) {
      // Reset or update currentMonthReturn when the end date picker opens
      setCurrentMonthReturn(selectedDate?.to ?? new Date());
      setOpenEndDate(false);
    }
  }, [openEndDate, selectedDate?.to]);

  const useDisabledReturnDates = (
    departureId?: string,
    destinationId?: string
  ) => {
    const { from: dateFrom, to: dateTo } =
      getMonthRangeReturn(currentMonthReturn);

    // Kiểm tra cache trước
    const cachedData = getCachedVoyageCount(
      currentMonthReturn,
      departureId,
      destinationId
    );

    const { count: voyageCounts } = useCountVoyageReactQuery(
      useMemo(
        () => ({
          departure_id: departureId,
          destination_id: destinationId,
          depart_date_from: format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          depart_date_to: format(dateTo, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        }),
        [dateFrom, dateTo, departureId, destinationId]
      ),
      !!(departureId && destinationId && !cachedData) // Chỉ fetch nếu không có trong cache
    );

    // Lưu dữ liệu mới vào cache
    useEffect(() => {
      if (voyageCounts && departureId && destinationId) {
        setCachedVoyageCount(
          currentMonthReturn,
          departureId,
          destinationId,
          voyageCounts
        );
      }
    }, [voyageCounts, departureId, destinationId]);

    return useMemo(() => {
      const data =
        cachedData && cachedData.length > 0 ? cachedData : voyageCounts;

      // Group by departure_date và tính tổng total_available_voyage
      const voyageMap = new Map<string, number>();
      data.forEach((voyage: VoyagesCount) => {
        const dateKey = voyage.departure_date?.split("T")[0];
        if (dateKey) {
          const currentTotal = voyageMap.get(dateKey) || 0;
          voyageMap.set(
            dateKey,
            currentTotal + (voyage.total_available_voyage || 0)
          );
        }
      });

      // Tạo danh sách các ngày disabled
      const disabled: Date[] = [];
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Thêm các ngày trước hôm nay
      for (let d = new Date(startDate); d < today; d.setDate(d.getDate() + 1)) {
        disabled.push(new Date(d));
      }

      // Thêm các ngày không có chuyến
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = format(d, "yyyy-MM-dd");
        if (!voyageMap.has(dateKey) || (voyageMap.get(dateKey) || 0) === 0) {
          disabled.push(new Date(d));
        }
      }

      return disabled;
    }, [cachedData, voyageCounts, dateFrom, dateTo]);
  };

  const disabledDepartureDates = useDisabledDates(
    selectedDeparture?.id,
    selectedDestination?.id
  );
  const disabledReturnDates = useDisabledReturnDates(
    selectedDestination?.id,
    selectedDeparture?.id
  );

  if (layout === "homeLayout") {
    return (
      <div
        className={cn(
          "grid w-full grid-flow-row grid-cols-10 content-center justify-center gap-2",
          className
        )}
      >
        <div className="col-span-10 grid w-full grid-cols-2 gap-2 md:col-span-8 lg:col-span-10">
          {/* Select departure */}
          <div className="relative flex w-full">
            <div className="flex w-full flex-col rounded-md border border-default-400 bg-white px-3 py-1.5">
              {/* Autocomplete title */}
              <div className="flex items-center gap-1">
                <RiMapPinRangeLine className="h-4 w-4" />
                <p className="text-xs">{t("departure.label")}</p>
              </div>

              <SelectLocationComboboxResponsive
                title={t("location.departure")}
                location={selectedDeparture}
                locations={departures}
                selectorIcon={selectorIcon}
                onSelection={(item) => {
                  handleDepartureSelectionChange(item);
                  setActiveButtonId("");
                }}
                classNames={{
                  contentWrapper: "rounded-md h-full",
                  triggerButton: "h-5 w-full py-0 pl-5 pr-1 font-normal",
                }}
              />
            </div>

            <Button
              type="button"
              className={`absolute right-0 top-1/2 h-8 w-8 translate-x-[60%] translate-y-[-50%] rounded-full bg-primary-100 p-1 text-xl text-black hover:bg-primary-600 hover:text-white hover:ease-in-out`}
              onClick={handleSwapLocation}
              aria-label="Swap location"
            >
              <MdOutlineSwapHoriz
                width={"24px"}
                height={"24px"}
                className={`${
                  effect && "animate-spin duration-200 ease-in repeat-1"
                }`}
                onAnimationEnd={() => setEffect(false)}
              />
            </Button>
          </div>

          {/* Select destination */}
          <div className="flex w-full flex-col rounded-md border border-default-400 bg-white px-3 py-1.5">
            {/* Autocomplete title */}
            <div className="flex items-center gap-1">
              <RiMapPinLine className="h-4 w-4" />
              <p className="text-xs">{t("destination.label")}</p>
            </div>

            <SelectLocationComboboxResponsive
              ref={destinationSelectRef}
              title={t("location.destination")}
              location={selectedDestination}
              locations={destinations}
              selectorIcon={
                <MdExpandMore className="mb-4 h-6 w-6 text-black" />
              }
              onSelectionChange={handleDestinationSelectionChange}
              classNames={{
                contentWrapper: "rounded-md h-full",
                triggerButton: "h-5 w-full py-0 pl-5 pr-1 font-normal",
              }}
              onSelection={() => setActiveButtonId("")}
            />
          </div>
        </div>

        <div className="col-span-10 h-fit w-full items-center md:col-span-8 lg:col-span-10">
          <DatePickerWithRange
            defaultValue={selectedDate}
            onValueChange={setSelectedDate}
            className="w-full !flex-row"
            disabledDepartureDates={disabledDepartureDates}
            disabledReturnDates={disabledReturnDates}
            setCurrentMonth={setCurrentMonth}
            setCurrentMonthReturn={setCurrentMonthReturn}
            setOpenStartDate={setOpenStartDate}
            setOpenEndDate={setOpenEndDate}
          />
        </div>

        {/* Select Passengers */}
        <div className="col-span-10 grid w-full grid-cols-1 gap-2 md:col-span-2 md:col-start-9 md:row-span-2 md:row-start-1 lg:col-span-10 lg:row-auto">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="h-fit w-full rounded-md border border-default-400 bg-white px-3 py-1.5">
              <div className="flex items-center gap-1">
                <MdOutlinePermIdentity className="h-4 w-4" />
                <p className="text-xs">{t("passengers.label")}</p>
              </div>
              <Input
                placeholder={t("passengers.placeholder")}
                className="placeholder: h-5 border-none p-0 pl-5 pr-1 shadow-none focus-visible:ring-0"
                type="number"
                value={passengers}
                onChange={handlePassengerValueChange}
                onBlur={handlePassengerValueBlur}
                min={1}
                max={50}
              />
            </div>

            <Button
              color="primary"
              onClick={handleSearchAction}
              size="lg"
              className="flex h-12 w-full flex-none justify-center gap-3 rounded-md border border-primary px-4 py-3"
              id="btn-search-ticket"
            >
              {t("search")}
              <IoIosSearch className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <ScrollArea className="col-span-10 grid h-fit w-full grid-cols-1 gap-2 md:col-span-10 lg:col-span-10 lg:whitespace-nowrap">
          <div className="flex gap-2">
            {highlightRouteMain?.map((item) => (
              <Button
                key={item.routeId}
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                onClick={() => {
                  handleFillLocation(item);
                  setActiveButtonId(item.routeId as string);
                }}
                className={`h-[3.1rem] border border-default-400 bg-white px-3 py-1 text-black opacity-50 hover:bg-white hover:text-primary-500 hover:opacity-100 ${activeButtonId === item.routeId ? "text-primary-500 opacity-100" : ""}`}
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex flex-col items-start gap-1">
                    <p>{item.departure_name}</p>
                    <p>{item.destination_name}</p>
                  </div>
                  <LiaExchangeAltSolid className="text-lg" />
                </div>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  if (layout === "default") {
    return (
      <div
        className={cn(
          "grid w-full grid-flow-row grid-cols-10 content-center justify-center gap-2 lg:gap-y-0",
          className
        )}
      >
        <div className="col-span-10 grid w-full grid-cols-2 gap-2 md:col-span-8 lg:col-span-4 lg:h-fit">
          {/* Select departure */}
          <div className="relative flex w-full">
            <div className="flex w-full flex-col rounded-md border border-default-400 bg-white px-3 py-1.5">
              {/* Autocomplete title */}
              <div className="flex items-center gap-1">
                <RiMapPinRangeLine className="h-4 w-4" />
                <p className="text-xs">{t("departure.label")}</p>
              </div>

              <SelectLocationComboboxResponsive
                location={selectedDeparture}
                locations={departures}
                selectorIcon={selectorIcon}
                onSelection={handleDepartureSelectionChange}
                classNames={{
                  contentWrapper: "rounded-md h-full",
                  triggerButton: "h-5 w-full py-0 pl-5 pr-1 font-normal",
                }}
              />
            </div>

            <Button
              type="button"
              className={`absolute right-0 top-1/2 h-8 w-8 translate-x-[60%] translate-y-[-50%] rounded-full bg-primary-100 p-1 text-xl text-black hover:bg-primary-600 hover:text-white hover:ease-in-out`}
              onClick={handleSwapLocation}
            >
              <MdOutlineSwapHoriz
                width={"24px"}
                height={"24px"}
                className={`${
                  effect && "animate-spin duration-200 ease-in repeat-1"
                }`}
                onAnimationEnd={() => setEffect(false)}
              />
            </Button>
          </div>

          {/* Select destination */}
          <div className="flex w-full flex-col rounded-md border border-default-400 bg-white px-3 py-1.5">
            {/* Autocomplete title */}
            <div className="flex items-center gap-1">
              <RiMapPinLine className="h-4 w-4" />
              <p className="text-xs">{t("destination.label")}</p>
            </div>

            <SelectLocationComboboxResponsive
              ref={destinationSelectRef}
              location={selectedDestination}
              locations={destinations}
              selectorIcon={
                <MdExpandMore className="mb-4 h-6 w-6 text-black" />
              }
              onSelectionChange={handleDestinationSelectionChange}
              classNames={{
                contentWrapper: "rounded-md h-full",
                triggerButton: "h-5 w-full py-0 pl-5 pr-1 font-normal",
              }}
            />
          </div>
        </div>

        <div className="col-span-10 h-fit w-full items-center md:col-span-8 lg:col-span-4">
          <DatePickerWithRange
            defaultValue={selectedDate}
            onValueChange={setSelectedDate}
            className="w-full !flex-row"
            disabledDepartureDates={disabledDepartureDates}
            disabledReturnDates={disabledReturnDates}
            setCurrentMonth={setCurrentMonth}
            setCurrentMonthReturn={setCurrentMonthReturn}
            setOpenStartDate={setOpenStartDate}
            setOpenEndDate={setOpenEndDate}
          />
        </div>

        {/* Select Passengers */}
        <div className="col-span-10 grid w-full grid-cols-1 gap-2 md:col-span-2 md:col-start-9 md:row-span-2 md:row-start-1 lg:col-span-2 lg:col-start-9 lg:grid-cols-2">
          <div className="h-fit w-full rounded-md border border-default-400 bg-white px-3 py-1.5 lg:pl-2 lg:pr-0">
            <div className="flex items-center gap-1">
              <MdOutlinePermIdentity className="h-4 w-4" />
              <p className="text-xs">{t("passengers.label")}</p>
            </div>
            <Input
              placeholder={t("passengers.placeholder")}
              className="placeholder: h-5 border-none p-0 pl-5 pr-1 shadow-none focus-visible:ring-0"
              type="number"
              value={passengers}
              onChange={handlePassengerValueChange}
              onBlur={handlePassengerValueBlur}
              min={1}
              max={50}
            />
          </div>

          <Button
            color="primary"
            onClick={handleSearchAction}
            size="lg"
            className="flex h-12 w-full flex-none justify-center gap-3 rounded-md border border-primary px-4 py-3"
            id="btn-search-ticket"
          >
            <span className="lg:hidden xl:inline">{t("search")}</span>
            <IoIosSearch className="h-6 w-6 xl:hidden" />
          </Button>
        </div>
      </div>
    );
  }

  return <></>;
};

export default memo(SearchTicketForm);
