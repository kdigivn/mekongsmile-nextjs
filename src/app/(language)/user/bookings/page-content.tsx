"use client";

import UserBookingDataTable from "@/components/table/user-bookings/user-booking-data-table";
import { useTranslation } from "@/services/i18n/client";
import { useSearchParams } from "next/navigation";
import { memo } from "react";
import { BookingSearchParams } from "./booking-search-param-type";
import SearchBookingForm from "@/components/form/search-booking-form";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";

function UserBookings() {
  const { t } = useTranslation("user/bookings");
  const searchParams = useSearchParams();

  const queryParams: BookingSearchParams = {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    id: searchParams.get("id") ?? "",
    picName: searchParams.get("picName") ?? "",
    createdAtFrom: searchParams.get("createdAtFrom") ?? "",
    createdAtTo: searchParams.get("createdAtTo") ?? "",
    booking_statuses: searchParams.get("booking_statuses")
      ? Number(searchParams.get("booking_statuses"))
      : -1,
  };

  return (
    <div className="lg:px-auto flex w-full max-w-screen-xl flex-col gap-4 px-5 py-2 md:container md:px-10 md:py-4">
      <SearchBookingForm
        initId={queryParams.id}
        initBookingStatus={
          queryParams.booking_statuses ? [queryParams.booking_statuses] : []
        }
        initCreatedAtFrom={queryParams.createdAtFrom}
        initCreatedAtTo={queryParams.createdAtTo}
        initOrdererName={queryParams.picName}
      />
      <div className="h-full w-full rounded-md bg-transparent p-0 shadow-none lg:mb-6 lg:flex lg:min-h-screen lg:justify-center lg:bg-white lg:shadow-md">
        <div className="flex w-full flex-col gap-3">
          {/* Table title */}
          <div className="flex p-3">
            <div className="flex">
              <h2 className="text-lg font-semibold text-foreground">
                {t("table.title")}
              </h2>
              {/* <div className="flex h-6 gap-1 rounded-md bg-primary px-1">
                <p className="text-sm font-bold text-primary-800">{`${bookings.length} ${t("table.no-of-results")}`}</p>
              </div> */}
            </div>
          </div>

          {/* Table */}
          <UserBookingDataTable
            limit={queryParams.limit}
            ids={queryParams.id}
            createdAtFrom={queryParams.createdAtFrom}
            createdAtTo={queryParams.createdAtTo}
            booking_statuses={queryParams.booking_statuses}
            picName={queryParams.picName}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(withPageRequiredAuth(UserBookings));
