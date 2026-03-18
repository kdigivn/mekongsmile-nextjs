"use client";

import { Booking } from "@/services/apis/bookings/types/booking";
// import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";
import LinkBase from "../link-base";
import ChipBookingStatus from "../chip/chip-booking-status";
import { CiCalendar } from "react-icons/ci";
import { format } from "date-fns/format";
import { IoLocationOutline } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Badge } from "../ui/badge";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import {
  getIssueTicketSpeedLabel,
  IssueTicketSpeedEnum,
} from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import { BookingPaymentStatusEnum } from "@/services/apis/bookings/types/booking-payment-status-enum";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { MdLockClock } from "react-icons/md";

type Props = {
  booking: Booking;
};
const UserBookingCard = ({ booking }: Props) => {
  // const { t } = useTranslation("user/bookings");
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  });
  const { depart_order, return_order } = booking;
  let issue_ticket_speed =
    depart_order?.voyage?.operator?.configs.issue_ticket_speed;
  let is_manual = issue_ticket_speed !== IssueTicketSpeedEnum.INSTANT;
  let checkOrder = is_manual ? depart_order : return_order;
  let issueTicketLabel: {
    title: string;
    description?: string;
  } = {
    title: "",
  };
  if (!is_manual && return_order) {
    issue_ticket_speed =
      return_order?.voyage?.operator?.configs.issue_ticket_speed;
    is_manual = issue_ticket_speed !== IssueTicketSpeedEnum.INSTANT;
    if (is_manual) {
      checkOrder = return_order;
    } else {
      issueTicketLabel = getIssueTicketSpeedLabel(
        issue_ticket_speed as IssueTicketSpeedEnum
      );
    }
  } else {
    issueTicketLabel = getIssueTicketSpeedLabel(
      issue_ticket_speed as IssueTicketSpeedEnum
    );
  }
  return (
    <LinkBase href={`/user/bookings/${booking.id}`} className="w-full">
      <div className="flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow-sm transition-all duration-200 ease-in-out hover:bg-default-100">
        <div className="flex w-full flex-wrap items-center justify-between gap-y-3 text-sm">
          <div className="flex w-fit flex-col gap-1 md:w-full">
            <div className="flex gap-3 md:w-full md:justify-between">
              <p className="font-bold text-primary">#{booking.id}</p>
              <div className="flex w-fit flex-col gap-1">
                <ChipBookingStatus
                  status={booking.booking_status ?? -1}
                  className="flex w-full max-w-[190px] flex-wrap md:w-fit"
                />
                {is_manual && (
                  <Badge variant="warning">
                    {checkOrder.order_status === OrderStatusEnum.WaitForIssue
                      ? "Đơn chờ xuất vé"
                      : issueTicketLabel.title}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex w-fit items-center justify-start gap-1 text-xs text-gray-500">
              <CiCalendar className="h-5 w-5" />
              {format(booking.createdAt, "dd/MM/yyyy")}
            </div>

            {booking.payment_status === BookingPaymentStatusEnum.NotPaid &&
              booking.booking_status === BookingStatusEnum.Requested &&
              booking.payment_expired_at && (
                <div className="flex w-fit items-center justify-start gap-1 text-xs text-gray-500">
                  <MdLockClock className="h-5 w-5" />
                  {format(booking.payment_expired_at, "dd/MM/yyyy")}
                </div>
              )}
          </div>
          <span className="w-fit text-base font-bold text-primary md:order-last">{`${formatted.format(booking.total_price)}`}</span>
          <p className="w-full basis-full text-sm font-semibold md:basis-2/4">
            {booking.orderer_name}
          </p>
        </div>
        {depart_order && depart_order.voyage && (
          <div className="flex justify-between overflow-x-auto rounded-md border-2 px-3 py-2">
            <p className="hidden text-sm font-semibold md:flex">
              {depart_order.voyage.operator?.operator_name}
            </p>
            <div className="flex w-fit items-center justify-center gap-2 text-sm font-medium">
              <IoLocationOutline className="hidden h-5 w-5 md:flex" />
              {depart_order.voyage.route?.departure_name ?? ""}
              <IoIosArrowRoundForward className="h-5 w-5" />
              {depart_order.voyage.route?.destination_name ?? ""}
            </div>
            <div className="flex w-fit items-center justify-start gap-1 text-sm">
              <CiCalendar className="h-5 w-5" />
              {format(depart_order.voyage_depart_date, "dd/MM/yyyy")}
            </div>
          </div>
        )}
        {return_order && return_order.voyage && (
          <div className="flex justify-between overflow-x-auto rounded-md border-2 px-3 py-2">
            <p className="hidden text-sm font-semibold md:flex">
              {return_order.voyage.operator?.operator_name}
            </p>

            <div className="flex w-fit items-center justify-center gap-2 text-sm font-medium">
              <IoLocationOutline className="hidden h-5 w-5 md:flex" />
              {return_order.voyage.route?.departure_name ?? ""}
              <IoIosArrowRoundForward className="h-5 w-5" />
              {return_order.voyage.route?.destination_name ?? ""}
            </div>
            <div className="flex w-fit items-center justify-start gap-1 text-sm">
              <CiCalendar className="h-5 w-5" />
              {format(return_order.voyage_depart_date, "dd/MM/yyyy")}
            </div>
          </div>
        )}
      </div>
    </LinkBase>
  );
};
export default memo(UserBookingCard);
