import { TicketGenderEnum } from "../../tickets/types/ticket-gender-enum";
import { TicketPrice } from "../../tickets/types/ticket-price";
import { TicketPromotion } from "../../tickets/types/ticket-promotions";

export type Seat = {
  SeatId: number;
  PositionId: number;
  SeatName: string;
  SeatType: string;
  IsVIP: boolean;
  Row: number;
  Col: number;
  Floor: number;
  RowSpan: number;
  ColSpan: number;
  IsSeat: boolean;
  IsHeld: boolean;
  IsBooked: boolean;
  IsExported: boolean;
  IsRotate: boolean;
  IsRender: boolean;
  SortAuto: number;
  FloorId: string;
};

export type SeatColor = {
  text: string;
  background: string;
};

export type SeatColorWithType = SeatColor & { seatType: string };

export type SeatMetadata = Seat & { SeatColor?: SeatColor };

/**
 * Store seat data & ticket data
 */
export type SeatTicket = {
  /**
   * Metadata of this seat
   */
  seatMetadata: SeatMetadata;
  /**
   * Original ticket prices of a voyage
   */
  ticketPrice: TicketPrice[];
  /**
   * Promotions of tickets
   */
  ticketPromotions?: TicketPromotion[];
  /**
   * Ticket prices that had been changed based on promotions
   */
  ticketPriceAppliedPromotions: TicketPrice[];
  /**
   * Ticket price selected by user
   */
  selectedTicketPrice?: TicketPrice;
  /**
   * Passenger data of this seat
   */
  passengerData?: PassengerTicket;
};

export type PassengerTicket = {
  name?: string | null;
  gender?: TicketGenderEnum | null;
  dateOfBirth: string;
  socialId?: string | null;
  address?: string | null;
  nationality: string;
  plateNumber?: string | null;
};
