"use client";

import { BookingPaymentStatusEnum } from "@/services/apis/bookings/types/booking-payment-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  status: number;
  className?: string;
};

function ChipPaymentStatus({ status, className }: Props) {
  const { t } = useTranslation("booking/booking-payment-status");

  switch (status) {
    case BookingPaymentStatusEnum.NotPaid:
      return (
        <div className={className}>
          <div className="flex h-fit w-fit items-center justify-center rounded-md bg-warning-400 px-2 py-1 text-xs font-bold">
            {t(BookingPaymentStatusEnum.NotPaid.toString())}
          </div>
        </div>
      );

    case BookingPaymentStatusEnum.Paid:
      return (
        <div className={className}>
          <div className="flex h-fit w-fit items-center justify-center rounded-md bg-success px-2 py-1 text-xs font-bold text-white">
            {t(BookingPaymentStatusEnum.Paid.toString())}
          </div>
        </div>
      );

    case BookingPaymentStatusEnum.PaidWithDebt:
      return (
        <div className={className}>
          <div className="flex h-fit w-fit items-center justify-center rounded-md bg-danger px-2 py-1 text-xs font-bold text-white">
            {t(BookingPaymentStatusEnum.PaidWithDebt.toString())}
          </div>
        </div>
      );

    case BookingPaymentStatusEnum.PayNotEnough:
      return (
        <div className={className}>
          <div className="flex h-fit w-fit items-center justify-center rounded-md bg-info px-2 py-1 text-xs font-bold text-white">
            {t(BookingPaymentStatusEnum.PayNotEnough.toString())}
          </div>
        </div>
      );

    case BookingPaymentStatusEnum.Refunded:
      return (
        <div className={className}>
          <div className="flex h-fit w-fit items-center justify-center rounded-md bg-info-100/30 px-2 py-1 text-xs font-bold text-white">
            {t(BookingPaymentStatusEnum.Refunded.toString())}
          </div>
        </div>
      );

    default:
      return <div className={className}>{`${t("unsupported")} ${status}`}</div>;
  }
}

export default memo(ChipPaymentStatus);
