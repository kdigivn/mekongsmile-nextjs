import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, formatCurrency } from "@/lib/utils";
import { Booking } from "@/services/apis/bookings/types/booking";
import {
  OperatorOrderErrors,
  BookingValidationErrors,
} from "@/services/apis/common/types/common-errors";
import { Order } from "@/services/apis/orders/types/order";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { format, formatDate, isBefore } from "date-fns";
import { useState, useCallback, memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import PaymentModal from "../modal/payment-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import TicketSpeedBadge from "@/components/badge/ticket-speed-badge";
import { useDisclosure } from "@heroui/react";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import { RiPencilLine } from "react-icons/ri";
import { UpdatePassengerInfoProps } from "@/services/apis/passengers/types/passenger";
import UpdatePassengerDialog from "@/components/dialog/update-passenger-dialog";
import CreateCancelTicketRequestDialog from "@/components/dialog/cancel-ticket-request/create-cancel-ticket-request-dialog-by-step";
import { TbCalendarCancel, TbDownload } from "react-icons/tb";
import { useBoolean } from "@/hooks/use-boolean";
import { getTicketStatusName } from "@/lib/get-ticket-status";
import {
  getTicketPaymentStatusStyles,
  getTicketPaymentStatusText,
  getTicketStatusStyles,
} from "@/components/table/user-cancel-ticket-request/helper/helper";
import Image from "next/image";
import ChipOrderStatus from "@/components/chip/chip-order-status";
import EInvoiceInformationSection from "../sections/eInvoice-information-section";
import LinkBase from "@/components/link-base";

type Error = {
  errorCode: number;
  message: string;
};

type OrderInfoCardProps = {
  order: Order;
  isDisabledEdit?: boolean;
  handleClickEditIconButton?: () => void;
  booking: Booking;
};

function OrderInfoCard({
  order,
  isDisabledEdit,
  handleClickEditIconButton,
  booking,
}: OrderInfoCardProps) {
  const openCancelTicketRequestDialog = useBoolean(false);

  const { t } = useTranslation("user/booking-detail");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenPaymentModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const scrollToPaymentSection = useCallback(() => {
    const paymentSection = document.getElementById("paymentSection");
    if (paymentSection) {
      paymentSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const { isOpen: isOpenWarning } = useDisclosure();

  const { hideNav, showNav } = useMobileBottomNavActions();
  useEffect(() => {
    if (isOpenWarning) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, isOpenWarning, showNav]);

  const [isEditPassengerModalOpen, setIsEditPassengerModalOpen] =
    useState(false);
  const [passengerToEdit, setPassengerToEdit] =
    useState<UpdatePassengerInfoProps | null>(null);
  const handleEditPassenger = useCallback(
    (passenger: UpdatePassengerInfoProps) => {
      setPassengerToEdit(passenger);
      setIsEditPassengerModalOpen(true);
    },
    []
  );

  const handleCloseEditPassengerModal = useCallback(() => {
    setIsEditPassengerModalOpen(false);
    setPassengerToEdit(null);
  }, []);

  const getDuplicateSocialIdOperatorName = useCallback(
    (error: Error) => {
      const name = [
        ...((booking?.depart_order?.tickets as Ticket[]) ?? []),
        ...((booking?.return_order?.tickets as Ticket[]) ?? []),
      ].find((ticket: Ticket) => {
        return ticket.social_id === error?.message;
      })?.name;
      if (!name || name === "") return error?.message;
      return name;
    },
    [booking?.depart_order?.tickets, booking?.return_order?.tickets]
  );

  const renderErrorContent = (error: Error) => {
    switch (error.errorCode) {
      case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
        return (
          <>
            {/* <div className="text-base font-semibold">
                  Hãy liên hệ hotline: 0924299898
                </div> */}

            <div className="flex items-center gap-2">
              <p>{t("export-ticket-modal.errorBookedSeatExport")}</p>
              {isDisabledEdit === false && (
                <Button
                  className="!w-fit flex-none gap-1 rounded-md bg-primary py-2 text-white hover:bg-primary/50"
                  onClick={handleClickEditIconButton}
                >
                  {t("export-ticket-modal.returnBookingStep2")}
                </Button>
              )}
            </div>
          </>
        );
      case BookingValidationErrors.CustomerBalanceNotEnough:
        return (
          <div className="flex items-center gap-2">
            {t("export-ticket-modal.errorCustomerBalanceNotEnough")}
            <Button
              // Open payment modal similar to above paymen section
              onClick={
                booking?.depart_order?.issue_ticket_error &&
                booking?.depart_order?.order_status !== OrderStatusEnum.Booked
                  ? scrollToPaymentSection
                  : handleOpenPaymentModal
              }
            >
              Thanh toán
            </Button>
          </div>
        );
      case OperatorOrderErrors.DuplicateSocialIdOperator:
        return (
          <div className="flex flex-col items-center gap-2">
            {t("export-ticket-modal.errorDuplicateSocialIdOperator")}
            <span className="font-bold">
              {getDuplicateSocialIdOperatorName(error)}
            </span>
            {isDisabledEdit === false && (
              <div className="flex w-full flex-row justify-end gap-2">
                <Button
                  className="!w-fit flex-none gap-1 rounded-md bg-primary py-2 text-white hover:bg-primary/50"
                  onClick={handleClickEditIconButton}
                >
                  {t("export-ticket-modal.returnBookingStep2")}
                </Button>
              </div>
            )}
          </div>
        );
      case BookingValidationErrors.OrganizationBalanceNotEnough:
        return (
          <div className="flex items-center gap-2">
            {t("export-ticket-modal.ticket_export_error", {
              errorCode: error.errorCode,
            })}
            <Button
              // Open payment modal similar to above paymen section
              onClick={
                booking?.depart_order?.issue_ticket_error &&
                booking?.depart_order?.order_status !== OrderStatusEnum.Booked
                  ? scrollToPaymentSection
                  : handleOpenPaymentModal
              }
            >
              Thanh toán
            </Button>
          </div>
        );
      default:
        return <>{t("export-ticket-modal.errorUknown")}</>;
    }
  };

  const handleOpenCancelTicketRequest = useCallback(() => {
    openCancelTicketRequestDialog.onTrue();
  }, [openCancelTicketRequestDialog]);

  const handleCloseCancelTicketRequest = useCallback(() => {
    openCancelTicketRequestDialog.onFalse();
  }, [openCancelTicketRequestDialog]);

  const isManual =
    order.voyage?.operator?.configs?.issue_ticket_speed !==
    IssueTicketSpeedEnum.INSTANT;

  return (
    <>
      <div className="relative flex flex-col gap-2 rounded-lg border-1 border-white bg-white">
        {order?.issue_ticket_error &&
        order.order_status !== OrderStatusEnum.Booked &&
        order.order_status !== OrderStatusEnum.WaitForIssue
          ? renderErrorContent(JSON.parse(order?.issue_ticket_error as string))
          : ""}

        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              {order.tickets_file?.path && (
                <LinkBase
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "flex items-center gap-2"
                  )}
                  href={order.tickets_file?.path}
                  target="_blank"
                  download
                >
                  <TbDownload className="mr-2 h-5 w-5" />
                  <span>{t("button.download")}</span>
                </LinkBase>
              )}

              {order.order_status === OrderStatusEnum.Booked && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenCancelTicketRequest}
                  className="flex items-center gap-2"
                >
                  <TbCalendarCancel className="mr-2 h-5 w-5" />
                  <span>Hủy vé</span>
                </Button>
              )}
            </div>
            <div className="flex w-full flex-row items-center">
              <IoLocationOutline className="text-lg" />
              <span className="text-md flex items-center justify-center font-bold">
                {order.voyage ? (
                  <>
                    {order.voyage.route?.departure_name}
                    <IoIosArrowRoundForward className="inline text-lg" />
                    {order.voyage.route?.destination_name}
                  </>
                ) : (
                  "Chuyến tàu không còn tồn tại"
                )}
              </span>
            </div>
            {order.voyage && (
              <div className="flex w-full flex-col">
                <div className="flex items-center justify-between gap-2">
                  <p>
                    <span className="font-semibold">{t("order")}: </span>
                    <TicketSpeedBadge
                      speed={
                        order.voyage.operator?.configs
                          ?.issue_ticket_speed as IssueTicketSpeedEnum
                      }
                    />{" "}
                    {t("order-detail-information.ferry-ticket")}{" "}
                    {order.voyage.operator?.operator_name}
                  </p>
                  {/* {order.issue_ticket_error &&
                order.order_status !== OrderStatusEnum.Booked
                  ? renderErrorContent(
                      JSON.parse(order.issue_ticket_error as string)?.errorCode
                    )
                  : ""} */}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {`${t("order-detail-information.boat")}: `}
                  </span>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <div className="h-6 w-6 rounded-s-full">
                      <Image
                        src={`${order.voyage.operator?.operator_logo?.path}`}
                        alt={`${order.voyage.operator?.operator_name}`}
                        width={24}
                        height={24}
                        loading="lazy"
                        className="h-full w-full rounded-s-full"
                        unoptimized
                      />
                    </div>
                    <span>{`${order.voyage.boat_name ?? order.voyage.operator?.operator_name}`}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold">
                    {t("order-detail-information.depart-date")}:{" "}
                  </span>{" "}
                  {`${format(new Date(`${order.voyage.departure_date}T${order.voyage.depart_time}`), "HH:mm dd/MM/yyyy")}`}
                  {/* {formatDate(
                  booking.depart_order.voyage.departure_date,
                  "hh:mm dd/MM/yyyy"
                )} */}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {t("order-detail-information.order-status")}:{" "}
                  </span>{" "}
                  <ChipOrderStatus
                    status={order.order_status}
                    isManual={isManual}
                  />
                  {/* {formatDate(
                  booking.depart_order.voyage.departure_date,
                  "hh:mm dd/MM/yyyy"
                )} */}
                </div>
                <div className="flex gap-2 pt-2">
                  <span className="font-semibold">
                    {t("order-detail-information.price")}:{" "}
                  </span>{" "}
                  {`${formatCurrency(order.total_ticket_price)}`}
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold">
                    {t("order-detail-information.harbor-fee")}:{" "}
                  </span>{" "}
                  {`${formatCurrency(order.total_harbor_fee)}`}
                </div>
                {(order?.total_discount ?? 0) > 0 && (
                  <div className="flex gap-2">
                    <span className="font-semibold">
                      {t("order-detail-information.discount")}:{" "}
                    </span>{" "}
                    {`-${formatCurrency(order?.total_discount ?? 0)}`}
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-semibold">
                    {t("order-detail-information.total")}:{" "}
                  </span>{" "}
                  {`${formatCurrency(order.total_price)}`}
                </div>

                {order.eInvoice && (
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold">{`${t("e-invoice.label")}:`}</p>
                    <div className="w-full rounded-md border border-dashed border-gray-400 p-2">
                      <EInvoiceInformationSection order={order} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <span className="font-sm font-semibold">
          {t("order-detail-information.passenger-list")}
        </span>
        <div className="flex flex-col gap-3">
          {order.tickets.map((ticket, idx) => (
            <TicketAccordion
              key={idx}
              ticket={ticket}
              value={idx}
              order={order}
              bookingId={booking.id}
              handleEditPassenger={handleEditPassenger}
            />
          ))}
        </div>
        <PaymentModal isOpen={isOpen} setIsOpen={setIsOpen} booking={booking} />
        <UpdatePassengerDialog
          requestOrderInfo={passengerToEdit}
          isOpen={isEditPassengerModalOpen}
          onClose={handleCloseEditPassengerModal}
        />
      </div>

      <CreateCancelTicketRequestDialog
        open={openCancelTicketRequestDialog.value}
        onClose={handleCloseCancelTicketRequest}
        order={order}
      />
    </>
  );
}

type TicketAccordionProps = {
  ticket: Ticket;
  value: number;
  order: Order;
  bookingId: string;
  handleEditPassenger: (passenger: UpdatePassengerInfoProps) => void;
};

function TicketAccordion({
  ticket,
  value,
  handleEditPassenger,
  order,
  bookingId,
}: TicketAccordionProps) {
  const { t } = useTranslation("user/booking-detail");

  const { t: tCancelTicketRequest } = useTranslation(
    "user/cancel-ticket-request"
  );

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleEditPassenger({
        orderId: order.id,
        bookingId,
        seatName: ticket.seat_name,
        passengerName: ticket.name,
        passengerSocialId: ticket.social_id,
        passengerConfig: order.voyage?.operator?.configs?.passenger_inputs,
      });
    },
    [
      bookingId,
      handleEditPassenger,
      order.id,
      order.voyage?.operator?.configs?.passenger_inputs,
      ticket.name,
      ticket.seat_name,
      ticket.social_id,
    ]
  );

  const checkIsExpired = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${order?.voyage?.departure_date}T${order?.voyage?.depart_time}`
    );
    return isBefore(now, departDate);
  }, [order?.voyage?.depart_time, order?.voyage?.departure_date]);

  return (
    <Accordion type="single" collapsible defaultValue={"0"}>
      <AccordionItem
        value={`${value}`}
        className="flex flex-col gap-3 rounded-lg border-1 border-default-300 p-4"
      >
        <AccordionTrigger className="flex w-full flex-row justify-between gap-3 py-0 hover:no-underline">
          <div className="flex w-full flex-row justify-between text-sm font-semibold">
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col gap-1">
                <span
                  className={`${getTicketStatusStyles(ticket.ticket_status)} rounded-md px-2 py-1 text-xs`}
                >
                  {getTicketStatusName(ticket.ticket_status)}
                </span>

                <span
                  className={`flex items-center whitespace-nowrap rounded-md px-2 py-1 text-xs ${getTicketPaymentStatusStyles(ticket.ticket_payment_status)}`}
                >
                  {getTicketPaymentStatusText(
                    ticket.ticket_payment_status,
                    tCancelTicketRequest
                  )}
                </span>
              </div>

              <span>{ticket.name}</span>

              {order.voyage?.operator?.features?.change_passenger_info &&
              order.order_status === OrderStatusEnum.Booked &&
              checkIsExpired ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClick}
                  className="h-8 w-8 p-0"
                >
                  <RiPencilLine className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              ) : (
                <></>
              )}

              <div className="hidden rounded-lg bg-primary-100 px-3 py-1 text-xs font-normal md:block lg:hidden">
                {ticket.is_child ? "Trẻ em" : "Người lớn"}
              </div>
            </div>

            <span className="flex flex-row items-center">{`${ticket.seat_name} - ${ticket.seat_type_code}`}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-col gap-2 text-sm font-normal">
              {ticket.gender !== undefined && (
                <span>{`Giới tính: ${t(
                  `table.header.gender.${TicketGenderEnum[ticket.gender as TicketGenderEnum].toLowerCase()}`
                )}`}</span>
              )}
              <span>{`Ngày sinh: ${formatDate(ticket.date_of_birth, "dd/MM/yyyy")}`}</span>
              <span>{`Địa chỉ: ${ticket.home_town}`}</span>
              <span>{`Quốc tịch: ${ticket.national}`}</span>
              <span>{`CCCD/ Hộ chiếu: ${ticket.social_id}`}</span>
              {ticket.plate_number && (
                <span>{`Biển số xe: ${ticket.plate_number}`}</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-sm font-normal">
              <span>Giá vé</span>
              <span className="text-base font-bold">{`${formatCurrency(ticket.price)}`}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default memo(OrderInfoCard);
