import { TicketGenderEnum } from "./ticket-gender-enum";
import { TicketPaymentStatusEnum } from "./ticket-payment-status-enum";
import { TicketStatusEnum } from "./ticket-status-enum";
import { TicketTypeEnum } from "./ticket-type-enum";

export type Ticket = {
  ticket_id: string;
  ticket_type: TicketTypeEnum;
  ticket_status: TicketStatusEnum;
  return_trip: boolean;
  price: number;
  seat_id: string;
  seat_name: string;
  seat_type_code: string;
  floor_id: string;
  name: string;
  social_id: string;
  email: string;
  place_of_birth: string;
  date_of_birth: string;
  gender?: TicketGenderEnum;
  home_town: string;
  national?: string;
  plate_number?: string;
  phone_number: string;
  // ECO, VIP, ...
  ticket_type_id?: number;
  position_id?: string;
  ticket_price_id?: number;
  national_id?: string;
  is_child?: boolean;
  is_vip?: boolean;
  is_seri?: boolean;
  sort_auto?: number;
  ticket_payment_status?: TicketPaymentStatusEnum;
  harbor_fee?: number;
};

export type CreateTicket = Pick<
  Ticket,
  | "name"
  | "date_of_birth"
  | "social_id"
  | "national_id"
  | "gender"
  | "plate_number"
  | "home_town"
  | "seat_id"
  | "seat_name"
  | "position_id"
  | "ticket_type_id"
  | "seat_type_code"
  | "is_child"
  | "is_vip"
  | "ticket_price_id"
  | "sort_auto"
  | "floor_id"
  | "is_seri"
>;
