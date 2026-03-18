"use client";

import { Operator } from "@/services/apis/operators/types/operator";
import { Route } from "@/services/apis/routes/types/route";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  Key,
} from "react";
import type { ToolbarProps } from "react-big-calendar";
import { Event } from "../type/ferry-big-calendar-type";
import { IoIosArrowForward, IoIosCheckmark, IoIosSearch } from "react-icons/io";
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
import { Button } from "@/components/ui/button";
import { MdExpandMore } from "react-icons/md";
import { VoyagesFindAllRelateByLocationAndDateRange } from "@/services/apis/voyages/types/voyage-queries";
import { BigCalendarLocalStorageKey } from "../enum/local-storage";
import { Spinner, Tab, Tabs } from "@heroui/react";
import { OperatorCodeFilterEnum } from "../enum/filter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface FerryToolbarProps extends ToolbarProps<Event> {
  routes: Route[];
  operators: Operator[];
  requestQueryVoyage: VoyagesFindAllRelateByLocationAndDateRange;
  setRequestQueryVoyages: (
    request: VoyagesFindAllRelateByLocationAndDateRange
  ) => void;
  voyagesLoading: boolean;
  isDefaultVoyageRequest: boolean;
  setIsDefaultVoyageRequest: Dispatch<SetStateAction<boolean>>;

  isDefaultOperatorRequest: boolean;
  setIsDefaultOperatorRequest: Dispatch<SetStateAction<boolean>>;
}

const FerryBigCalendarToolBar: React.FC<FerryToolbarProps> = ({
  routes,
  operators,
  label,
  onNavigate,
  requestQueryVoyage,
  setRequestQueryVoyages,
  voyagesLoading,
  isDefaultVoyageRequest,
  setIsDefaultVoyageRequest,
  isDefaultOperatorRequest,
  setIsDefaultOperatorRequest,
}) => {
  /**
   * Define state
   */
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  /**
   * Route Filter: State
   */
  const [sortedRoutes, setSortedRoutes] = useState<Route[]>();
  const [selectedRoute, setSelectedRoute] = useState<Route>();
  const [selectedRouteId, setSelectedRouteId] = useState<string>();

  /**
   * Operator Filter: State
   */
  const [activeTab, setActiveTab] = useState<string>(
    OperatorCodeFilterEnum.ALL_OPERATOR
  );

  /**
   * Handle logic
   */

  /**
   * Handles setting the default route based on the current context.
   *
   * - If `isDefaultVoyageRequest` is false, the function retrieves the default route
   *   from localStorage using a predefined key (`BigCalendarLocalStorageKey.SELECTED_ROUTE`),
   *   parses it, and sets it as the selected route.
   *
   * - If `isDefaultVoyageRequest` is true, the function searches the `routes` array
   *   for a route with an ID matching the value of the environment variable
   *   `NEXT_PUBLIC_DEFAULT_ROUTE`, and sets it as the selected route.
   *
   * Notes:
   * - Assumes `localStorage` contains valid JSON for the selected route key.
   * - Ensure `NEXT_PUBLIC_DEFAULT_ROUTE` is set and corresponds to a valid route ID.
   */
  const handleGetDefaultRoute = useCallback(() => {
    if (!isDefaultVoyageRequest) {
      const defaultRoute: string | null = localStorage.getItem(
        BigCalendarLocalStorageKey.SELECTED_ROUTE
      );
      if (defaultRoute) {
        setSelectedRoute(JSON.parse(defaultRoute));
      }
    } else {
      const defaultRoute = routes.find((route) => route.id === 22);
      setSelectedRoute(defaultRoute);
    }
  }, [isDefaultVoyageRequest, routes]);

  /**
   * A callback function to sort the list of routes based on the departure location name
   * and update the state with the sorted array.
   *
   * @returns {void} This function does not return a value. It updates the sorted routes state.
   *
   */
  const handleSortedRoutes = useCallback(() => {
    if (!routes.length) {
      setSortedRoutes([]);
    }
    const sortedArr = routes.sort((a, b) =>
      a.departure_name.localeCompare(b.departure_name)
    );
    setSortedRoutes(sortedArr);
  }, [routes]);

  /**
   * A callback function to handle the selection of a route. This function processes the selected route,
   * updates the local storage, modifies the request payload, and sets related application state.
   *
   * @param {string} route - A stringified JSON object representing the selected route.
   * The object should conform to the `Route` interface.
   *
   * @returns {void} This function does not return a value. It updates the application state and local storage.
   *
   */
  const handleSelectedRoute = useCallback(
    (route: string) => {
      const jsonData: Route = JSON.parse(route);
      if (jsonData) {
        // Prevent re-render to lost selected data
        localStorage.setItem(BigCalendarLocalStorageKey.SELECTED_ROUTE, route);

        // Get operator if has
        const operatorId: string =
          localStorage.getItem(BigCalendarLocalStorageKey.SELECTED_OPERATOR) ??
          OperatorCodeFilterEnum.ALL_OPERATOR;

        const routeId: string = jsonData.id.toString();
        setSelectedRouteId(routeId);
        const currentRoute = routes.find((route) => route.id === jsonData.id);
        if (!currentRoute?.disable) {
          if (operatorId === OperatorCodeFilterEnum.ALL_OPERATOR) {
            const requestPayload: VoyagesFindAllRelateByLocationAndDateRange = {
              departure_id: jsonData.departure_id,
              destination_id: jsonData.destination_id,
              from: requestQueryVoyage.from,
              to: requestQueryVoyage.to,
              limit: 50,
              filter: {},
            };
            setRequestQueryVoyages(requestPayload);
          } else {
            // Change request payload
            const requestPayload: VoyagesFindAllRelateByLocationAndDateRange = {
              departure_id: jsonData.departure_id,
              destination_id: jsonData.destination_id,
              from: requestQueryVoyage.from,
              to: requestQueryVoyage.to,
              limit: 50,
              filter: {
                operator_ids: [operatorId],
              },
            };
            setRequestQueryVoyages(requestPayload);
          }
        } else {
          toast.error("Tuyến này chưa hoạt động lại, vui lòng chọn tuyến khác");
        }
      }
      setIsDefaultVoyageRequest(false);
    },
    [
      requestQueryVoyage.from,
      requestQueryVoyage.to,
      routes,
      setIsDefaultVoyageRequest,
      setRequestQueryVoyages,
    ]
  );

  /**
   * Operator filter logic
   */

  const handleOperatorSelection = useCallback(
    (key: Key) => {
      if (key === OperatorCodeFilterEnum.ALL_OPERATOR) {
        const payload: VoyagesFindAllRelateByLocationAndDateRange = {
          departure_id: requestQueryVoyage.departure_id,
          destination_id: requestQueryVoyage.destination_id,
          from: requestQueryVoyage.from,
          to: requestQueryVoyage.to,
          filter: {},
          limit: 50,
        };

        setRequestQueryVoyages(payload);

        localStorage.setItem(
          BigCalendarLocalStorageKey.SELECTED_OPERATOR,
          OperatorCodeFilterEnum.ALL_OPERATOR
        );
      } else {
        const operatorId: string = key.toString();
        const payload: VoyagesFindAllRelateByLocationAndDateRange = {
          departure_id: requestQueryVoyage.departure_id,
          destination_id: requestQueryVoyage.destination_id,
          from: requestQueryVoyage.from,
          to: requestQueryVoyage.to,
          filter: {
            operator_ids: [operatorId],
          },
          limit: 50,
        };
        setRequestQueryVoyages(payload);
        localStorage.setItem(
          BigCalendarLocalStorageKey.SELECTED_OPERATOR,
          operatorId
        );
      }
      setIsDefaultOperatorRequest(false);
    },
    [
      requestQueryVoyage.departure_id,
      requestQueryVoyage.destination_id,
      requestQueryVoyage.from,
      requestQueryVoyage.to,
      setIsDefaultOperatorRequest,
      setRequestQueryVoyages,
    ]
  );

  const handleGetActiveTab = useCallback(() => {
    if (!isDefaultOperatorRequest) {
      const tabKey: string =
        localStorage.getItem(BigCalendarLocalStorageKey.SELECTED_OPERATOR) ??
        "";
      setActiveTab(tabKey);
    } else {
      setActiveTab(OperatorCodeFilterEnum.ALL_OPERATOR);
    }
  }, [isDefaultOperatorRequest]);

  /**
   * Big calendar basic toolbar logic
   */
  const goToNext = useCallback(() => {
    onNavigate("NEXT");
  }, [onNavigate]);

  const moveToToday = useCallback(() => {
    onNavigate("TODAY");
  }, [onNavigate]);

  /**
   * Handle effect
   */
  useEffect(() => {
    handleSortedRoutes();
    handleGetDefaultRoute();
  }, [handleGetDefaultRoute, handleSortedRoutes]);

  useEffect(() => {
    handleGetActiveTab();
  }, [handleGetActiveTab]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Big calendar toolbar */}
      <div className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
        <div className="flex w-full items-center justify-between gap-4 md:justify-start">
          <div className="flex gap-2">
            <Button color="default" onClick={moveToToday}>
              Hôm nay
            </Button>
            <Button color="default" onClick={goToNext}>
              <IoIosArrowForward size={16} />
            </Button>
          </div>

          <div className="text-base capitalize">{label}</div>
        </div>

        <div className="flex w-full justify-end gap-2">
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-4">
                {voyagesLoading && <Spinner color="primary" size="sm" />}
                <Button
                  variant="outline"
                  role="combobox"
                  className="flex w-72 items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap"
                  aria-label="Filter by route"
                >
                  <div className="flex gap-1 truncate text-sm font-normal">
                    <IoIosSearch className="mr-2 h-5 w-5 shrink-0" />
                    <div className="text-sm">
                      {selectedRoute
                        ? `${selectedRoute.departure_name} → ${selectedRoute.destination_name}`
                        : "Tìm tuyến tàu"}
                    </div>
                  </div>

                  <MdExpandMore className="ml-2 h-6 w-6 shrink-0" />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Tìm tuyến..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy tuyến.</CommandEmpty>
                  <CommandGroup>
                    {sortedRoutes?.map((route) => (
                      <CommandItem
                        key={route?.id}
                        value={JSON.stringify(route)}
                        onSelect={handleSelectedRoute}
                      >
                        <IoIosCheckmark
                          className={`mr-2 h-4 w-4 ${
                            (selectedRouteId ? selectedRouteId : "") ===
                            route.id.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {`${route?.departure_name} - ${route?.destination_name}`}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {operators && (
        <div className="flex w-full flex-col">
          <Tabs
            aria-label="Operators"
            size="sm"
            color="primary"
            variant="bordered"
            selectedKey={activeTab}
            // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
            onSelectionChange={(key) => handleOperatorSelection(key)}
          >
            <Tab key={OperatorCodeFilterEnum.ALL_OPERATOR} title={"Tất cả"} />
            {
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              operators.map((operator) => (
                <Tab
                  key={operator.id}
                  title={
                    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={operator?.operator_logo?.path} />
                        <AvatarFallback>#</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">{operator.operator_name}</div>
                    </div>
                  }
                />
              ))
            }
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default memo(FerryBigCalendarToolBar);
