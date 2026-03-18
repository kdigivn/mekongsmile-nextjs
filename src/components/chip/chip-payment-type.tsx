"use client";

import { TransactionTypeEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";

type Props = {
  type: string;
};
function ChipTransactionPaymentType({ type }: Props) {
  const { t } = useTranslation("user/transaction");
  switch (type) {
    case TransactionTypeEnum.PayBooking:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-info-100/30 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.PayBooking)}
          </div>
        </div>
      );
    case TransactionTypeEnum.SyncWithOperator:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary-100 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.SyncWithOperator)}
          </div>
        </div>
      );
    case TransactionTypeEnum.Deposit:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-100 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.Deposit)}
          </div>
        </div>
      );
    case TransactionTypeEnum.CustomerBorrowMoney:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-100 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.CustomerBorrowMoney)}
          </div>
        </div>
      );
    case TransactionTypeEnum.CustomerRepayDebt:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-primary-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.CustomerRepayDebt)}
          </div>
        </div>
      );
    case TransactionTypeEnum.PayOrder:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.PayOrder)}
          </div>
        </div>
      );
    case TransactionTypeEnum.RevertPayment:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.RevertPayment)}
          </div>
        </div>
      );
    case TransactionTypeEnum.Blank:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.Blank)}
          </div>
        </div>
      );
    case TransactionTypeEnum.OrganizationDeposit:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.OrganizationDeposit)}
          </div>
        </div>
      );
    case TransactionTypeEnum.RefundPayment:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-danger-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.RefundPayment)}
          </div>
        </div>
      );
    case TransactionTypeEnum.DebtReconciliation:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-warning-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.DebtReconciliation)}
          </div>
        </div>
      );

    case TransactionTypeEnum.Unknown:
      return (
        <div className="">
          <div className="flex h-6 w-fit items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-normal text-black">
            {t("table.cell.type." + TransactionTypeEnum.Unknown)}
          </div>
        </div>
      );
    default:
      return <div>{`${t("unsupported")} ${type}`}</div>;
  }
}

export default memo(ChipTransactionPaymentType);
