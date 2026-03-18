import { FileEntity } from "../../files/types/file-entity";
import { PassengerConfig } from "../../passengers/types/passenger";
import { IssueTicketSpeedEnum } from "../enums/issue-ticket-speed.enum";

export type Operator = {
  id: string;
  operator_name: string;
  operator_code: string;
  operator_logo?: FileEntity | null;
  configs: OperatorConfig;
  is_enabled: boolean;
  features?: OperatorFeatures;

  // only root organization in dashboard
  // automation?: OperatorAutomation;
};

export type OperatorAutomation = {
  voyages: boolean;
  boat_layouts: boolean;
  create_order: boolean;
  issue_ticket: boolean;
};

export type OperatorFeatures = {
  /**
   * Indicates if the operator supports seri ticket
   */
  seri_ticket: boolean;
  /**
   * Indicates if the operator supports change passenger info after issue ticket
   */
  change_passenger_info: boolean;
};

export type OperatorRoute = {
  operator_id: string;
  operator?: Operator;
  route_id: string;
  route_code: string;
  harbor_fee: number;
  departure_address: string;
  destination_address: string;
};

export type OperatorConfig = {
  order_detail_url?: string;
  passenger_inputs: PassengerConfig;
  max_vehicle_capacity: number;
  issue_ticket_speed: IssueTicketSpeedEnum;
};

export enum OperatorEnum {
  PhuQuocExpress = "phuquocexpress",
  MaiLinhExpress = "mailinhexpress",
  HoaBinhShip = "hoabinhship",
  GreenLines = "greenlines",
  SuperDong = "superdong",
  Lightning68 = "lightning68",
  PhuQuyExpress = "phuquyexpress",
  CangSaKy = "cangsaky",
  BinhAnHaTien = "binhanhatien",
  ThanhThoi = "thanhthoi",
  Unknown = "unknown",
}
