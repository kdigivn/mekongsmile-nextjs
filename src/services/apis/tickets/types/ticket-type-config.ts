import { TicketPrice } from "./ticket-price";

export type TicketTypeConfig = {
  ticket_type_id: number;
  ticket_type_label: string;
  key_config: string;
  value_config: string;
  note: string;
};

export function getTicketPriceIdsByOperatorCode(
  operatorCode: string,
  ticketPrices: TicketPrice[]
): TicketPrice[] {
  switch (operatorCode) {
    case "mailinhexpress":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 4
      );
    case "greenlines":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    case "phuquocexpress":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    case "hoabinhship":
      if (ticketPrices.length === 1) {
        return ticketPrices;
      }
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    case "superdong":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 4
      );
    case "phuquyexpress":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    case "cangsaky":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 || ticketPrice.ticket_type_id === 2
      );
    case "binhanhatien":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    case "thanhthoi":
      return ticketPrices.filter(
        (ticketPrice) =>
          ticketPrice.ticket_type_id === 1 ||
          ticketPrice.ticket_type_id === 2 ||
          ticketPrice.ticket_type_id === 3
      );
    default:
      return ticketPrices;
  }
}

export type TicketAgeCustomConfig = {
  type_id: number;
  min: number;
  max: number;
  label: string;
  is_with_date?: boolean;
  is_children_social_required?: boolean;
};

export function getMinMaxAgeByByOperatorCode(
  operatorCode?: string
): TicketAgeCustomConfig[] {
  switch (operatorCode) {
    case "mailinhexpress":
      return [
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 2, min: 1, max: 11, label: "children" },
        { type_id: 4, min: 60, max: 250, label: "elderly" },
      ];
    case "greenlines":
      return [
        { type_id: 1, min: 12, max: 62, label: "adult" },
        { type_id: 2, min: 0, max: 11, label: "children" },
        { type_id: 3, min: 63, max: 250, label: "elderly" },
      ];
    case "phuquocexpress":
      return [
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 2, min: 1, max: 11, label: "children" },
        { type_id: 3, min: 60, max: 250, label: "elderly" },
        { type_id: 4, min: 1, max: 250, label: "vip" },
        { type_id: 6, min: 1, max: 250, label: "disabled" },
      ];
    case "hoabinhship":
      return [
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 2, min: 1, max: 11, label: "children" },
        { type_id: 3, min: 60, max: 250, label: "elderly" },
        { type_id: 4, min: 1, max: 250, label: "vip" },
      ];
    case "superdong":
      return [
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 4, min: 1, max: 11, label: "children" },
        { type_id: 2, min: 60, max: 250, label: "elderly" },
      ];
    case "lightning68":
      return [
        { type_id: 1, min: 12, max: 59, label: "adult", is_with_date: true },
        { type_id: 2, min: 1, max: 11, label: "children", is_with_date: true },
        { type_id: 3, min: 60, max: 250, label: "elderly", is_with_date: true },
      ];
    case "phuquyexpress":
      return [
        {
          type_id: 2,
          min: 6,
          max: 11,
          label: "children",
          is_children_social_required: true,
        },
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 3, min: 60, max: 250, label: "elderly" },
      ];
    case "cangsaky":
      return [
        { type_id: 1, min: 1, max: 59, label: "adult", is_with_date: true },
        { type_id: 2, min: 60, max: 250, label: "elderly", is_with_date: true },
      ];
    case "binhanhatien":
      return [
        {
          type_id: 2,
          min: 1,
          max: 10,
          label: "children",
          is_children_social_required: true,
        },
        { type_id: 1, min: 11, max: 60, label: "adult" },
        { type_id: 3, min: 61, max: 250, label: "elderly" },
      ];
    case "thanhthoi":
      return [
        {
          type_id: 2,
          min: 1,
          max: 11,
          label: "children",
          is_children_social_required: true,
        },
        { type_id: 1, min: 12, max: 64, label: "adult" },
        { type_id: 3, min: 65, max: 250, label: "elderly" },
      ];
    default:
      return [
        { type_id: 1, min: 12, max: 59, label: "adult" },
        { type_id: 2, min: 1, max: 11, label: "children" },
        { type_id: 3, min: 60, max: 250, label: "elderly" },
      ];
  }
}
