// import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";
import { CiCalendar } from "react-icons/ci";
import { format } from "date-fns/format";
import { Transaction } from "@/services/apis/bookings/transactions/types/transaction";
import ChipTransactionPaymentType from "@/components/chip/chip-payment-type";
import ChipTransactionStatus from "../chip/chip-transaction-status";
import { formatCurrency } from "@/lib/utils";
import LinkBase from "../link-base";
import { useTranslation } from "@/services/i18n/client";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IoCheckmark } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";

type Props = {
  transaction: Transaction;
};
const TransactionCard = ({ transaction }: Props) => {
  const { t } = useTranslation("user/transaction");
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow-sm transition-all duration-200 ease-in-out hover:bg-default-100">
        <div className="flex w-full flex-wrap items-center justify-between gap-y-3 text-sm">
          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="font-bold text-primary">#{transaction.id}</p>
                <button
                  onClick={() => copyToClipboard(transaction.id)}
                  className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                  aria-label="Copy post link"
                >
                  {isCopied ? (
                    <IoCheckmark className="h-4 w-4" />
                  ) : (
                    <IoIosLink className="h-4 w-4" />
                  )}
                  <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
                </button>
              </div>
              <ChipTransactionStatus
                status={transaction.status}
                className="flex w-fit max-w-[190px] flex-wrap"
              />
            </div>
            <div className="flex w-full items-center justify-between gap-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CiCalendar className="h-5 w-5" />
                {format(transaction.createdAt, "HH:mm dd/MM/yyyy")}
              </div>

              {transaction.booking_id && (
                <div className="flex items-center gap-1">
                  <p className="font-bold">{t("table.header.booking-code")}:</p>
                  <LinkBase
                    href={`/user/bookings/${transaction?.booking_id}`}
                    className="text-sm font-bold text-primary"
                  >
                    {transaction?.booking_id}
                  </LinkBase>
                </div>
              )}
            </div>
          </div>
          <span className="order-last w-fit text-base font-bold text-primary">{`${formatCurrency(transaction.amount)}`}</span>
          <div className="w-full basis-2/4 text-sm font-semibold">
            <ChipTransactionPaymentType type={transaction.type} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(TransactionCard);
