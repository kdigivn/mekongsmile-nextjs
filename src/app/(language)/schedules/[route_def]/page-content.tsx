/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Operator } from "@/services/apis/operators/types/operator";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import {
  Voyage,
  VoyageItem,
  VoyagesCount,
} from "@/services/apis/voyages/types/voyage";
import { VoyagesFindByLocationAndDate } from "@/services/apis/voyages/types/voyage-queries";
import {
  useCountVoyageReactQuery,
  useVoyagesFindByLocationAndDateQueryCursor,
} from "@/services/apis/voyages/voyages.service";
import {
  LocalFormKey,
  LocalSelectedTicketFormData,
} from "@/services/form/types/form-types";
import { objectToArray } from "@/services/helpers/objectUtils";
import { useTranslation } from "@/services/i18n/client";
import {
  addDays,
  format,
  formatDate,
  isAfter,
  isBefore,
  subDays,
} from "date-fns";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatVoyages } from "../search-helpers";
import VoyageTabContent, {
  VoyageTabContentRefType,
} from "./voyage-tab-content";
import { generateClickbaitVoyage } from "@/lib/clickBaitUtil";
import { GrExpand } from "react-icons/gr";
import FerryRouteMapDialog from "@/components/dialog/ferry-route-map-dialog";
import { Route } from "@/services/apis/routes/types/route";
import { CiMap } from "react-icons/ci";
import FilterSection from "../_components/filter-section";
import BookingStep from "@/components/page-section/booking-step";
import SearchTicketForm from "@/components/form/search-ticket-form";
import HtmlToImage from "@/components/html-to-image/html-to-image";
import { HtmlToImageSectionCaptureId } from "@/components/html-to-image/enum";
import { DisableRoute } from "@/services/infrastructure/wordpress/types/sideBar";
import { Location } from "@/services/apis/locations/types/location";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import dynamic from "next/dynamic";

// use dynamic import to prevent SSR error
const FerryMap = dynamic(() => import("@/components/map"), { ssr: false });

type Props = {
  /**
   * Default departure id
   */
  initDepartureId: string;
  /**
   * Default destination id
   */
  initDestinationId: string;
  /**
   * Default from date
   */
  initFrom: string;
  /**
   * Default to date
   */
  initTo?: string;
  hasReturn?: boolean;
  numberOfPassengers: number;
  className?: string;
  routeSearch?: Route;
  routes: Route[];
  disableRoutes?: DisableRoute[];
  locations: Location[];
};

type DateItem = {
  date: string;
  day: string;
  weekday: string;
  isCurrent: boolean;
  isDisable: boolean;
};

const Search = ({
  initDepartureId,
  initDestinationId,
  initFrom,
  initTo,
  hasReturn = false,
  numberOfPassengers,
  className,
  routeSearch,
  routes,
  disableRoutes,
  locations,
}: Props) => {
  // Libs
  const router = useRouter();
  const { t: filterTranslation } = useTranslation("search/filter-and-sort");
  const { t: searchTranslation } = useTranslation("search");
  const isMobile = useCheckMobile();

  // Cache để lưu trữ voyageCounts
  const voyageCache = useRef<Map<string, VoyagesCount[]>>(new Map());

  // Refs
  const departVoyageTabContentRef = useRef<VoyageTabContentRefType>(null);
  const destiVoyageTabContentRef = useRef<VoyageTabContentRefType>(null);

  // States

  const [activeTab, setActiveTab] = useState("0");
  const [departVoyagesState, setDepartVoyagesState] = useState<VoyageItem[]>(
    []
  );
  const [destiVoyagesState, setDestiVoyagesState] = useState<VoyageItem[]>([]);
  const [departSelectVoyage, setDepartSelectVoyage] = useState<VoyageItem>();
  const [destiSelectVoyage, setDestiSelectVoyage] = useState<VoyageItem>();
  const [ticketPriceSelected, setTicketPriceSelected] = useState({
    minPrice: 0,
    maxPrice: 0,
  });
  const [operatorSelected, setOperatorSelected] = useState<Operator[]>([]);
  const [sortState, setSortState] = useState("0");
  const [dateForm, setDateFrom] = useState(initFrom || "");
  const [dateTo, setDateTo] = useState(initTo || "");

  const isRouteEnabled = !routeSearch?.disable || false;

  const scrollToTab = useCallback(() => {
    if (typeof window !== "undefined")
      window.scrollTo({
        top: 0, // Scrolls to the top
        behavior: "smooth", // Smooth scrolling
      });
  }, []);

  // Open/Close Ferry Route Map Modal
  const [openFerryMapDialog, setOpenFerryMapDialog] = useState<boolean>(false);
  const handleFerryMapClose = useCallback(() => {
    setOpenFerryMapDialog(false);
  }, []);

  const handleFerryMapOpen = useCallback(() => {
    setOpenFerryMapDialog(true);
  }, []);

  const [requestDepartVoyages, setRequestDepartVoyages] =
    useState<VoyagesFindByLocationAndDate>({
      departure_id: initDepartureId,
      destination_id: initDestinationId,
      departure_date: initFrom,
      limit: 50,
    });

  const [requestDestiVoyages, setRequestDestiVoyages] =
    useState<VoyagesFindByLocationAndDate>({
      departure_id: initDestinationId,
      destination_id: initDepartureId,
      departure_date: initTo ?? initFrom,
      limit: 50,
    });

  const {
    voyages: departVoyages,
    voyagesLoading: departVoyageLoading,
    voyagesIsFetching: departVoyagesIsFetching,
    // voyagesFetchNextPage: departVoyagesFetchNextPage,
    // voyagesHasNextPage: departVoyagesHasNextPage,
  } = useVoyagesFindByLocationAndDateQueryCursor(
    requestDepartVoyages,
    isRouteEnabled,
    {
      cache: "no-store",
    }
  );

  const {
    voyages: destiVoyages,
    voyagesRefetch: destiVoyageRefetch,
    voyagesLoading: destiVoyageLoading,
    voyagesIsFetching: destiVoyagesIsFetching,
    // voyagesFetchNextPage: destiVoyagesFetchNextPage,
    // voyagesHasNextPage: destiVoyagesHasNextPage,
  } = useVoyagesFindByLocationAndDateQueryCursor(
    requestDestiVoyages,
    hasReturn && isRouteEnabled,
    {
      cache: "no-store",
    }
  );

  // Track if user has manually changed the dates
  const hasManuallyChangedDate = useRef<{ depart: boolean; return: boolean }>({
    depart: false,
    return: false,
  });

  const baseDateList = useMemo(() => {
    const dateList: DateItem[] = [];
    let currentDate = new Date();
    const today = new Date();

    if (activeTab === "0" && dateForm) {
      currentDate = new Date(dateForm);
    }
    if (activeTab === "1" && dateTo) {
      currentDate = new Date(dateTo);
    }

    // Add previous dates
    for (let i = 3; i > 0; i--) {
      const dateBefore = subDays(currentDate, i);
      dateList.push({
        date: format(dateBefore, "yyyy-MM-dd"),
        day: format(dateBefore, "dd"),
        weekday: filterTranslation(`${format(dateBefore, "EEEE")}`),
        isCurrent: false,
        isDisable:
          activeTab === "0"
            ? !isAfter(dateBefore, subDays(today, 1))
            : !isAfter(dateBefore, subDays(today, 1)) ||
              !isAfter(dateBefore, dateForm),
      });
    }

    // Add current date
    dateList.push({
      date: format(currentDate, "yyyy-MM-dd"),
      day: format(currentDate, "dd"),
      weekday: filterTranslation(`${format(currentDate, "EEEE")}`),
      isCurrent: true,
      isDisable:
        activeTab === "0"
          ? !isAfter(currentDate, today)
          : !isAfter(currentDate, today) ||
            !isAfter(currentDate, `${dateForm}`),
    });

    // Add future dates
    for (let i = 1; i <= 3; i++) {
      const dateAfter = addDays(currentDate, i);
      dateList.push({
        date: format(dateAfter, "yyyy-MM-dd"),
        day: format(dateAfter, "dd"),
        weekday: filterTranslation(`${format(dateAfter, "EEEE")}`),
        isCurrent: false,
        isDisable:
          activeTab === "0"
            ? !isAfter(dateAfter, today)
            : !isAfter(dateAfter, today) || !isAfter(dateAfter, `${dateForm}`),
      });
    }

    return dateList;
  }, [activeTab, dateForm, dateTo, filterTranslation]);

  // Tạo cache key dựa trên các tham số
  const cacheKey = useMemo(() => {
    const departure_id =
      activeTab === "0" ? initDepartureId : initDestinationId;
    const destination_id =
      activeTab === "0" ? initDestinationId : initDepartureId;
    return `${activeTab}_${departure_id || ""}_${destination_id || ""}_${
      baseDateList[0]?.date || ""
    }_${baseDateList[baseDateList.length - 1]?.date || ""}`;
  }, [activeTab, initDepartureId, initDestinationId, baseDateList]);

  // Kiểm tra cache trước khi fetch
  const cachedVoyageCounts = voyageCache.current.get(cacheKey);

  // Fetch voyage counts nếu không có trong cache
  const { count: voyageCounts } = useCountVoyageReactQuery(
    {
      departure_id: activeTab === "0" ? initDepartureId : initDestinationId,
      destination_id: activeTab === "0" ? initDestinationId : initDepartureId,
      depart_date_from: format(
        subDays(new Date(baseDateList[0].date), 1),
        "yyyy-MM-dd'T'HH:mm:ss'Z'"
      ),
      depart_date_to: format(
        new Date(baseDateList[baseDateList.length - 1].date),
        "yyyy-MM-dd'T'HH:mm:ss'Z'"
      ),
    },
    !!(activeTab === "0"
      ? initDepartureId && initDestinationId
      : initDestinationId && initDepartureId) && !cachedVoyageCounts // Chỉ fetch nếu không có cache
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

  // Create a map of date to total voyages
  const dateToVoyageCount = useMemo(() => {
    const countMap = new Map<string, number>();

    if (finalVoyageCounts && Array.isArray(finalVoyageCounts)) {
      finalVoyageCounts.forEach((item) => {
        if (item.departure_date) {
          const dateKey = format(new Date(item.departure_date), "yyyy-MM-dd");
          countMap.set(dateKey, item.total_voyage);
        }
      });
    }

    return countMap;
  }, [finalVoyageCounts]);

  // Apply voyage count based disabling to the date list
  // Apply voyage count based disabling to the date list
  const dateList = useMemo(
    () =>
      baseDateList.map((dateItem) => ({
        ...dateItem,
        isDisable:
          dateItem.isDisable ||
          (dateToVoyageCount.get(dateItem.date) || 0) <= 0,
      })),
    [baseDateList, dateToVoyageCount]
  );

  // This effect update depart voyages data
  useEffect(() => {
    if (departVoyages) {
      // Inject clickbait voyage if match config
      if (routeSearch?.id && dateForm) {
        const clickbaitVoyage = generateClickbaitVoyage(
          departVoyages.map((v) => v.voyage),
          routeSearch.id,
          dateForm
        );

        if (clickbaitVoyage) {
          departVoyages.push({ voyage: clickbaitVoyage });
        }
      }

      setDepartVoyagesState(formatVoyages(departVoyages.map((v) => v)));
    }
  }, [dateForm, departVoyages, routeSearch]);

  // This effect update desti voyages data
  useEffect(() => {
    if (!hasReturn) return;

    if (destiVoyages) {
      // Inject clickbait voyage if match config
      // For return voyages, find the reverse route (destination -> departure)
      if (routeSearch && dateTo) {
        const returnRoute = routes.find(
          (r) =>
            r.departure_id === routeSearch.destination_id &&
            r.destination_id === routeSearch.departure_id
        );

        if (returnRoute) {
          const clickbaitVoyage = generateClickbaitVoyage(
            destiVoyages.map((v) => v.voyage),
            returnRoute.id,
            dateTo
          );

          if (clickbaitVoyage) {
            destiVoyages.push({ voyage: clickbaitVoyage });
          }
        }
      }

      setDestiVoyagesState(formatVoyages(destiVoyages.map((v) => v)));
    }
  }, [destiVoyages, hasReturn, routeSearch, dateTo, routes]);

  // This effect handle streaming voyage data
  useEffect(() => {
    // When current tab is departure, depart voyages are expired and done streaming new voyages
    if (departVoyagesIsFetching) {
      departVoyageTabContentRef.current?.startStreaming();
    }
    if (!departVoyagesIsFetching) {
      departVoyageTabContentRef.current?.finishStreaming();
      // display toast when finish
      // if (activeTab === "0") {
      //   toast.success(searchTranslation("toast.depart"));
      // }
    }
  }, [activeTab, departVoyagesIsFetching, searchTranslation]);

  // This effect handle streaming voyage data
  useEffect(() => {
    // When current tab is destination, desti voyages are expired and done streaming new voyages
    if (destiVoyagesIsFetching) {
      destiVoyageTabContentRef.current?.startStreaming();
    }
    if (!destiVoyagesIsFetching) {
      destiVoyageTabContentRef.current?.finishStreaming();
      // display toast when finish
      // if (activeTab === "1") toast.success(searchTranslation("toast.desti"));
    }
  }, [activeTab, destiVoyagesIsFetching, searchTranslation]);

  // Set default selected voyage base on href
  useEffect(() => {
    // Use useLayoutEffect or delay the execution to client-side only
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");
      const [lastSelectedDepartVoyageId, lastSelectedDestiVoyageId] =
        hash.split("-");

      // Set default depart voyage
      if (lastSelectedDepartVoyageId) {
        const departVoyage = departVoyagesState.find(
          (voyage) => voyage.voyage.id === lastSelectedDepartVoyageId
        );
        if (departVoyage) {
          setDepartSelectVoyage(departVoyage);
        }
      }

      // Set default desti voyage
      if (lastSelectedDestiVoyageId) {
        const destiVoyage = destiVoyagesState.find(
          (voyage) => voyage.voyage.id === lastSelectedDestiVoyageId
        );
        if (destiVoyage) {
          setDestiSelectVoyage(destiVoyage);
        }
      }
    };

    // Execute only on client-side
    if (typeof window !== "undefined") {
      checkHash();
    }
  }, [departVoyagesState, destiVoyagesState]);

  const ticketPriceRange = useMemo(() => {
    let minPrice: number = 0;
    let maxPrice: number = 0;

    if (activeTab === "0") {
      if (departVoyagesState[0]) {
        minPrice =
          departVoyagesState[0].voyage.ticket_prices.default_ticket_price;
        maxPrice =
          departVoyagesState[0].voyage.ticket_prices.default_ticket_price;
      }
    } else {
      if (destiVoyagesState[0]) {
        minPrice =
          destiVoyagesState[0].voyage.ticket_prices.default_ticket_price;
        maxPrice =
          destiVoyagesState[0].voyage.ticket_prices.default_ticket_price;
      }
    }

    if (activeTab === "0") {
      departVoyagesState.forEach((voyage) => {
        // If minPrice is undefined or the current ticket_prices.default_ticket_price is less than minPrice, update minPrice
        if (
          minPrice === undefined ||
          voyage.voyage.ticket_prices.default_ticket_price < minPrice
        ) {
          minPrice = voyage.voyage.ticket_prices.default_ticket_price;
        }

        // If maxPrice is undefined or the current ticket_prices.default_ticket_price is greater than maxPrice, update maxPrice
        if (
          maxPrice === undefined ||
          voyage.voyage.ticket_prices.default_ticket_price > maxPrice
        ) {
          maxPrice = voyage.voyage.ticket_prices.default_ticket_price;
        }
      });
    } else {
      destiVoyagesState.forEach((voyage) => {
        // If minPrice is undefined or the current ticket_prices.default_ticket_price is less than minPrice, update minPrice
        if (
          minPrice === undefined ||
          voyage.voyage.ticket_prices.default_ticket_price < minPrice
        ) {
          minPrice = voyage.voyage.ticket_prices.default_ticket_price;
        }

        // If maxPrice is undefined or the current ticket_prices.default_ticket_price is greater than maxPrice, update maxPrice
        if (
          maxPrice === undefined ||
          voyage.voyage.ticket_prices.default_ticket_price > maxPrice
        ) {
          maxPrice = voyage.voyage.ticket_prices.default_ticket_price;
        }
      });
    }
    if (
      (ticketPriceSelected.minPrice === ticketPriceSelected.maxPrice &&
        minPrice === maxPrice) ||
      ticketPriceSelected.minPrice === 0
    ) {
      setTicketPriceSelected({ minPrice, maxPrice });
    }
    // Return the minimum and maximum ticket prices
    return { minPrice, maxPrice };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, departVoyagesState, destiVoyagesState]);

  useEffect(() => {
    if (ticketPriceRange) {
      setTicketPriceSelected({
        minPrice: ticketPriceRange.minPrice,
        maxPrice: ticketPriceRange.maxPrice,
      });
    }
  }, [ticketPriceRange]);

  /**
   * Debounce time for function
   * @param func function debounce, return function or callback return void function
   * @param delay time to delay in miliseconds
   * @returns new function with debounce time
   */
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => ReturnType<T> | void {
    let timer: ReturnType<typeof setTimeout>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: Parameters<T>): ReturnType<T> | void {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);

      if (typeof func.apply(this, args) === "undefined") {
        return;
      } else {
        return func.apply(this, args) as ReturnType<T>;
      }
    };
  }

  /**
   * Sort Voyages based on sortState "0" ascending or "1" descending
   */
  const sortVoyages = useCallback(
    (state: string) => {
      const departVoyages = [...departVoyagesState];
      const destiVoyages = [...destiVoyagesState];
      if (state === "1") {
        departVoyages.sort((a, b) => {
          // Extracting the time part of depart_time and splitting it into hours, minutes, and seconds
          const timeA = a.voyage.depart_time.split(":").map(Number);
          const timeB = b.voyage.depart_time.split(":").map(Number);
          // Comparing hours, if equal then comparing minutes, and if still equal then comparing seconds
          for (let i = 0; i < 3; i++) {
            if (timeA[i] !== timeB[i]) {
              return timeB[i] - timeA[i];
            }
          }
          return (
            new Date(b.voyage.departure_date).getTime() -
            new Date(a.voyage.departure_date).getTime()
          );
        });

        destiVoyages.sort((a, b) => {
          // Extracting the time part of depart_time and splitting it into hours, minutes, and seconds
          const timeA = a.voyage.depart_time.split(":").map(Number);
          const timeB = b.voyage.depart_time.split(":").map(Number);
          // Comparing hours, if equal then comparing minutes, and if still equal then comparing seconds
          for (let i = 0; i < 3; i++) {
            if (timeA[i] !== timeB[i]) {
              return timeB[i] - timeA[i];
            }
          }
          return (
            new Date(b.voyage.departure_date).getTime() -
            new Date(a.voyage.departure_date).getTime()
          );
        });
      } else {
        departVoyages.sort((a, b) => {
          // Extracting the time part of depart_time and splitting it into hours, minutes, and seconds
          const timeA = a.voyage.depart_time.split(":").map(Number);
          const timeB = b.voyage.depart_time.split(":").map(Number);
          // Comparing hours, if equal then comparing minutes, and if still equal then comparing seconds
          for (let i = 0; i < 3; i++) {
            if (timeA[i] !== timeB[i]) {
              return timeA[i] - timeB[i];
            }
          }
          return (
            new Date(a.voyage.departure_date).getTime() -
            new Date(b.voyage.departure_date).getTime()
          );
        });

        destiVoyages.sort((a, b) => {
          // Extracting the time part of depart_time and splitting it into hours, minutes, and seconds
          const timeA = a.voyage.depart_time.split(":").map(Number);
          const timeB = b.voyage.depart_time.split(":").map(Number);
          // Comparing hours, if equal then comparing minutes, and if still equal then comparing seconds
          for (let i = 0; i < 3; i++) {
            if (timeA[i] !== timeB[i]) {
              return timeA[i] - timeB[i];
            }
          }
          return (
            new Date(a.voyage.departure_date).getTime() -
            new Date(b.voyage.departure_date).getTime()
          );
        });
      }

      // Only update state if sorted arrays are different from current states
      if (
        JSON.stringify(departVoyages) !== JSON.stringify(departVoyagesState)
      ) {
        setDepartVoyagesState(departVoyages);
      }
      if (
        JSON.stringify(destiVoyagesState) !== JSON.stringify(destiVoyagesState)
      ) {
        setDestiVoyagesState(destiVoyagesState);
      }
    },
    [departVoyagesState, destiVoyagesState]
  );

  const debounceSort = debounce(() => sortVoyages(sortState), 500);

  /**
   * Function used for filter voyages, return a new list voyages
   */
  const filterVoyages = useCallback(
    (voyages: VoyageItem[]) => {
      if (operatorSelected.length > 0) {
        const operator_ids = operatorSelected.map((operator) => operator.id);
        voyages = voyages.filter(
          (voyage) =>
            voyage.voyage.operator &&
            operator_ids.includes(voyage.voyage.operator.id)
        );
      }

      voyages = voyages.filter(
        (voyage) =>
          voyage.voyage.ticket_prices.default_ticket_price >=
            ticketPriceSelected.minPrice &&
          voyage.voyage.ticket_prices.default_ticket_price <=
            ticketPriceSelected.maxPrice
      );
      return voyages;
    },
    [
      operatorSelected,
      ticketPriceSelected.maxPrice,
      ticketPriceSelected.minPrice,
    ]
  );

  const debounceFilterVoyages = useCallback(
    (voyages: VoyageItem[]) => {
      const debounceFilterVoyages = debounce(filterVoyages, 500);
      return debounceFilterVoyages(voyages);
    },
    [filterVoyages]
  );

  // True if there is any filter in effect
  const isFiltering = useMemo(() => {
    return (
      operatorSelected.length > 0 ||
      ticketPriceRange.minPrice !== ticketPriceSelected.minPrice ||
      ticketPriceRange.maxPrice !== ticketPriceSelected.maxPrice
    );
  }, [
    operatorSelected.length,
    ticketPriceRange.maxPrice,
    ticketPriceRange.minPrice,
    ticketPriceSelected.maxPrice,
    ticketPriceSelected.minPrice,
  ]);

  // const dateList: {
  //   date: string;
  //   day: string;
  //   weekday: string;
  //   isCurrent: boolean;
  //   isDisable: boolean;
  // }[] = useMemo(() => {
  //   // Create an array to store the dates
  //   const dateList: {
  //     date: string;
  //     day: string;
  //     weekday: string;
  //     isCurrent: boolean;
  //     isDisable: boolean;
  //   }[] = [];

  //   let currentDate = new Date();
  //   const today = new Date();
  //   if (activeTab === "0" && dateForm) {
  //     currentDate = new Date(dateForm);
  //   }
  //   if (activeTab === "1" && dateTo) {
  //     currentDate = new Date(dateTo);
  //   }

  //   // Add 3 dates before the current date
  //   for (let i = 3; i > 0; i--) {
  //     const dateBefore = subDays(currentDate, i);
  //     dateList.push({
  //       date: format(dateBefore, "yyyy-MM-dd"),
  //       day: format(dateBefore, "dd"),
  //       weekday: filterTranslation(`${format(dateBefore, "EEEE")}`), // Full weekday name
  //       isCurrent: false,
  //       isDisable:
  //         activeTab === "0"
  //           ? !isAfter(dateBefore, subDays(today, 1))
  //           : !isAfter(dateBefore, subDays(today, 1)) ||
  //             isBefore(dateBefore, dateForm),
  //     });
  //   }

  //   // Add current date
  //   dateList.push({
  //     date: format(currentDate, "yyyy-MM-dd"),
  //     day: format(currentDate, "dd"),
  //     weekday: filterTranslation(`${format(currentDate, "EEEE")}`), // Full weekday name
  //     isCurrent: true,
  //     isDisable:
  //       activeTab === "0"
  //         ? !isAfter(currentDate, today)
  //         : !isAfter(currentDate, today) || !isAfter(currentDate, dateForm),
  //   });

  //   // Add 3 dates after the current date
  //   for (let i = 1; i <= 3; i++) {
  //     const dateAfter = addDays(currentDate, i);
  //     dateList.push({
  //       date: format(dateAfter, "yyyy-MM-dd"),
  //       day: format(dateAfter, "dd"),
  //       weekday: filterTranslation(`${format(dateAfter, "EEEE")}`), // Full weekday name
  //       isCurrent: false,
  //       isDisable:
  //         activeTab === "0"
  //           ? !isAfter(dateAfter, today)
  //           : !isAfter(dateAfter, today) || !isAfter(dateAfter, dateForm),
  //     });
  //   }

  //   return dateList;
  // }, [activeTab, dateForm, dateTo, filterTranslation]);

  const handleGoToTicketDetail = useCallback(
    (voyage: Voyage) => {
      // When user is at departure tab
      const queryParams: TicketDetailParams = {};
      if (activeTab === "0") {
        const ticketFormData: LocalSelectedTicketFormData = {
          selectedVoyages: {
            departVoyage: voyage,
            destiVoyage: destiSelectVoyage?.voyage,
          },
          numberOfPassengers,
        };
        queryParams.departVoyageId = voyage.clickBait
          ? `${voyage.clickBait.rootVoyageId}-CB`
          : voyage.id;
        queryParams.returnVoyageId = destiSelectVoyage?.voyage.clickBait
          ? `${destiSelectVoyage.voyage.clickBait.rootVoyageId}-CB`
          : destiSelectVoyage?.voyage.id;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            LocalFormKey.selectedTicketData,
            JSON.stringify(ticketFormData)
          );
        }
      } else {
        if (departSelectVoyage) {
          const ticketFormData: LocalSelectedTicketFormData = {
            selectedVoyages: {
              departVoyage: departSelectVoyage.voyage,
              destiVoyage: voyage,
            },
            numberOfPassengers,
          };
          queryParams.departVoyageId = departSelectVoyage.voyage.clickBait
            ? `${departSelectVoyage.voyage.clickBait.rootVoyageId}-CB`
            : departSelectVoyage?.voyage.id;
          queryParams.returnVoyageId = voyage.clickBait
            ? `${voyage.clickBait.rootVoyageId}-CB`
            : voyage.id;
          if (typeof window !== "undefined") {
            localStorage.setItem(
              LocalFormKey.selectedTicketData,
              JSON.stringify(ticketFormData)
            );
          }
        }
      }
      queryParams.numberOfPassengers = numberOfPassengers;

      // Create query path. Add a timestamp to trigger API fetch when click search button
      const path = `/ticket-detail?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;
      router.push(path);
    },
    [
      activeTab,
      departSelectVoyage,
      destiSelectVoyage,
      numberOfPassengers,
      router,
    ]
  );

  const handleDepartVoyageSelect = useCallback(
    (voyage: VoyageItem) => {
      // Set hash on url
      if (typeof window !== "undefined") {
        history.replaceState(
          null,
          "",
          `#${voyage.voyage.id}-${destiSelectVoyage?.voyage.id}`
        );
      }

      // Change tab to destination tab if has return date and user has not select return voyage yet
      if (initTo) {
        setDepartSelectVoyage(voyage);
        setActiveTab("1");
        scrollToTab();

        const request: VoyagesFindByLocationAndDate = {
          departure_id: initDestinationId,
          destination_id: initDepartureId,
          // no_remain: numberOfPassengers,
          departure_date: formatDate(new Date(), "yyyy-MM-dd"),
          limit: 50,
        };
        request.departure_date = formatDate(dateTo, "yyyy-MM-dd");
        setRequestDestiVoyages(request);
        if (destiVoyageRefetch) {
          destiVoyageRefetch();
        }
        // destiVoyageOperatorRefetch();
      } else {
        if (voyage) {
          handleGoToTicketDetail(voyage.voyage);
        }
        setDepartSelectVoyage(voyage);
      }
    },
    [
      dateTo,
      destiSelectVoyage?.voyage.id,
      destiVoyageRefetch,
      handleGoToTicketDetail,
      initDepartureId,
      initDestinationId,
      initTo,
      scrollToTab,
    ]
  );

  const handleDestiVoyageSelect = useCallback(
    (voyage: VoyageItem) => {
      if (typeof window !== "undefined") {
        history.replaceState(
          null,
          "",
          `#${departSelectVoyage?.voyage.id}-${voyage.voyage.id}`
        );
      }

      if (!departSelectVoyage) {
        setDestiSelectVoyage(voyage);
        setActiveTab("0");
        scrollToTab();
      } else {
        if (voyage) {
          handleGoToTicketDetail(voyage.voyage);
        }
        setDestiSelectVoyage(voyage);
      }
    },
    [departSelectVoyage, handleGoToTicketDetail, scrollToTab]
  );

  /**
   * Create UI for search result
   */
  const selectRouteTabs = useMemo(() => {
    const tabs: {
      tabContent: JSX.Element;
      tabTrigger: JSX.Element;
    }[] = [];
    debounceSort();
    // Create tab for depart voyage
    const tabTrigger = (
      <TabsTrigger
        key={0}
        value="0"
        className="h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        {filterTranslation("selectDeparture")}
      </TabsTrigger>
    );

    const disableRoutePage = disableRoutes?.find(
      (r) => r.routeId.toString() === routeSearch?.id.toString()
    );

    const tabContent = (
      <TabsContent
        key={0}
        value={"0"}
        forceMount
        hidden={"0" !== activeTab}
        className="w-full"
      >
        <VoyageTabContent
          ref={departVoyageTabContentRef}
          voyages={departVoyagesState}
          selectedVoyage={departSelectVoyage}
          isFiltering={isFiltering}
          isVoyageLoading={departVoyageLoading}
          debounceFilterVoyages={debounceFilterVoyages}
          onVoyageCardSelect={handleDepartVoyageSelect}
          isRouteEnabled={isRouteEnabled}
          disableRoute={disableRoutePage}
        />
      </TabsContent>
    );
    tabs.push({ tabTrigger, tabContent });

    if (hasReturn) {
      const tabTrigger = (
        <TabsTrigger
          key={1}
          value="1"
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {filterTranslation("selectDestination")}
        </TabsTrigger>
      );

      const tabContent = (
        <TabsContent
          key={1}
          value={"1"}
          forceMount
          hidden={"1" !== activeTab}
          className="w-full"
        >
          <VoyageTabContent
            ref={destiVoyageTabContentRef}
            voyages={destiVoyagesState}
            selectedVoyage={destiSelectVoyage}
            isFiltering={isFiltering}
            isVoyageLoading={destiVoyageLoading}
            debounceFilterVoyages={debounceFilterVoyages}
            onVoyageCardSelect={handleDestiVoyageSelect}
            isRouteEnabled={isRouteEnabled}
            disableRoute={disableRoutePage}
          />
        </TabsContent>
      );
      tabs.push({ tabTrigger, tabContent });
    }
    return tabs;
  }, [
    debounceSort,
    filterTranslation,
    disableRoutes,
    routeSearch,
    activeTab,
    departVoyagesState,
    departSelectVoyage,
    isFiltering,
    departVoyageLoading,
    debounceFilterVoyages,
    handleDepartVoyageSelect,
    isRouteEnabled,
    hasReturn,
    destiVoyagesState,
    destiSelectVoyage,
    destiVoyageLoading,
    handleDestiVoyageSelect,
  ]);

  const handleSearchAction = useCallback(
    async (date: string) => {
      if (activeTab === "1") {
        setRequestDestiVoyages({
          departure_id: initDestinationId,
          destination_id: initDepartureId,
          departure_date: formatDate(date, "yyyy-MM-dd") ?? "",
          limit: 50,
        });
        // if (destiVoyageRefetch) destiVoyageRefetch();
      } else {
        setRequestDepartVoyages({
          departure_id: initDepartureId,
          destination_id: initDestinationId,
          departure_date: formatDate(date, "yyyy-MM-dd") ?? "",
          limit: 50,
        });
        // if (departVoyageRefetch) departVoyageRefetch();
      }
    },
    [
      initDepartureId,
      initDestinationId,
      activeTab,
      // destiVoyageRefetch,
      // departVoyageRefetch,
    ]
  );

  const memoFilterSection = useMemo(() => {
    return (
      <FilterSection
        operatorSelected={operatorSelected}
        setOperatorSelected={setOperatorSelected}
        ticketPriceRange={ticketPriceRange}
        ticketPriceSelected={ticketPriceSelected}
        setTicketPriceSelected={setTicketPriceSelected}
        sortState={sortState}
        setSortState={setSortState}
        isFiltering={isFiltering}
        destiVoyagesState={destiVoyagesState}
        departVoyagesState={departVoyagesState}
        activeTab={activeTab}
      />
    );
  }, [
    activeTab,
    departVoyagesState,
    destiVoyagesState,
    isFiltering,
    operatorSelected,
    sortState,
    ticketPriceRange,
    ticketPriceSelected,
  ]);

  const memorizedSearchSection = useMemo(() => {
    return (
      <SearchTicketForm
        initRoutes={routes.length ? routes : undefined}
        initDepartureId={routeSearch?.departure_id}
        initDestinationId={routeSearch?.destination_id}
        initFromTo={
          initFrom
            ? {
                from: initFrom ? new Date(initFrom) : undefined,
                to: initTo ? new Date(initTo) : undefined,
              }
            : undefined
        }
        initPassengers={numberOfPassengers?.toString()}
      />
    );
  }, [initFrom, initTo, numberOfPassengers, routeSearch, routes]);

  return (
    <>
      <div className="mb-4 flex w-full justify-center">
        <BookingStep currentStep={1} className="max-w-[500px]" />
      </div>

      <div className="w-full max-w-full rounded-lg bg-background p-2 shadow-md lg:mb-6 lg:flex lg:justify-center lg:p-8">
        {memorizedSearchSection}
      </div>
      <div className={cn(`lg:pd-0 w-full pb-16`, className)}>
        <div className="col-span-12 flex flex-col gap-2 lg:col-span-3">
          <div className="hidden rounded-md border bg-background shadow-sm lg:block">
            <div className="flex items-center justify-between p-4">
              <h2 className="pt-0 text-base font-semibold">Bản đồ</h2>
              <Button
                size="icon"
                onClick={handleFerryMapOpen}
                className="h-7 w-7 bg-primary-100 text-black hover:text-white"
              >
                <GrExpand className="h-4 w-4" />
              </Button>
            </div>

            <hr />
            <FerryMap
              className="z-10 rounded-bl-md rounded-br-md"
              classNameTooltip="z-20"
              selectedRoute={routeSearch}
              locations={locations}
            />
          </div>

          {memoFilterSection}
        </div>
        <div className="col-span-12 flex flex-col gap-2 lg:col-span-9">
          <div
            id={HtmlToImageSectionCaptureId.VOYAGE_SCHEDULES}
            className="bg-default-200"
          >
            <Tabs
              defaultValue="0"
              onValueChange={setActiveTab}
              value={activeTab}
              className="flex w-full flex-col items-center justify-center gap-4"
            >
              <div className="flex w-full items-center justify-between">
                <TabsList className="flex w-full flex-row gap-1 bg-background text-foreground md:w-auto md:flex-none">
                  {selectRouteTabs.map((tab) => tab.tabTrigger)}
                </TabsList>

                <HtmlToImage
                  captureId={HtmlToImageSectionCaptureId.VOYAGE_SCHEDULES}
                  captureButtonName="Lịch tàu"
                  sectionCapture={
                    isMobile ? "voyages-schedules-mobile" : "voyages-schedules"
                  }
                />
              </div>

              <div className="flex w-full snap-x snap-mandatory justify-center overflow-scroll lg:overflow-auto">
                <div className="grid w-full min-w-[720px] grid-cols-7 gap-2 md:min-w-min">
                  {dateList.map((date) => (
                    <div
                      key={date.day}
                      onClick={() => {
                        if (!date.isDisable) {
                          if (activeTab === "0") {
                            if (dateTo && !isBefore(date.date, dateTo)) {
                              hasManuallyChangedDate.current.depart = true;
                              setDateFrom(date.date);
                              setDateTo(date.date);
                            } else {
                              setDateFrom(date.date);
                            }
                          } else {
                            hasManuallyChangedDate.current.return = true;
                            setDateTo(date.date);
                          }
                          handleSearchAction(date.date);
                        }
                      }}
                      className={cn(
                        `flex snap-center flex-col items-center justify-center gap-0 rounded-md border-1 p-1 shadow-sm transition-colors duration-200 ease-in-out`,
                        date.isDisable
                          ? "border-1 border-white bg-default-400"
                          : "cursor-pointer bg-background hover:border-primary",
                        date.isCurrent
                          ? "border-primary bg-primary"
                          : "border-default-50"
                      )}
                    >
                      <div
                        className={cn(
                          `text-sm font-medium text-primary transition-colors duration-200 ease-in-out lg:text-base`,
                          date.isCurrent && "text-primary-foreground"
                        )}
                      >
                        {date.weekday}
                      </div>
                      <div
                        className={cn(
                          `text-xs font-normal text-black transition-colors duration-200 ease-in-out dark:text-white lg:text-sm`,
                          date.isCurrent && "text-primary-foreground"
                        )}
                      >
                        {format(date.date, "dd/MM")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectRouteTabs.map((tab) => tab.tabContent)}
            </Tabs>
          </div>
        </div>
        <Button
          className={cn(
            "fixed bottom-44 right-4 z-20 mx-auto flex h-9 w-9 flex-row items-center justify-center gap-1 rounded-lg bg-primary-100 p-2 lg:hidden"
          )}
          onClick={handleFerryMapOpen}
        >
          <CiMap className="h-6 w-6 text-primary-800" />
        </Button>
      </div>
      <FerryRouteMapDialog
        open={openFerryMapDialog}
        handleClose={handleFerryMapClose}
        selectedRoute={routeSearch}
      />
    </>
  );
};

export default memo(Search);
