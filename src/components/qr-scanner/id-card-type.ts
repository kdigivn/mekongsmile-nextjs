import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";

export type IdCard = {
  id: string;
  name: string;
  birthday: string;
  birthplace: string;
  sex: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  province_code: string;
  district_code: string;
  ward_code: string;
  street: string;
  nationality: string;
  religion: string;
  ethnicity: string;
  expiry: string;
  feature: string;
  issue_date: string;
  issue_by: string;
  licence_class: string | null;
  passport_id: string | null;
  cmnd_id: string;
  passport_type: string | null;
  military_title: string | null;
  type_blood: string | null;
  type: string;
  type_list: string;
  document: string;
  mrz1: string;
  mrz2: string;
  mrz3: string;
  hometown: string;
  marital_status: string;
  father_name: string;
  father_nationality: string;
  mother_name: string;
  mother_nationality: string;
  spouse_name: string;
  spouse_nationality: string;
  representative_name: string;
  representative_nationality: string;
  portrait_location_front: number[][];
};

export type IdCardResponse = {
  code: number;
  message: string;
  request_id: string;
  information: IdCard;
};

export type IdCardToPassenger = {
  name: string;
  gender: TicketGenderEnum;
  birthdate: string;
  address: string;
  cccd: string;
};
