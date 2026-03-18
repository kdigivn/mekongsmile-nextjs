import { Operator } from "../../operators/types/operator";
import { Route } from "../../routes/types/route";
import { VoyageTicketPrice } from "./voyage-ticket-price";

export type Voyage = {
  id: string;
  route_id: number;
  route?: Route;
  operator_id: string;
  operator?: Operator;
  operator_voyage_id: string;
  operator_route_id: string;
  operator_route_code: string;
  schedule_id?: string;
  no_seat: number;
  no_booked: number;
  no_exported?: number;
  no_remain: number;
  no_seri?: number;
  departure_date: string;
  depart_time: string;
  arrive_time?: string;
  boat_id: string;
  boat_name: string;
  boat_code: string;
  ticket_prices: VoyageTicketPrice;
  harbor_fee: number;
  disable: boolean;
  no_plate?: number;
  // ClickBait feature: Promotional voyage for marketing
  clickBait?: {
    price: number; // Promotional price (default: 0 for free)
    rootVoyageId: string; // Original voyage ID to navigate back to
  };
};

export type SelectedVoyages = {
  departVoyage: Voyage;
  destiVoyage?: Voyage;
};

export type VoyageItem = {
  voyage: Voyage;
};

export type VoyagesCount = {
  departure_date?: string;
  total_voyage: number;
  total_available_voyage: number;
};
