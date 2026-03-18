import { TicketGenderEnum } from "../../tickets/types/ticket-gender-enum";

export type Passenger = {
  id?: string;
  user_id?: string;
  full_name: string;
  gender?: TicketGenderEnum;
  date_of_birth: string;
  phone_number?: string;
  email?: string;
  address: string;
  social_id: string;
  national_abbrev: string;
  source?: number;
  plate_number?: string;
};

export type CreatePassengerRequest = Omit<Passenger, "id" | "source">;

export type UpdatePassengerRequest = Omit<Passenger, "source">;

export type PostBatchCreatePassengerRequest = {
  passengers: CreatePassengerRequest[];
};

export type PatchBatchUpdatePassengerRequest = {
  passengers: UpdatePassengerRequest[];
};
export type PassengerConfig = {
  full_name: InputRules;
  date_of_birth: InputRules;
  social_id: InputRules;
  email: InputRules;
  phone_number: InputRules;
  address: InputRules;
  national_abbrev: InputRules;
  gender: InputRules;
  plate_number: InputRules;
};

export type InputRules = {
  enable: boolean;
  validation?: BaseValidation;
};

export type BaseValidation = {
  min_length?: number;
  max_length?: number;
};

export type UpdatePassengerInfoProps = {
  orderId: string;
  seatName: string;
  passengerName?: string;
  passengerSocialId?: string;
  bookingId: string;
  passengerConfig?: PassengerConfig;
};
