"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { VoyagesFindAllRelateByLocationAndDateRange } from "@/services/apis/voyages/types/voyage-queries";
import { useVoyagesFindByLocationAndDateRangeQueryCursor } from "@/services/apis/voyages/voyages.service";
import React, {
  memo,
  useMemo,
  useEffect,
  useState,
  useCallback,
  startTransition,
} from "react";
import {
  Calendar,
  Components,
  dateFnsLocalizer,
  EventPropGetter,
  NavigateAction,
  View,
  Views,
} from "react-big-calendar";
import { Event } from "./type/ferry-big-calendar-type";
import FerryBigCalendarEvent from "./ferry-big-calendar-event";
import FerryBigCalendarShowMore from "./ferry-big-calendar-show-more";
import { Operator } from "@/services/apis/operators/types/operator";
import { Route } from "@/services/apis/routes/types/route";
import withCustomFerryToolbarCalendar from "./toolbar/with-custom-ferry-toolbar-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import {
  BigCalendarOperatorColor,
  OperatorColorCalendar,
} from "./enum/calendar-color";
import { BigCalendarLocalStorageKey } from "./enum/local-storage";
import FerryBigCalendarEventDialog from "./ferry-big-calendar-event-dialog";
import { OperatorCodeFilterEnum } from "./enum/filter";
import vi from "date-fns/locale/vi";
import { formatVoyages } from "@/app/(language)/schedules/search-helpers";

// Setting up the localizer by providing the moment (or globalize) object to the correct localizer.
const locales = {
  vi: vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  today: "Hôm nay",
  previous: "Trước",
  next: "Sau",
  month: "Tháng",
  week: "Tuần",
  day: "Ngày",
  agenda: "Lịch trình",
  date: "Ngày",
  time: "Thời gian",
  event: "Sự kiện",
  allDay: "Cả ngày",
  noEventsInRange: "Không có sự kiện nào trong khoảng này.",
};

type Props = {
  routes: Route[];
  operators: Operator[];
  operatorId?: string;
  routeId: number;
};

const FerryBigCalendar = ({
  routes,
  operators,
  operatorId,
  routeId,
}: Props) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isDefaultVoyageRequest, setIsDefaultVoyageRequest] =
    useState<boolean>(true);
  const [isDefaultOperatorRequest, setIsDefaultOperatorRequest] =
    useState<boolean>(true);

  /**
   * Process default payload
   */
  const today = new Date();
  const firstDayOfMonth: string = format(today, "yyyy-MM-dd");
  const lastDayOfMonth: string = format(
    new Date(today.getFullYear(), today.getMonth() + 1, 0),
    "yyyy-MM-dd"
  );

  const defaultRoute = routes.find((route) => route.id === routeId);
  const [isRouteEnabled, setIsRouteEnabled] = useState<boolean>(
    defaultRoute?.disable !== undefined ? !defaultRoute.disable : false
  );

  const defaultRequestVoyagePayload: VoyagesFindAllRelateByLocationAndDateRange =
    {
      departure_id: defaultRoute?.departure_id ?? "",
      destination_id: defaultRoute?.destination_id ?? "",
      from: firstDayOfMonth,
      to: lastDayOfMonth,
      limit: 50,
      filter: {},
    };

  const [requestQueryVoyage, setRequestQueryVoyages] =
    useState<VoyagesFindAllRelateByLocationAndDateRange>(
      defaultRequestVoyagePayload
    );

  /**
   * Memorized variables
   */
  const memorizedCalendarStyle = useMemo(() => ({ height: 700 }), []);
  const calendarViews: View[] = useMemo(() => ["month"], []);

  /**
   * Fetching data
   */
  const {
    voyages,
    voyagesLoading,
    voyagesIsFetching,
    voyagesFetchNextPage,
    voyagesHasNextPage,
  } = useVoyagesFindByLocationAndDateRangeQueryCursor(
    requestQueryVoyage,
    isRouteEnabled,
    useMemo(
      () => ({
        cache: "no-store",
      }),
      []
    )
  );

  useEffect(() => {
    if (!voyagesIsFetching && voyagesHasNextPage) {
      voyagesFetchNextPage();
    }
  }, [voyagesFetchNextPage, voyagesHasNextPage, voyagesIsFetching]);

  /**
   * Big Calendar: Handle set up
   */
  const customFormats = useMemo(
    () => ({
      weekdayFormat: (date: Date) => {
        const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        return dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
      },
    }),
    []
  );

  const handleSetRequestQueryVoyages = useCallback(
    (request: VoyagesFindAllRelateByLocationAndDateRange) => {
      setRequestQueryVoyages(request);
      const route = routes.find(
        (r) =>
          r.departure_id === request.departure_id &&
          r.destination_id === request.destination_id
      );
      setIsRouteEnabled(route !== undefined ? !route.disable : false);
    },
    [routes]
  );

  const handleOnChangeView = useCallback((selectedView: View) => {
    setView(selectedView);
  }, []);

  const handleNavigate = useCallback(
    (newDate: Date, _: View, navigateAction: NavigateAction) => {
      let firstDay: string = "";
      let lastDay: string = "";

      let navDate: Date = newDate;

      if (navigateAction === "TODAY") {
        const today = new Date();
        const firstDayOfMonth: string = format(today, "yyyy-MM-dd");
        const lastDayOfMonth: string = format(
          new Date(today.getFullYear(), today.getMonth() + 1, 0),
          "yyyy-MM-dd"
        );
        firstDay = firstDayOfMonth;
        lastDay = lastDayOfMonth;
      } else {
        navDate = new Date(newDate);
        navDate.setDate(1);
        const firstDayOfMonth: string = format(navDate, "yyyy-MM-dd");
        const lastDayOfMonth: string = format(
          new Date(navDate.getFullYear(), navDate.getMonth() + 1, 0),
          "yyyy-MM-dd"
        );
        firstDay = firstDayOfMonth;
        lastDay = lastDayOfMonth;
      }

      const operatorId: string =
        localStorage.getItem(BigCalendarLocalStorageKey.SELECTED_OPERATOR) ??
        OperatorCodeFilterEnum.ALL_OPERATOR;

      if (operatorId === OperatorCodeFilterEnum.ALL_OPERATOR) {
        const request: VoyagesFindAllRelateByLocationAndDateRange = {
          departure_id: requestQueryVoyage.departure_id,
          destination_id: requestQueryVoyage.destination_id,
          from: firstDay,
          to: lastDay,
          filter: {},
          limit: 50,
        };
        startTransition(() => {
          handleSetRequestQueryVoyages(request);
          setDate(navDate);
        });
      } else {
        const request: VoyagesFindAllRelateByLocationAndDateRange = {
          departure_id: requestQueryVoyage.departure_id,
          destination_id: requestQueryVoyage.destination_id,
          from: firstDay,
          to: lastDay,
          filter: {
            operator_ids: [operatorId],
          },
          limit: 50,
        };
        startTransition(() => {
          handleSetRequestQueryVoyages(request);
          setDate(navDate);
        });
      }

      return;
    },
    [
      handleSetRequestQueryVoyages,
      requestQueryVoyage.departure_id,
      requestQueryVoyage.destination_id,
    ]
  );

  const handleEventsData = useCallback(() => {
    if (!voyagesIsFetching) {
      const records: Event[] = [];

      formatVoyages(voyages).forEach((data) => {
        const startTime: string = `${data?.voyage.departure_date} ${data?.voyage.depart_time}`;
        const operatorCode: string =
          data.voyage.operator?.operator_code ?? "default";

        // Get color base on operator
        const getOperatorColor: OperatorColorCalendar =
          operatorCode in BigCalendarOperatorColor
            ? BigCalendarOperatorColor[
                operatorCode as keyof typeof BigCalendarOperatorColor
              ]
            : BigCalendarOperatorColor.default;

        // Collect event data
        const field: Event = {
          start: startTime ? new Date(startTime) : undefined,
          end: startTime ? new Date(startTime) : undefined,
          voyageItem: data,
          colorEvento: getOperatorColor.colorEvento,
          color: getOperatorColor.color,
        };
        records.push(field);
      });

      setEvents(records);
    }
  }, [voyages, voyagesIsFetching]);

  const handleSelectEvent = useCallback((event: Event) => {
    setDialogOpen(true);
    setSelectedEvent(event);
  }, []);

  // For change event color
  const handleEventPropGetter: EventPropGetter<Event> = useCallback(
    (event: Event) => {
      const bgColor = event.colorEvento ? event.colorEvento : "blue";
      const textColor = event.color ? event.color : "white";

      return {
        style: {
          background: bgColor,
          color: textColor,
        },
      };
    },
    []
  );

  const handleDefaultVoyageRequestPayload = useCallback(() => {
    if (routeId) {
      const defaultRoute: Route | undefined = routes.find(
        (route) => route.id.toString() === routeId.toString()
      );

      if (defaultRoute) {
        localStorage.setItem(
          BigCalendarLocalStorageKey.SELECTED_ROUTE,
          JSON.stringify(defaultRoute)
        );
        const defaultRequestVoyagePayload: VoyagesFindAllRelateByLocationAndDateRange =
          {
            departure_id: defaultRoute?.departure_id ?? "",
            destination_id: defaultRoute?.destination_id ?? "",
            from: firstDayOfMonth,
            to: lastDayOfMonth,
            filter: {},
            limit: 50,
          };
        setIsDefaultVoyageRequest(false);
        handleSetRequestQueryVoyages(defaultRequestVoyagePayload);
      }
    }

    if (isDefaultVoyageRequest) {
      localStorage.removeItem(BigCalendarLocalStorageKey.SELECTED_ROUTE);
    }
  }, [
    firstDayOfMonth,
    handleSetRequestQueryVoyages,
    isDefaultVoyageRequest,
    lastDayOfMonth,
    routeId,
    routes,
  ]);

  const handleDefaultOperatorRequestPayload = useCallback(() => {
    if (operatorId) {
      localStorage.setItem(
        BigCalendarLocalStorageKey.SELECTED_OPERATOR,
        operatorId
      );
      const defaultRequestVoyagePayload: VoyagesFindAllRelateByLocationAndDateRange =
        {
          departure_id: defaultRoute?.departure_id ?? "",
          destination_id: defaultRoute?.destination_id ?? "",
          from: firstDayOfMonth,
          to: lastDayOfMonth,
          filter: {
            operator_ids: [operatorId],
          },
          limit: 50,
        };
      setIsDefaultOperatorRequest(false);
      handleSetRequestQueryVoyages(defaultRequestVoyagePayload);
    }

    if (isDefaultOperatorRequest) {
      localStorage.removeItem(BigCalendarLocalStorageKey.SELECTED_OPERATOR);
    }
  }, [
    defaultRoute?.departure_id,
    defaultRoute?.destination_id,
    firstDayOfMonth,
    handleSetRequestQueryVoyages,
    isDefaultOperatorRequest,
    lastDayOfMonth,
    operatorId,
  ]);

  /**
   * Handle custom component react big calendar
   */
  const components: Components<Event, object> | undefined = useMemo(
    () => ({
      event: FerryBigCalendarEvent,
      showMore: FerryBigCalendarShowMore,
      toolbar: withCustomFerryToolbarCalendar(
        routes,
        operators,
        requestQueryVoyage,
        handleSetRequestQueryVoyages,
        voyagesLoading,
        isDefaultVoyageRequest,
        setIsDefaultVoyageRequest,
        isDefaultOperatorRequest,
        setIsDefaultOperatorRequest
      ),
    }),
    [
      handleSetRequestQueryVoyages,
      isDefaultOperatorRequest,
      isDefaultVoyageRequest,
      operators,
      requestQueryVoyage,
      routes,
      voyagesLoading,
    ]
  );

  /**
   * Handle effect
   */
  useEffect(() => {
    handleEventsData();
  }, [handleEventsData]);

  useEffect(() => {
    handleDefaultVoyageRequestPayload();
  }, [handleDefaultVoyageRequestPayload]);

  useEffect(() => {
    handleDefaultOperatorRequestPayload();
  }, [handleDefaultOperatorRequestPayload]);

  return (
    <>
      <Calendar
        culture="vi"
        localizer={localizer}
        events={events}
        views={calendarViews}
        defaultView="month"
        view={view}
        style={memorizedCalendarStyle}
        onView={handleOnChangeView}
        date={date}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        components={components}
        eventPropGetter={handleEventPropGetter}
        messages={messages}
        formats={customFormats}
      />

      {selectedEvent && (
        <FerryBigCalendarEventDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          voyageItem={selectedEvent.voyageItem}
        />
      )}
    </>
  );
};

export default memo(FerryBigCalendar);
