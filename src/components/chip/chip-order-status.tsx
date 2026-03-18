"use client";

import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  status: number;
  className?: string;
  isManual?: boolean;
};
function ChipOrderStatus({ status, className, isManual }: Props) {
  const { t } = useTranslation("booking/order-status");
  switch (status) {
    case OrderStatusEnum.Requested:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary-100 px-2 text-xs font-bold text-black">
            {t(OrderStatusEnum.Requested.toString())}
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

    case OrderStatusEnum.ExportError:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-600 px-1 text-xs font-bold text-white">
            {t(OrderStatusEnum.ExportError.toString())}
          </div>
        </div>
      );

    case OrderStatusEnum.Expired:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-300 px-1 text-xs font-bold text-black">
            {t(OrderStatusEnum.Expired.toString())}
          </div>
        </div>
      );

    case OrderStatusEnum.Booked:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-info-100 px-1 text-xs font-bold text-black">
            {t(OrderStatusEnum.Booked.toString())}
          </div>
        </div>
      );

    case OrderStatusEnum.CancelRequest:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-300 px-1 text-xs font-bold text-black">
            {t(OrderStatusEnum.CancelRequest.toString())}
          </div>
        </div>
      );

    case OrderStatusEnum.Cancelled:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning px-1 text-xs font-bold text-black">
            {t(OrderStatusEnum.Cancelled.toString())}
          </div>
        </div>
      );

    // case OrderStatusEnum.CancelledBecauseBoatNotDepart:
    //   return (
    //     <div className={className}>
    //       <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning px-1 text-xs font-bold text-black">
    //         {t(OrderStatusEnum.CancelledBecauseBoatNotDepart.toString())}
    //       </div>
    //     </div>
    //   );

    case OrderStatusEnum.WaitForIssue:
      if (isManual) {
        return (
          <div className={className}>
            <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-300 px-1 text-xs font-bold text-black">
              Đơn chờ xuất vé
            </div>
          </div>
        );
      }
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-300 px-1 text-xs font-bold text-black">
            {t(OrderStatusEnum.WaitForIssue.toString())}
          </div>
        </div>
      );

    default:
      return <div className={className}>{`${t("unsupported")} ${status}`}</div>;
  }
}

export default memo(ChipOrderStatus);
