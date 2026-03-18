"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatCurrency,
  getFormateVoyageDate,
  getRouteBackgroundColor,
} from "@/lib/utils";
import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import React, { memo, useCallback, useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import {
  IoIosCalendar,
  IoIosCard,
  IoIosHome,
  IoIosPerson,
  IoIosPricetag,
} from "react-icons/io";
import { MdOutlineChair } from "react-icons/md";
import { TbMapPin } from "react-icons/tb";
import {
  getTicketPaymentStatusStyles,
  getTicketPaymentStatusText,
  getTicketStatusStyles,
  getTicketStatusText,
} from "../helper/helper";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import LinkBase from "@/components/link-base";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";

type Props = {
  data: CancelTicketRequest;
};

const OrderCell = ({ data }: Props) => {
  const { t } = useTranslation("user/cancel-ticket-request");

  const { organization_related, booking_id } = data;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  const handleCopyBookingId = useCallback(() => {
    navigator.clipboard.writeText(booking_id ?? "");
    setIsCopied(true);
  }, [booking_id]);

  if (organization_related.length <= 0) {
    return <div>{t("table.order-cell.no_order_info")}</div>;
  }

  const order = organization_related[0]?.order;

  if (!order) {
    return <div>{t("table.order-cell.no_order_info")}</div>;
  }

  return (
    order &&
    order.voyage && (
      <div className="flex flex-col gap-2 rounded-lg bg-gray-100 p-2">
        {/* Thông tin vé */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-sm font-semibold">
            {t("table.order-cell.booking_id")}:{" "}
          </span>
          <div className="flex items-center">
            <LinkBase
              className="flex items-center text-sm font-semibold text-primary-500 hover:underline"
              href={`/user/bookings/${booking_id}`}
              target="_blank"
            >
              {booking_id || "-"}
            </LinkBase>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyBookingId}
              disabled={isCopied}
              className="hover:opacity-70"
            >
              {isCopied ? (
                <LuCopyCheck className="h-4 w-4" />
              ) : (
                <LuCopy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-sm font-semibold">
            {t("table.order-cell.route")}:{" "}
          </span>
          <span
            className={`rounded ${getRouteBackgroundColor(order?.voyage?.route_id ?? 0)} px-2 py-1 text-xs text-white`}
          >
            {order?.voyage?.route?.departure_name ||
              t("table.order-cell.departure_name")}
            -
            {order?.voyage?.route?.destination_name ||
              t("table.order-cell.destination_name")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={order?.voyage?.operator?.operator_logo?.path} />
            <AvatarFallback>
              <FiUser className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="text-sm">
            {order?.voyage?.operator?.operator_name ||
              t("table.order-cell.operator")}
          </div>
          <div className="text-sm">
            {" "}
            - {order?.voyage?.boat_name || t("table.order-cell.boat_name")}
          </div>
        </div>

        <div className="text-sm">
          <span className="text-sm font-semibold">
            {t("table.order-cell.departure_date")}:{" "}
          </span>
          {getFormateVoyageDate(
            order?.voyage?.departure_date ?? null,
            order?.voyage?.depart_time ?? null
          ) ?? t("table.order-cell.invalid_date")}
        </div>

        {/* Passengers List */}
        <div className="text-sm font-semibold">
          {t("table.order-cell.passenger_list")}:{" "}
        </div>

        <ul className="my-0 flex w-full max-w-full list-outside list-none list-image-none flex-col flex-nowrap gap-2 overflow-x-auto py-0 pl-3 text-sm">
          {order?.tickets?.length ? (
            order.tickets.map((ticket, index) => (
              <li key={index} className="flex items-center gap-2">
                <TooltipResponsive>
                  <TooltipResponsiveTrigger asChild>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold hover:cursor-pointer ${data.cancel_ticket_by_positions.includes(ticket.position_id) ? "bg-red-200" : "bg-primary-100"}`}
                    >
                      {ticket.seat_name || t("table.order-cell.seat")}
                    </span>
                  </TooltipResponsiveTrigger>
                  <TooltipResponsiveContent className="bg-primary-500 text-white">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <IoIosPerson />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.passenger")}:
                        </span>
                        {ticket.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <IoIosCalendar />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.date_of_birth")}:
                        </span>
                        {ticket.date_of_birth}
                      </div>
                      <div className="flex items-center gap-2">
                        <IoIosCard />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.social_id")}:
                        </span>
                        {ticket.social_id}
                      </div>
                      <div className="flex items-center gap-2">
                        <IoIosHome />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.home_town")}:
                        </span>
                        {ticket.home_town}
                      </div>
                      <div className="flex items-center gap-2">
                        <MdOutlineChair />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.seat")}:
                        </span>
                        {ticket.seat_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <IoIosPricetag />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.seat_type")}:
                        </span>
                        {ticket.seat_type_code}
                      </div>
                      <div className="flex items-center gap-2">
                        <TbMapPin />
                        <span className="text-xs font-semibold">
                          {t("table.order-cell.position")}:{" "}
                        </span>
                        {ticket.position_id}
                      </div>
                    </div>
                  </TooltipResponsiveContent>
                </TooltipResponsive>

                <span className="whitespace-nowrap">{ticket.name}</span>
                <span className="whitespace-nowrap">
                  {ticket.seat_type_code}
                </span>
                <span className="whitespace-nowrap font-semibold">
                  {formatCurrency(
                    (ticket.price ?? 0) + (ticket.harbor_fee ?? 0)
                  )}
                </span>
                <span
                  className={`flex items-center whitespace-nowrap rounded-md px-2 py-1 text-xs ${getTicketStatusStyles(ticket.ticket_status)}`}
                >
                  {getTicketStatusText(ticket.ticket_status, t)}
                </span>
                <span
                  className={`flex items-center whitespace-nowrap rounded-md px-2 py-1 text-xs ${getTicketPaymentStatusStyles(ticket.ticket_payment_status)}`}
                >
                  {getTicketPaymentStatusText(ticket.ticket_payment_status, t)}
                </span>
              </li>
            ))
          ) : (
            <li>{t("table.order-cell.no_passengers")}</li>
          )}
        </ul>
      </div>
    )
  );
};

export default memo(OrderCell);
