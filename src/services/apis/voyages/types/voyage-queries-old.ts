import { SortEnum } from "../../common/types/sort-type";
import { Voyage } from "./voyage";
import { Location } from "../../locations/types/location";

export type SortVoyage = {
  orderBy: keyof Voyage;
  order: SortEnum;
};

export type FilterVoyage = {
  voyage_ids?: string[];
  operator_ids?: string[];
  route_ids?: number[];
  depart_time?: string;
  min_depart_time?: string;
  max_depart_time?: string;
  departure_date?: string;
  boat_name?: string;
  min_price?: number;
  max_price?: number;
};

export type FilterVoyageByLocation = {
  min_depart_time?: string;
  max_depart_time?: string;
  boat_name?: string;
  operator_ids?: string[];
};

export type QueryVoyageByLocationAndDate = {
  page?: number;
  limit?: number;
  departure_date: Voyage["departure_date"];
  departure_id: Location["id"];
  destination_id: Location["id"];
  filters?: FilterVoyageByLocation;
  sort?: SortVoyage[];
};

export type VoyagesFindAllByDate = {
  departure_date: Voyage["departure_date"];
  page?: number;
  limit: number;
  filters?: Omit<FilterVoyage, "departure_date">;
  sort?: SortVoyage[];
};

export type VoyagesFindAllByDateAndUpdate = VoyagesFindAllByDate & {
  updateFilters?: Omit<FilterVoyage, "departure_date">;
};

export type QueryVoyageByRelateLocationAndDateRange = {
  page?: number;
  limit?: number;
  departure_id: Location["id"];
  destination_id: Location["id"];
  filters?: FilterVoyageByLocation;
  sort?: SortVoyage[];
  from: Voyage["departure_date"];
  to: Voyage["departure_date"];
};
