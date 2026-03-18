import { enGB } from "date-fns/locale/en-GB";
import { vi } from "date-fns/locale/vi";

export const getLocaleByKey = (language: string) => {
  switch (language) {
    case "en":
      return enGB;
    case "vi":
      return vi;
    default:
      return enGB;
  }
};
