import { TicketPriceAddition } from "../../ticket-price-additions/types/ticket-price-addition";

export type TicketPrice = {
  id: number;
  ticket_type_id: number;
  ticket_type_label: string;
  seat_type: string;
  original_price: number;
  price_with_VAT: number;
  /**
   * Total addition amount of public additions. Could be a positive or negative number. Default: 0
   */
  additionalAmount?: number;
  /**
   * List of public additions applied to this TicketPrice
   */
  additions?: TicketPriceAddition[] | null;
  is_default?: boolean;
};
