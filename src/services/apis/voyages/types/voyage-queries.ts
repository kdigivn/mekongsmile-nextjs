import { Voyage } from "./voyage";
import { Location } from "../../locations/types/location";

export type FilterVoyageByLocation = {
  min_depart_time?: string;
  max_depart_time?: string;
  boat_name?: string;
  operator_ids?: string[];
};

export type VoyagesFindByLocationAndDate = {
  departure_date: Voyage["departure_date"];
  departure_id?: Location["id"];
  destination_id: Location["id"];
  cursor?: string;
  limit: number;
  filter?: FilterVoyageByLocation;
};

export type VoyageURLParams = Omit<
  VoyagesFindByLocationAndDate,
  "cursor" | "limit" | "filter"
>;

export type VoyagesFindAllRelateByLocationAndDateRange = {
  departure_id?: Location["id"];
  destination_id: Location["id"];
  cursor?: string;
  limit: number;
  filter: FilterVoyageByLocation;
  from?: string;
  to?: string;
};

export type AllRelateVoyageURLParams = Omit<
  VoyagesFindAllRelateByLocationAndDateRange,
  "cursor" | "limit" | "filter"
>;

export type VoyagesCountFilter = {
  depart_date_from?: string;
  depart_date_to?: string;
  route_id?: number;
  departure_id?: string;
  destination_id?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
};
