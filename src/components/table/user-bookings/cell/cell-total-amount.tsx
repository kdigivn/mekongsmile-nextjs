import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";
import { formatCurrency } from "@/lib/utils";
import { Booking } from "@/services/apis/bookings/types/booking";
import { BookingPaymentStatusEnum } from "@/services/apis/bookings/types/booking-payment-status-enum";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { format } from "date-fns";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MdInfoOutline } from "react-icons/md";

type Props = { booking: Booking };
function CellTotalAmount({ booking }: Props) {
  const { t } = useTranslation(
    "user/bookings",
    useMemo(() => ({ keyPrefix: "table.cell.total-amount" }), [])
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full flex-col gap-2">
        {booking?.total_discount && booking?.total_discount > 0 ? (
          <div className="flex min-w-[180px] flex-wrap items-end justify-between gap-x-1 text-sm text-success-600">
            <span className="w-fit font-semibold">{`${t("total-discount")}:`}</span>
            <div className="flex justify-end">
              <span className="rounded-sm bg-success-100 px-1 text-xs font-bold">
                -{formatCurrency(booking?.total_discount)}
              </span>
            </div>
          </div>
        ) : null}
        <div className="flex w-full min-w-[180px] flex-wrap items-end justify-between gap-x-1 text-primary-500">
          <span className="font-semibold">{t("total")}:</span>
          <div className="flex justify-end">
            <span className="rounded-sm bg-primary-100 px-1 text-xs font-bold">
              {formatCurrency(booking?.total_price)
                ? formatCurrency(booking?.total_price)
                : 0}
            </span>
          </div>
        </div>
      </div>
      {booking.payment_status === BookingPaymentStatusEnum.NotPaid &&
        booking.booking_status === BookingStatusEnum.Requested &&
        booking.payment_expired_at && (
          <div className="flex w-full min-w-[180px] flex-wrap content-end items-end justify-between gap-x-1">
            <span className="font-semibold">{t("payment-due-date")}:</span>
            <div className="flex items-end gap-1">
              <p
                color="info.main"
                className="m-0 !text-xs !font-normal text-warning-500"
              >
                {format(booking.payment_expired_at, "HH:mm dd/MM/yyyy")}
              </p>
              <TooltipResponsive>
                <TooltipResponsiveTrigger asChild>
                  <div className="flex h-fit w-fit items-center justify-center rounded-md bg-warning-200 p-1 text-xs font-normal text-warning-700">
                    <MdInfoOutline />
                  </div>
                </TooltipResponsiveTrigger>
                <TooltipResponsiveContent>
                  {t("payment-due-date-tooltip")}
                </TooltipResponsiveContent>
              </TooltipResponsive>
            </div>
          </div>
        )}
    </div>
  );
}

export default memo(CellTotalAmount);
