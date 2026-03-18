"use client";

import RouteArrow from "@/components/icons/route-arrow";
import {
  calculateDuration,
  formatCurrency,
  formatHourString,
} from "@/lib/utils";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import { Order } from "@/services/apis/orders/types/order";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { useTranslation } from "@/services/i18n/client";
import { Card, CardBody, Image } from "@heroui/react";
import { format } from "date-fns";
import { memo, useCallback } from "react";
import { CiCalendar } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdEdit } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { VATInvoice } from "@/services/apis/bookings/types/vat-invoice";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import TicketSpeedBadge from "@/components/badge/ticket-speed-badge";
import { RiPencilLine } from "react-icons/ri";
import { UpdatePassengerInfoProps } from "@/services/apis/passengers/types/passenger";

type Props = {
  voyage?: Voyage;
  order?: Order;
  ticketNumbCols?: number;
  tickets: Ticket[];
  boatLayout?: BoatLayout;
  handleClickEditIconButton: () => void;
  isDisabledEdit: boolean;
  VATInvoice?: VATInvoice;
  isCheckEditPassenger: boolean;
  handleEditPassenger: (passenger: UpdatePassengerInfoProps) => void;
  bookingId?: string;
};

function VoyageDetail({
  voyage,
  order,
  ticketNumbCols,
  tickets,
  boatLayout,
  handleClickEditIconButton,
  isDisabledEdit,
  VATInvoice,
  isCheckEditPassenger,
  handleEditPassenger,
  bookingId,
}: Props) {
  const { t } = useTranslation("booking");
  // const { t: seatTranslation } = useTranslation("seat/seat");

  return (
    <>
      {voyage && (
        <Card id={voyage?.id} radius="sm" className="relative">
          <CardBody className="grid grid-cols-12 items-center gap-3 p-3">
            <div className="col-span-12 flex h-fit min-h-12 flex-row justify-between gap-3 md:col-span-4 md:flex-col md:justify-start">
              {/* Operator & Boat info */}
              <div className="flex items-center gap-2">
                {/* Operator logo */}
                <div className="h-12 w-12 flex-none">
                  <Image
                    src={
                      voyage?.operator?.operator_logo?.path ??
                      "/static-img/placeholder-image-500x500.png"
                    }
                    alt={voyage?.operator?.operator_name ?? ""}
                    className="h-full w-full"
                    radius="md"
                  />
                </div>
                {/* Operator name & boat name */}
                <div className="flex flex-col items-start justify-center gap-2">
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <TicketSpeedBadge
                      speed={
                        voyage?.operator?.configs
                          ?.issue_ticket_speed as IssueTicketSpeedEnum
                      }
                    />
                    <p className="whitespace-nowrap text-sm font-semibold">
                      {voyage?.operator?.operator_name}
                    </p>
                  </div>

                  {voyage?.departure_date && (
                    <div className="flex items-center justify-center gap-1">
                      <CiCalendar className="h-5 w-5 text-default-600" />
                      <p className="text-sm text-default-600">
                        {format(new Date(voyage?.departure_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 flex flex-col justify-center gap-3 md:col-span-8 md:items-center">
              {/* Departure & Destination */}
              <div className="flex items-center justify-evenly md:w-full md:justify-evenly">
                {/* Departure */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="text-sm font-bold">
                    {voyage?.route?.departure_name}
                  </p>
                  {voyage?.depart_time && (
                    <p className="text-sm">
                      {formatHourString(voyage?.depart_time)}
                    </p>
                  )}
                </div>
                {/* Icon */}
                <div className="flex flex-col">
                  <div className="flex w-full justify-center text-sm">
                    {calculateDuration(
                      voyage?.depart_time,
                      voyage?.arrive_time
                    )}
                  </div>
                  <RouteArrow color="#000000" />
                </div>
                {/* Destination */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="text-right text-sm font-bold">
                    {voyage?.route?.destination_name}
                  </p>
                  {voyage?.arrive_time && (
                    <p className="text-right text-sm">
                      {formatHourString(voyage?.arrive_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex items-center justify-center gap-3 rounded-md bg-white p-3 shadow-sm">
        <h2 className="text-center text-base font-bold">
          {t("ticket-confirmation.title")}
        </h2>
        {isDisabledEdit === false && (
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="icon"
                onClick={handleClickEditIconButton}
                className="bg-primary-100 text-black hover:text-white"
              >
                <MdEdit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("voyage-tab.tooltip.edit-button")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {order && (
        <div className="flex flex-col gap-2 rounded-md bg-white p-3 shadow-sm">
          <h2 className="text-sm font-bold">
            {t("ticket-confirmation.pic-info.title")}
          </h2>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-sm font-normal md:gap-x-10">
            <div className="flex flex-row gap-1 md:gap-2">
              <span>{t("ticket-confirmation.pic-info.name")}</span>
              <span>{order.orderer_name}</span>
            </div>
            <div className="flex flex-row gap-1 md:gap-2">
              <span>{t("ticket-confirmation.pic-info.phone")}</span>
              <span>{order.phone_number}</span>
            </div>
            <div className="flex flex-row gap-1 md:gap-2">
              <span>{t("ticket-confirmation.pic-info.email")}</span>
              <span>{order.contact_email}</span>
            </div>
            {order?.orderer_social_id && (
              <div className="flex flex-row gap-1 md:gap-2">
                <span>{t("ticket-confirmation.pic-info.socialId")}</span>
                <span>{order.orderer_social_id}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {VATInvoice &&
        VATInvoice.VAT_company_name &&
        VATInvoice.VAT_email &&
        VATInvoice.VAT_tax_number &&
        VATInvoice.VAT_company_address && (
          <div className="flex flex-col gap-2 rounded-md bg-white p-3 shadow-sm">
            <h2 className="text-sm font-bold">Thông tin xuất VAT</h2>
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-sm font-normal md:gap-x-10">
              <div className="flex flex-row gap-1 md:gap-2">
                <span>MST:</span>
                <span>{VATInvoice.VAT_tax_number}</span>
              </div>
              <div className="flex flex-row gap-1 md:gap-2">
                <span>Email:</span>
                <span>{VATInvoice.VAT_email}</span>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 text-sm md:gap-2">
              <span>{VATInvoice.VAT_company_name}</span>
            </div>
            <div className="flex flex-row flex-wrap gap-1 text-sm md:gap-2">
              <span>{VATInvoice.VAT_company_address}</span>
            </div>
          </div>
        )}

      <div className="w-full overflow-hidden overflow-x-scroll lg:overflow-x-auto">
        <div className={`flex w-full flex-row gap-4`}>
          <div
            className="flex flex-none flex-row gap-4 md:grid lg:w-full lg:!grid-cols-2"
            style={{
              gridTemplateColumns: `repeat(${ticketNumbCols}, minmax(320px, 320px))`,
            }}
          >
            {tickets.map((ticket, index) => (
              <TicketCard
                key={index}
                ticket={ticket}
                order={order as Order}
                isCheckEditPassenger={isCheckEditPassenger}
                handleEditPassenger={handleEditPassenger}
                bookingId={bookingId}
                boatLayout={boatLayout as BoatLayout}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type TicketCardProps = {
  ticket: Ticket;
  order: Order;
  isCheckEditPassenger: boolean;
  handleEditPassenger: (passenger: UpdatePassengerInfoProps) => void;
  bookingId?: string;
  boatLayout: BoatLayout;
};
const TicketCard = ({
  ticket,
  order,
  isCheckEditPassenger,
  handleEditPassenger,
  bookingId,
  boatLayout,
}: TicketCardProps) => {
  const { t } = useTranslation("booking");
  const { t: seatTranslation } = useTranslation("seat/seat");
  const onClick = useCallback(() => {
    handleEditPassenger({
      orderId: order?.id ?? "",
      seatName: ticket.seat_name,
      bookingId: bookingId ?? "",
      passengerName: ticket.name,
      passengerSocialId: ticket.social_id,
      passengerConfig: order?.voyage?.operator?.configs?.passenger_inputs,
    });
  }, [
    bookingId,
    handleEditPassenger,
    order?.id,
    order?.voyage?.operator?.configs?.passenger_inputs,
    ticket.name,
    ticket.seat_name,
    ticket.social_id,
  ]);
  return (
    <div
      className={`flex w-72 flex-col gap-3 rounded-md bg-white p-3 md:w-80 md:flex-none lg:col-span-1 lg:w-full`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">
          {t("ticket-confirmation.ticket-detail.passenger-info.title")}
        </h2>
        {isCheckEditPassenger && (
          <Button
            variant="default"
            size="sm"
            onClick={onClick}
            className="h-8 w-8 p-0"
          >
            <RiPencilLine className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5 flex flex-col text-sm font-normal">
            <div className="">
              {t("ticket-confirmation.ticket-detail.passenger-info.name")}
            </div>
            <div className="">{ticket.name}</div>
          </div>
          <div className="col-span-4 flex flex-col text-sm font-normal">
            <div className="">
              {t(
                "ticket-confirmation.ticket-detail.passenger-info.dateOfBirth"
              )}
            </div>
            <div className="">
              {format(new Date(`${ticket.date_of_birth}`), "dd/MM/yyyy")}
            </div>
          </div>
          {ticket.gender !== undefined && (
            <div className="col-span-3 flex flex-col text-sm font-normal">
              <div className="h-fit w-full">
                {t(
                  "ticket-confirmation.ticket-detail.passenger-info.gender.title"
                )}
              </div>
              <div className="">
                {t(
                  `ticket-confirmation.ticket-detail.passenger-info.gender.${TicketGenderEnum[ticket.gender].toLocaleLowerCase()}`
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t("ticket-confirmation.ticket-detail.passenger-info.socialId")}
            </div>
            <div className="">{ticket.social_id}</div>
          </div>
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t(
                "ticket-confirmation.ticket-detail.passenger-info.nationality"
              )}
            </div>
            <div className="">{ticket.national}</div>
          </div>
        </div>
        {ticket.plate_number && (
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t(
                "ticket-confirmation.ticket-detail.passenger-info.plate-number"
              )}
            </div>
            <div className="">{ticket.plate_number}</div>
          </div>
        )}
      </div>
      <hr className="border-t-2 border-dashed border-default-700" />
      <h2 className="text-sm font-bold">
        {t("ticket-confirmation.ticket-detail.seat-info.title")}
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t("ticket-confirmation.ticket-detail.seat-info.ticket-type")}
            </div>
            <div className="">
              {boatLayout?.ticket_type_configs.find(
                (type) => type.ticket_type_id === ticket.ticket_type_id
              )?.ticket_type_label ?? ticket.ticket_type_id}
            </div>
          </div>
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t("ticket-confirmation.ticket-detail.seat-info.seat-type")}
            </div>
            <div className="">
              {seatTranslation("seatType." + ticket.seat_type_code)}
            </div>
          </div>
          <div className="flex flex-col text-sm font-normal">
            <div className="">
              {t("ticket-confirmation.ticket-detail.seat-info.seat-name")}
            </div>
            <div className="">{ticket.seat_name}</div>
          </div>
        </div>
      </div>
      <hr className="border-t-2 border-dashed border-default-700" />
      <h2 className="text-sm font-bold">
        {t("ticket-confirmation.ticket-detail.ticket-info.title")}
      </h2>
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-normal">
          {t("ticket-confirmation.ticket-detail.ticket-info.price")}
        </div>
        <div className="gap-2 rounded-md px-2 py-0.5 text-sm font-bold text-danger">
          {`${formatCurrency(ticket?.price ?? 0)}`}
        </div>
      </div>
    </div>
  );
};

export default memo(VoyageDetail);
