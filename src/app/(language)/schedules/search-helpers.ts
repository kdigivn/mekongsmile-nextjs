import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import { parse } from "date-fns";

export const checkVoyageValid = (voyage: Voyage): boolean => {
  const today = new Date();
  const departureDateTime = new Date(
    `${voyage.departure_date}T${voyage.depart_time}`
  );

  if (today > departureDateTime) {
    return false;
  }
  return !voyage.disable && voyage.no_remain > 0;
};

/**
 * Parse time string and return time in millisecond
 * @param timeString Time string
 * @returns
 */
export const parseTime = (timeString: string) =>
  parse(timeString, "HH:mm:ss", new Date().getTime()).getTime();

type ConfigOptions = {
  filterDisable?: boolean;
  filterRemaining?: boolean;
  sortEnable?: boolean;
};

/**
 * Filter voyages that meet the min number of passengers & also sort voyages by depart time ascending
 * @param voyages Voyage to be formatted
 * @param options Config Options.
 *
 * Default: `filterDisable=true`
 * @returns
 */
export const formatVoyages = (
  voyages: VoyageItem[],
  options?: ConfigOptions
) => {
  const defaultConfigs: ConfigOptions = {
    filterDisable: true,
    sortEnable: true,
  };

  const newConfigs = {
    ...defaultConfigs,
    ...options,
  };

  const filteredVoyages = voyages.filter((voyage) => {
    // Filter based on the filterDisable option
    if (newConfigs.filterDisable && voyage?.voyage?.disable) {
      return false;
    }
    // Filter based on the filterRemaining option (example: minimum available seats)
    if (
      newConfigs.filterRemaining &&
      (voyage?.voyage.no_remain === undefined || voyage?.voyage.no_remain <= 0)
    ) {
      return false;
    }

    return checkVoyageValid(voyage?.voyage);
  });

  if (newConfigs.sortEnable) {
    return filteredVoyages.sort(
      (voyageA, voyageB) =>
        parseTime(voyageA.voyage.depart_time) -
        parseTime(voyageB.voyage.depart_time)
    );
  }

  return filteredVoyages;
};
