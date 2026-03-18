import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import HeaderTransactionTable from "./header/header-transaction-table";
import HeaderTransactionTotal from "./header/header-transaction-total-";
import ChipTransactionStatus from "@/components/chip/chip-transaction-status";
import ChipTransactionPaymentType from "@/components/chip/chip-payment-type";
import { Transaction } from "@/services/apis/bookings/transactions/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IoCheckmark } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import LinkBase from "@/components/link-base";

const TransactionIdCell = ({ id }: { id: string }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm">{id}</p>
      <button
        onClick={() => copyToClipboard(id)}
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
  );
};
export const paymentHistoryColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transaction_id",
    header: () => (
      <HeaderTransactionTable t={"table.header.transaction-code"} />
    ),
    cell: ({ row }) => <TransactionIdCell id={row.original.id} />,
    size: 200,
  },
  {
    accessorKey: "transaction.createdAt",
    header: () => (
      <HeaderTransactionTable t={"table.header.transaction-time"} />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      const transaction_time = formatDate(createdAt, "HH:mm dd/MM/yyyy");
      return <p className="text-sm">{transaction_time}</p>;
    },
    size: 200,
  },
  // {
  //   accessorKey: "info",
  //   header: () => <HeaderTransactionTable t={"table.header.transaction-info"} />,
  //   cell: ({ row }) => {
  //     const date_of_birth = formatDate(
  //       row.getValue("date_of_birth"),
  //       "dd/MM/yyyy"
  //     );
  //     return <p className="text-sm">{date_of_birth}</p>;
  //   },
  // },
  {
    accessorKey: "total",
    header: () => <HeaderTransactionTotal t={"table.header.total-amount"} />,
    cell: ({ row }) => {
      const amount = row.original?.amount;
      const changeType = row.original?.change_type;

      const formattedAmount = formatCurrency(amount) || 0;
      const change_type_text = changeType === "INC" ? "+ " : "- ";
      const displayAmount = `${change_type_text}${formattedAmount}`;
      return <p className="text-sm font-semibold">{displayAmount}</p>;
    },
    size: 200,
  },

  {
    accessorKey: "status",
    header: () => <HeaderTransactionTable t={"table.header.status"} />,
    cell: ({ row }) => {
      const status = row.original?.status;
      return <ChipTransactionStatus status={status}></ChipTransactionStatus>;
    },
    size: 200,
  },

  {
    accessorKey: "type",
    header: () => <HeaderTransactionTable t={"table.header.type"} />,
    cell: ({ row }) => {
      const type = row.original?.type;
      return (
        <ChipTransactionPaymentType type={type}></ChipTransactionPaymentType>
      );
    },
    size: 200,
  },
  {
    accessorKey: "booking_id",
    header: () => <HeaderTransactionTable t={"table.header.booking-code"} />,
    cell: ({ row }) => {
      const bookingId = row.original?.booking_id;
      return (
        <LinkBase
          href={`/user/bookings/${bookingId}`}
          className="text-sm font-bold text-primary"
        >
          {bookingId}
        </LinkBase>
      );
    },
    size: 200,
  },
];
