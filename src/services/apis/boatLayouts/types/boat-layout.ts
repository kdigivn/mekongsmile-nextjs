import { TicketPrice } from "../../tickets/types/ticket-price";
import { TicketTypeConfig } from "../../tickets/types/ticket-type-config";

export type FloorLayout = {
  no_rows: number;
  no_cols: number;
  floor_id: string;
  SeatIds: number[];
  PositionIds: number[];
  SeatNames: string[];
  SeatTypes: string[];
  IsVIPs: boolean[];
  Rows: number[];
  Cols: number[];
  RowSpans: number[];
  ColSpans: number[];
  IsSeats: boolean[];
  IsHelds: boolean[];
  IsBookeds: boolean[];
  IsExporteds: boolean[];
  IsRotates: boolean[];
  IsRenders: boolean[];
  SortAutos?: number[];
};

export type BoatLayout = {
  id: string;
  voyage_id: string;
  floors: FloorLayout[];
  prices: TicketPrice[];
  seat_types: string[];
  ticket_type_configs: TicketTypeConfig[];
};

export type BoatLayoutItem = {
  boatLayout: BoatLayout;
};
