"use client";

import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Booking } from "@/services/apis/bookings/types/booking";
import {
  BookingUnknownErrors,
  BookingValidationErrors,
  OperatorOrderErrors,
  OrderIssueTicketErrors,
} from "@/services/apis/common/types/common-errors";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { useTranslation } from "@/services/i18n/client";
import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { memo, useCallback, useEffect } from "react";
import { RiMessage3Line } from "react-icons/ri";

type Error = {
  errorCode?: number;
  message?: string;
};
type Props = {
  booking: Booking;
  isOpenConfirmExportTicket: boolean;
  setIsOpenConfirmExportTicket?: (isOpen: boolean) => void;
  isConfirmExportTicket: boolean;
  handleConfirmIssueTicket: () => void;
  handleReturnStep2: () => void;
  isDisabledEdit?: boolean;
  error?: Error;
};

const ConfirmExportTicketModal = ({
  booking,
  setIsOpenConfirmExportTicket,
  isConfirmExportTicket,
  isOpenConfirmExportTicket,
  handleConfirmIssueTicket,
  handleReturnStep2,
  isDisabledEdit,
  error,
}: Props) => {
  const { t } = useTranslation("booking");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpenConfirmExportTicket) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpenConfirmExportTicket, showNav]);

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

  const renderErrorContent = () => {
    switch (error?.errorCode) {
      case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorBookedSeatExport")}
            </div>
            {/* <div className="text-base font-semibold">
                Hãy liên hệ hotline: 0924299898
              </div> */}
            <div className="flex w-full flex-row gap-3">
              {/* <Button
                  className="flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                  onClick={() => setIsOpenConfirmExportTicket(false)}
                >
                  {t("export-ticket-modal.cancel")}
                </Button> */}
              {isDisabledEdit === false && (
                <Button
                  className="flex-1 gap-1 rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/50"
                  onClick={handleReturnStep2}
                >
                  {t("export-ticket-modal.returnBookingStep2")}
                </Button>
              )}
            </div>
          </>
        );
      case OperatorOrderErrors.DuplicateSocialIdOperator:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="text-base font-normal">
                {t("export-ticket-modal.errorDuplicateSocialIdOperator")}
              </div>
              <div className="text-base font-normal">
                {getDuplicateSocialIdOperatorName(error)}
              </div>
            </div>
            <div className="flex w-full flex-row gap-3">
              {isDisabledEdit === false && (
                <Button
                  className="flex-1 gap-1 rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/50"
                  onClick={handleReturnStep2}
                >
                  {t("export-ticket-modal.returnBookingStep2")}
                </Button>
              )}
            </div>
          </>
        );
      case BookingUnknownErrors.Unknown:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorUknown")}
            </div>
          </>
        );
      case BookingValidationErrors.AlreadyProcessingIssueTicket:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorProcessingIssueTicket")}
            </div>
          </>
        );
      case BookingValidationErrors.CustomerBalanceNotEnough:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorCustomerBalanceNotEnough")}
            </div>
          </>
        );
      case BookingValidationErrors.InvalidInput:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorInvalidInput")}
            </div>
          </>
        );
      case BookingValidationErrors.InvalidStatus:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorInvalidStatus")}
            </div>
          </>
        );
      case BookingValidationErrors.NoCustomerAttached:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorNoCustomerAttached")}
            </div>
          </>
        );
      case BookingValidationErrors.OrganizationBalanceNotEnough:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.ticket_export_error", {
                errorCode: error?.errorCode,
              })}
            </div>
          </>
        );

      case OrderIssueTicketErrors.UnavailableSeats:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorUnavailableSeats")}
            </div>
          </>
        );
      default:
        return (
          <>
            <RiMessage3Line className="h-12 w-12" />
            <div className="text-lg font-semibold">
              {t("export-ticket-modal.export")}
              <span className="text-danger">
                {t("export-ticket-modal.export-fail")}
              </span>
            </div>
            <div className="text-base font-normal">
              {t("export-ticket-modal.errorUknown")}
            </div>
          </>
        );
    }
  };

  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isOpenConfirmExportTicket}
      size="xl"
      backdrop="blur"
      radius="sm"
      onOpenChange={setIsOpenConfirmExportTicket}
    >
      <ModalContent>
        {() =>
          isConfirmExportTicket === false ? (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              <RiMessage3Line className="h-12 w-12" />
              <>
                <div className="text-lg font-semibold">
                  {t("export-ticket-modal.confirm")}{" "}
                  <span className="text-primary">
                    {t("export-ticket-modal.exportTicket")}
                  </span>
                </div>
                <div className="text-base font-normal">
                  {t("export-ticket-modal.pleaseConfirm")}
                </div>
                <div className="text-base font-normal">
                  {t("export-ticket-modal.totalMoney")}{" "}
                  <span className="text-primary">
                    {formatCurrency(booking?.total_price)}
                  </span>
                </div>
                <div className="text-base">
                  {t("export-ticket-modal.noteConfirm")}
                </div>
                <div className="flex w-full flex-row gap-3">
                  <Button
                    className="flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                    onClick={() => {
                      if (setIsOpenConfirmExportTicket) {
                        setIsOpenConfirmExportTicket(false);
                      }
                    }}
                  >
                    {t("export-ticket-modal.cancel")}
                  </Button>
                  <Button
                    className="flex-1 gap-1 rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/50"
                    onClick={handleConfirmIssueTicket}
                  >
                    {t("export-ticket-modal.confirm")}
                  </Button>
                </div>
              </>
            </ModalBody>
          ) : error?.errorCode ? (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              {renderErrorContent()}
              <div className="flex w-full flex-row justify-center gap-3">
                <Button
                  className="!w-fit flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                  onClick={() => {
                    if (setIsOpenConfirmExportTicket) {
                      setIsOpenConfirmExportTicket(false);
                    }
                  }}
                >
                  {t("export-ticket-modal.iUnderstand")}
                </Button>
              </div>
            </ModalBody>
          ) : (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              <RiMessage3Line className="h-12 w-12" />
              <div className="text-lg font-semibold">
                {t("export-ticket-modal.waitExport")}
              </div>
            </ModalBody>
          )
        }
      </ModalContent>
    </Modal>
  );
};

export default memo(ConfirmExportTicketModal);
