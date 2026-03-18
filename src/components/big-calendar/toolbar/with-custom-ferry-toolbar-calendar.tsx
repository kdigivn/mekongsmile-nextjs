import { Operator } from "@/services/apis/operators/types/operator";
import { Route } from "@/services/apis/routes/types/route";
import FerryBigCalendarToolbar from "./ferry-big-calendar-toolbar";
import { ToolbarProps } from "react-big-calendar";
import { Event } from "../type/ferry-big-calendar-type";
import { VoyagesFindAllRelateByLocationAndDateRange } from "@/services/apis/voyages/types/voyage-queries";
import { Dispatch, SetStateAction } from "react";

/**
 * A higher-order function that generates a custom toolbar component for the React Big Calendar.
 * This toolbar integrates dynamic functionality and interactions related to ferry scheduling
 * and operator management by wrapping the `FerryBigCalendarToolbar` component.
 *
 * @param {Route[]} routes - An array of route objects representing the available ferry routes.
 * @param {Operator[]} operators - An array of operator objects representing the ferry operators.
 * @param {VoyagesFindAllRelateByLocationAndDateRange} requestQueryVoyage - The query object containing parameters
 * for retrieving voyages based on related locations and a date range.
 * @param {Dispatch<SetStateAction<VoyagesFindAllRelateByLocationAndDateRange>>} setRequestQueryVoyages - A state setter
 * to update the voyage query object dynamically.
 * @param {boolean} voyagesLoading - A flag indicating whether voyage data is currently loading.
 * @param {boolean} isDefaultVoyageRequest - A flag to track whether the voyage query is in its default state.
 * @param {Dispatch<SetStateAction<boolean>>} setIsDefaultVoyageRequest - A state setter to update the default voyage request flag.
 * @param {boolean} isDefaultOperatorRequest - A flag to track whether the operator query is in its default state.
 * @param {Dispatch<SetStateAction<boolean>>} setIsDefaultOperatorRequest - A state setter to update the default operator request flag.
 * @returns {React.FC<ToolbarProps<Event, object>>} A React functional component that serves as a custom toolbar
 * for the React Big Calendar, preconfigured with the provided parameters for enhanced functionality.
 *
 * ### Usage:
 * Use the generated toolbar component in the `components.toolbar` property of the `react-big-calendar` Calendar:
 *
 * ```tsx
 * const components = {
 *   toolbar: withCustomFerryToolbarCalendar(
 *     routes,
 *     operators,
 *     requestQueryVoyage,
 *     setRequestQueryVoyages,
 *     voyagesLoading,
 *     isDefaultVoyageRequest,
 *     setIsDefaultVoyageRequest,
 *     isDefaultOperatorRequest,
 *     setIsDefaultOperatorRequest
 *   ),
 * };
 *
 * <Calendar components={components} />;
 * ```
 *
 * ### Notes:
 * - The returned component wraps the `FerryBigCalendarToolbar` and injects additional props, making it highly dynamic and reusable.
 * - The `displayName` of the returned component is set to `"FerryBigCalendarToolBarWrapper"` for easier debugging and identification.
 * - This wrapper simplifies the integration of ferry-related data and state management into the calendar toolbar.
 */
const withCustomFerryToolbarCalendar = (
  routes: Route[],
  operators: Operator[],
  requestQueryVoyage: VoyagesFindAllRelateByLocationAndDateRange,
  setRequestQueryVoyages: (
    request: VoyagesFindAllRelateByLocationAndDateRange
  ) => void,
  voyagesLoading: boolean,
  isDefaultVoyageRequest: boolean,
  setIsDefaultVoyageRequest: Dispatch<SetStateAction<boolean>>,
  isDefaultOperatorRequest: boolean,
  setIsDefaultOperatorRequest: Dispatch<SetStateAction<boolean>>
) => {
  const Component = (props: ToolbarProps<Event, object>) => (
    <FerryBigCalendarToolbar
      {...props}
      routes={routes}
      operators={operators}
      requestQueryVoyage={requestQueryVoyage}
      setRequestQueryVoyages={setRequestQueryVoyages}
      voyagesLoading={voyagesLoading}
      isDefaultVoyageRequest={isDefaultVoyageRequest}
      setIsDefaultVoyageRequest={setIsDefaultVoyageRequest}
      isDefaultOperatorRequest={isDefaultOperatorRequest}
      setIsDefaultOperatorRequest={setIsDefaultOperatorRequest}
    />
  );
  Component.displayName = "FerryBigCalendarToolBarWrapper";
  return Component;
};

export default withCustomFerryToolbarCalendar;
