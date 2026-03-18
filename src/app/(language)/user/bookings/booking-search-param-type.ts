export type BookingSearchParams = {
  page: number;
  limit: number;
  id?: string;
  picName?: string;
  // createdDate?: string;
  booking_statuses?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
};
