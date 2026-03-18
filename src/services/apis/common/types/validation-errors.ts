import HTTP_CODES_ENUM from "./http-codes";

export type ValidationErrors = {
  status: HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
  data: {
    status: HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
    errors: Record<string, string | number>;
  };
};

export type CommonAPIErrors = {
  errorCode?: number;
  message?: string;
  [key: string]: string | number | boolean | null | undefined;
  booking_status?: string;
  status?: string;
};
