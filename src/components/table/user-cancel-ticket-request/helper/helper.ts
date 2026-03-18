import { CancelTicketRequestProcessStatusEnum } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request-process-status.enum";
import { TicketPaymentStatusEnum } from "@/services/apis/tickets/types/ticket-payment-status-enum";
import { TicketStatusEnum } from "@/services/apis/tickets/types/ticket-status-enum";
import { TFunction } from "i18next";

export const getCancelTicketRequestProcessStatusStyles = (
  status: CancelTicketRequestProcessStatusEnum
): string => {
  const statusStyles: Record<CancelTicketRequestProcessStatusEnum, string> = {
    [CancelTicketRequestProcessStatusEnum.PROCESSING]:
      "bg-yellow-100 text-yellow-800",
    [CancelTicketRequestProcessStatusEnum.ACCEPT]:
      "bg-green-100 text-green-800",
    [CancelTicketRequestProcessStatusEnum.REJECT]: "bg-red-100 text-red-800",
    [CancelTicketRequestProcessStatusEnum.RECALL]: "bg-gray-100 text-gray-800",
    [CancelTicketRequestProcessStatusEnum.REFUNDED]:
      "bg-primary-100 text-primary-800",
  };

  return statusStyles[status] || "bg-gray-50 text-gray-500";
};

export const getCancelTicketRequestStatusText = (
  status: CancelTicketRequestProcessStatusEnum | undefined,
  has_refund: boolean | undefined | null,
  t: TFunction
): string => {
  const statusTexts: Record<CancelTicketRequestProcessStatusEnum, string> = {
    [CancelTicketRequestProcessStatusEnum.PROCESSING]: t("status.processing"),
    [CancelTicketRequestProcessStatusEnum.ACCEPT]: t("status.accepted"),
    [CancelTicketRequestProcessStatusEnum.REJECT]: t("status.rejected"),
    [CancelTicketRequestProcessStatusEnum.RECALL]: t("status.recalled"),
    [CancelTicketRequestProcessStatusEnum.REFUNDED]: t("status.refunded"),
  };

  if (!status || has_refund === undefined || has_refund === null) {
    return t("status.unknown");
  }

  if (status === CancelTicketRequestProcessStatusEnum.ACCEPT && has_refund) {
    return statusTexts[CancelTicketRequestProcessStatusEnum.REFUNDED];
  }

  return statusTexts[status] || t("status.unknown");
};

export const getTicketPaymentStatusText = (
  status: TicketPaymentStatusEnum | undefined,
  t?: TFunction
) => {
  switch (status) {
    case TicketPaymentStatusEnum.Pending:
      return t?.("payment.pending");
    case TicketPaymentStatusEnum.Paid:
      return t?.("payment.paid");
    case TicketPaymentStatusEnum.Refunded:
      return t?.("payment.refunded");
    default:
      return t?.("payment.unknown");
  }
};

export const getTicketPaymentStatusStyles = (
  status: TicketPaymentStatusEnum | undefined
) => {
  switch (status) {
    case TicketPaymentStatusEnum.Pending:
      return "bg-orange-500 text-white";
    case TicketPaymentStatusEnum.Paid:
      return "bg-green-500 text-white";
    case TicketPaymentStatusEnum.Refunded:
      return "bg-red-500 text-white";
    default:
      return "";
  }
};

export const getTicketStatusText = (
  status: TicketStatusEnum | undefined,
  t: TFunction
) => {
  switch (status) {
    case TicketStatusEnum.Draft:
      return t("ticket.draft");
    case TicketStatusEnum.Booked:
      return t("ticket.booked");
    case TicketStatusEnum.Cancelled:
      return t("ticket.cancelled");
    default:
      return t("ticket.unknown");
  }
};

export const getTicketStatusStyles = (status: TicketStatusEnum | undefined) => {
  switch (status) {
    case TicketStatusEnum.Draft:
      return "bg-gray-500 text-white";
    case TicketStatusEnum.Booked:
      return "bg-blue-500 text-white";
    case TicketStatusEnum.Cancelled:
      return "bg-red-500 text-white";
    default:
      return "";
  }
};
