"use client";

import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  status: number;
  className?: string;
};
function ChipBookingStatus({ status, className }: Props) {
  const { t } = useTranslation("booking/booking-status");
  switch (status) {
    case BookingStatusEnum.Requested:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary-100 px-2 text-xs font-bold text-black">
            {t(BookingStatusEnum.Requested.toString())}
          </div>
        </div>
      );

    // case BookingStatusEnum.Paid:
    //   return (
    //     <div className={className}>
    //       <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary px-1 text-xs font-bold text-white">
    //         {t(BookingStatusEnum.Paid.toString())}
    //       </div>
    //     </div>
    //   );

    case BookingStatusEnum.ExportError:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-600 px-1 text-xs font-bold text-white">
            {t(BookingStatusEnum.ExportError.toString())}
          </div>
        </div>
      );

    case BookingStatusEnum.Expired:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-300 px-1 text-xs font-bold text-black">
            {t(BookingStatusEnum.Expired.toString())}
          </div>
        </div>
      );

    case BookingStatusEnum.Booked:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-info-100 px-1 text-xs font-bold text-black">
            {t(BookingStatusEnum.Booked.toString())}
          </div>
        </div>
      );

    case BookingStatusEnum.CancelRequest:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-300 px-1 text-xs font-bold text-black">
            {t(BookingStatusEnum.CancelRequest.toString())}
          </div>
        </div>
      );

    case BookingStatusEnum.Cancelled:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning px-1 text-xs font-bold text-black">
            {t(BookingStatusEnum.Cancelled.toString())}
          </div>
        </div>
      );

    case BookingStatusEnum.CancelledBecauseBoatNotDepart:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning px-1 text-xs font-bold text-black">
            {t(BookingStatusEnum.CancelledBecauseBoatNotDepart.toString())}
          </div>
        </div>
      );

    default:
      return <div className={className}>{`${t("unsupported")} ${status}`}</div>;
  }
}

export default memo(ChipBookingStatus);
