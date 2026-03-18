import { TicketPrice } from "../../tickets/types/ticket-price";
import { TicketTypeConfig } from "../../tickets/types/ticket-type-config";

export type VoyageTicketPrice = {
  default_ticket_price: number;
  prices: TicketPrice[];
  ticket_type_configs: TicketTypeConfig[];
};
