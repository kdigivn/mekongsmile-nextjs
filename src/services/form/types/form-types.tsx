import {
  PassengerTicket,
  SeatTicket,
} from "@/services/apis/boatLayouts/types/seat";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { Voucher } from "@/services/apis/voucher/type/voucher";
import { SelectedVoyages } from "@/services/apis/voyages/types/voyage";

export type PICFormData = {
  picName: string;
  picEmail: string;
  picPhone: string;
  phone_country_code: string;
  picSocialId?: string | null;
};

export type FormOperatorNationality = Omit<
  OperatorNationality,
  "national_id"
> & {
  national_id: string;
};

export type FormPassengerTicket = Omit<
  PassengerTicket,
  "nationality" | "dateOfBirth"
> & {
  gender?: TicketGenderEnum | null;
  nationality: FormOperatorNationality;
  dateOfBirth: Date;
  positionId: number;
  plateNumber?: string | null;
  seatName: string;
  price: number;
  ticketPrice: TicketPrice;
  // For render ticketPrice in ticketPrice Combobox in PassengerForm
  // all ticketPrice in ticketPrice Combobox TicketPrice[] stringtify
  // to store and parse to object to render in ticketPrice Combobox
  allTicketPrice: string;
};

export type VoyageFormData = {
  pic: PICFormData;
  isExportVat: boolean;
  vat: TaxRecordFromData;
  passengers?: FormPassengerTicket[];
  departVouchers?: Voucher[];
  destiVouchers?: Voucher[];
};

export type TaxRecordFromData = {
  email?: string;
  taxNumber?: string;
  name?: string;
  address?: string;
};

export type LocalSelectedTicketFormData = {
  selectedVoyages?: SelectedVoyages;
  numberOfPassengers?: number;
  picInfo?: PICFormData;
  departSelectedSeats?: SeatTicket[];
  destiSelectedSeats?: SeatTicket[];
  taxInfo?: TaxRecordFromData;
  departVouchers?: Voucher[];
  destiVouchers?: Voucher[];
};

export type PassengerContact = {
  id?: string;
  user_id?: string;
  name: string;
  dateOfBirth: string;
  address: string;
  socialId: string;
  nationalityAbbrev: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LocalPassengerData = {
  passengers: PassengerContact[];
};

export enum LocalFormKey {
  selectedTicketData = "localVoyageTicketData",
  rememberState = "rememberState",
  testDataContact = "testDataContact",
}
