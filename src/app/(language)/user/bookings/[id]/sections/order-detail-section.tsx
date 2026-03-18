"use client";

import { getPassengerColumns } from "@/components/table/passengers/passengers-columns";
import PassengerDataTable from "@/components/table/passengers/passengers-data-table";
import { Button } from "@/components/ui/button";
import { Order } from "@/services/apis/orders/types/order";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import {
  PassengerConfig,
  UpdatePassengerInfoProps,
} from "@/services/apis/passengers/types/passenger";
import { useTranslation } from "@/services/i18n/client";
import { cn } from "@heroui/react";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { memo, useCallback, useMemo, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { format, isBefore } from "date-fns";
import ErrorContent from "@/components/error-content";
import { BookingValidationErrors } from "@/services/apis/common/types/common-errors";
import { Booking } from "@/services/apis/bookings/types/booking";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import TicketSpeedBadge from "@/components/badge/ticket-speed-badge";
import UpdatePassengerDialog from "@/components/dialog/update-passenger-dialog";
import CreateCancelTicketRequestDialog from "@/components/dialog/cancel-ticket-request/create-cancel-ticket-request-dialog-by-step";
import { useBoolean } from "@/hooks/use-boolean";
import { TbCalendarCancel, TbDownload } from "react-icons/tb";
import { formatCurrency } from "@/lib/utils";
import ChipOrderStatus from "@/components/chip/chip-order-status";
import EInvoiceInformationSection from "./eInvoice-information-section";

interface Props {
  order: Order;
  handleDownloadFileCallback: () => void;
  isDisabledEdit?: boolean;
  booking?: Booking;
  handleClickEditIconButton?: () => void;
  handleOpenPaymentModal?: () => void;
  scrollToPaymentSection?: () => void;
}

const OrderDetailModal = ({
  order,
  handleDownloadFileCallback,
  isDisabledEdit,
  booking,
  handleClickEditIconButton,
  handleOpenPaymentModal,
  scrollToPaymentSection,
}: Props) => {
  const { t } = useTranslation("user/booking-detail");

  const { t: tCancelTicketRequest } = useTranslation(
    "user/cancel-ticket-request"
  );
  const [
    isPassengerDepartTableCollapsibleOpen,
    setIsPassengerDepartTableCollapsibleOpen,
  ] = useState(true);
  const openCancelTicketRequestDialog = useBoolean(false);

  const handleOpenCancelTicketRequest = useCallback(() => {
    openCancelTicketRequestDialog.onTrue();
  }, [openCancelTicketRequestDialog]);

  const handleCloseCancelTicketRequest = useCallback(() => {
    openCancelTicketRequestDialog.onFalse();
  }, [openCancelTicketRequestDialog]);

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

  const checkIsExpired = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${order?.voyage?.departure_date}T${order?.voyage?.depart_time}`
    );
    return isBefore(now, departDate);
  }, [order?.voyage?.depart_time, order?.voyage?.departure_date]);

  const isManual =
    order.voyage?.operator?.configs?.issue_ticket_speed !==
    IssueTicketSpeedEnum.INSTANT;

  return (
    <>
      <div className="relative flex w-full flex-col gap-3 rounded-md border-1 border-dashed border-default p-3">
        {order.voyage ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-row items-center justify-start gap-2">
                <p>
                  <span className="font-semibold">{t("order")}: </span>
                  {t("order-detail-information.ferry-ticket")}{" "}
                  {order.voyage.operator?.operator_name}
                </p>
              </div>
              {order.issue_ticket_error &&
              order.order_status !== OrderStatusEnum.Booked &&
              order.order_status !== OrderStatusEnum.WaitForIssue ? (
                <ErrorContent
                  error={JSON.parse(order.issue_ticket_error as string)}
                  tName="booking"
                  isDisabledEdit={isDisabledEdit}
                  bookingData={booking}
                  showRetryButton={false}
                  handleClickEditIconButton={handleClickEditIconButton}
                  handleOpenPaymentModal={handleOpenPaymentModal}
                  scrollToPaymentSection={scrollToPaymentSection}
                  variant={
                    JSON.parse(order.issue_ticket_error as string)
                      ?.errorCode ===
                      BookingValidationErrors.CustomerBalanceNotEnough ||
                    JSON.parse(order.issue_ticket_error as string)
                      ?.errorCode ===
                      BookingValidationErrors.OrganizationBalanceNotEnough
                      ? "payment"
                      : "default"
                  }
                />
              ) : (
                //       renderErrorContent(
                //   JSON.parse(order.issue_ticket_error as string)?.errorCode
                // )
                ""
              )}

              <div className="flex items-center gap-2">
                {order.tickets_file?.path && (
                  <Button
                    size={"sm"}
                    type="submit"
                    onClick={handleDownloadFileCallback}
                    className="flex items-center gap-2"
                  >
                    <TbDownload className="mr-2 h-5 w-5" />
                    <span className="text-sx">{t("button.download")}</span>
                  </Button>
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
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-start gap-1 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      {`${t("order-detail-information.boat")}: `}
                    </span>
                    <div className="relative inline-flex h-6 w-6 rounded-s-full">
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
                  </div>
                  <div className="flex items-center gap-1">
                    <TicketSpeedBadge
                      speed={
                        order.voyage.operator?.configs
                          ?.issue_ticket_speed as IssueTicketSpeedEnum
                      }
                    />
                    <span>{`${order.voyage.boat_name ?? order.voyage.operator?.operator_name}`}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold">
                    {`${t("order-detail-information.route")}: `}
                  </span>
                  <span>
                    {`${order.voyage.route?.departure_name} - ${order.voyage.route?.destination_name}`}
                  </span>
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
                </div>

                {/* E-Invoice section */}
                {order.eInvoice && (
                  <>
                    <p className="font-semibold">{`${t("e-invoice.label")}:`}</p>
                    <div className="w-full rounded-md border border-dashed border-gray-400 p-3">
                      <EInvoiceInformationSection order={order} />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
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
                {order?.total_discount && order?.total_discount > 0 ? (
                  <div className="flex gap-2">
                    <span className="font-semibold">
                      {t("order-detail-information.discount")}:{" "}
                    </span>{" "}
                    {`-${formatCurrency(order?.total_discount)}`}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <span className="font-semibold">
                    {t("order-detail-information.total")}:{" "}
                  </span>{" "}
                  {`${formatCurrency(order.total_price)}`}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>
            <span className="font-semibold">Chuyến tàu không còn tồn tại</span>
          </p>
        )}
        <div className="">
          <Collapsible
            defaultOpen
            open={isPassengerDepartTableCollapsibleOpen}
            onOpenChange={setIsPassengerDepartTableCollapsibleOpen}
          >
            <CollapsibleTrigger asChild>
              <div className="flex flex-row items-center gap-3">
                <p className="font-semibold lg:text-base">{t("table.title")}</p>
                <Button variant="ghost" size="lg" className="!p-0">
                  <RiArrowDownSLine
                    className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      isPassengerDepartTableCollapsibleOpen && "rotate-180"
                    )}
                  />
                  <span className="sr-only"></span>
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 w-full">
              <PassengerDataTable
                columns={getPassengerColumns(
                  order.voyage?.operator?.configs
                    .passenger_inputs as PassengerConfig,
                  handleEditPassenger,
                  order.id,
                  booking?.id,
                  order.voyage?.operator?.features?.change_passenger_info &&
                    order.order_status === OrderStatusEnum.Booked &&
                    checkIsExpired,
                  tCancelTicketRequest
                )}
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                data={order.tickets || []}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
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
};

export default memo(OrderDetailModal);
