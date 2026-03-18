"use client";

import { TransactionStatusEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  status: number;
  className?: string;
};
function ChipTransactionStatus({ status, className }: Props) {
  const { t } = useTranslation("user/transaction");
  switch (status) {
    case TransactionStatusEnum.Failed:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-300 px-2 text-xs font-normal text-black">
            {t("table.cell.status." + TransactionStatusEnum.Failed.toString())}
          </div>
        </div>
      );
    case TransactionStatusEnum.Succeed:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary-300 px-2 text-xs font-normal text-black">
            {t("table.cell.status." + TransactionStatusEnum.Succeed.toString())}
          </div>
        </div>
      );
    case TransactionStatusEnum.Cancelled:
      return (
        <div className={className}>
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-300 px-2 text-xs font-normal text-black">
            {t("table.cell.status." + TransactionStatusEnum.Succeed.toString())}
          </div>
        </div>
      );
    default:
      return <div>{`${t("unsupported")} ${status}`}</div>;
  }
}

export default memo(ChipTransactionStatus);
