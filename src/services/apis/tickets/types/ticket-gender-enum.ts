import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export enum TicketGenderEnum {
  Male = 1,
  Female = 0,
}

export type TicketGenderOption = {
  id: TicketGenderEnum;
  label: string;
};

const useTicketGenderOptions = () => {
  const { t } = useTranslation("user/booking-detail");

  const ticketsOption: TicketGenderOption[] = useMemo(
    () => [
      {
        id: TicketGenderEnum.Female,
        label: t(`table.header.gender.female`),
      },
      {
        id: TicketGenderEnum.Male,
        label: t(`table.header.gender.male`),
      },
    ],
    [t]
  );

  return ticketsOption;
};

export { useTicketGenderOptions };
