import { Location } from "../../locations/types/location";
import { OperatorRoute } from "../../operators/types/operator";

export type Route = {
  id: number;
  departure_id: string;
  departure_name: Location["location_name"];
  departure_abbreviation: Location["abbreviation"];
  destination_id: string;
  destination_name: Location["location_name"];
  destination_abbreviation: Location["abbreviation"];
  operators?: OperatorRoute[];
  disable: boolean;
  isVietnameseOnly: boolean;
};

export type RouteQuery = {
  id: string;
};
