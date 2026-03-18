"use client";

import { Booking } from "@/services/apis/bookings/types/booking";
import {
  BookingUnknownErrors,
  BookingValidationErrors,
  OperatorOrderErrors,
  OrderIssueTicketErrors,
} from "@/services/apis/common/types/common-errors";
import { memo, useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "./ui/button";
import { LuRotateCw } from "react-icons/lu";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { Ticket } from "@/services/apis/tickets/types/ticket";

type Error = {
  errorCode?: number;
  message?: string;
};

/**
 * Định nghĩa các props chung cho component ErrorContent.
 */
interface ErrorContentProps {
  /**
   * Mã lỗi xác định loại lỗi.
   * @example 120100
   */
  error?: Error;

  /**
   * Tên namespace để hiển thị thông báo lỗi bằng ngôn ngữ tương ứng.
   * @example "booking"
   */
  tName: string;

  /**
   * Xác định nút "Chỉnh sửa" có bị vô hiệu hóa hay không.
   * @default false
   */
  isDisabledEdit?: boolean;

  /**
   * Dữ liệu đơn hàng liên quan đến lỗi.
   */
  bookingData?: Booking;

  /**
   * Hàm callback được gọi khi nhấn vào nút biểu tượng "Chỉnh sửa".
   */
  handleClickEditIconButton?: () => void;

  /**
   * Hàm callback được gọi khi nhấn vào nút "Xuất vé lại" để thử lại.
   */
  handleRedirectIssueTicketAgain?: () => void;

  /**
   * Hàm callback để cuộn đến phần thanh toán.
   */
  scrollToPaymentSection?: () => void;

  /**
   * Hàm callback để mở modal thanh toán.
   */
  handleOpenPaymentModal?: () => void;

  /**
   * Kiểu hiển thị của component.
   * - `default`: Hiển thị mặc định.
   * - `compact`: Giao diện hiển thị gọn nhẹ hơn.
   * - `payment`: Tập trung vào các thao tác liên quan đến thanh toán.
   * @default "default"
   */
  variant?: "default" | "compact" | "payment";

  /**
   * Xác định nút "Xuất vé lại" có được hiển thị hay không.
   * @default false
   */
  showRetryButton?: boolean;
}

const ErrorContent = ({
  error,
  tName,
  isDisabledEdit = false,
  bookingData,
  handleClickEditIconButton,
  handleRedirectIssueTicketAgain,
  scrollToPaymentSection,
  handleOpenPaymentModal,
  variant = "default",
  showRetryButton = true,
}: ErrorContentProps) => {
  const { t } = useTranslation(tName);

  const getDuplicateSocialIdOperatorName = useCallback(
    (error: Error) => {
      const name = [
        ...((bookingData?.depart_order?.tickets as Ticket[]) ?? []),
        ...((bookingData?.return_order?.tickets as Ticket[]) ?? []),
      ].find((ticket: Ticket) => {
        return ticket.social_id === error?.message;
      })?.name;
      if (!name || name === "") return error?.message;
      return name;
    },
    [bookingData?.depart_order?.tickets, bookingData?.return_order?.tickets]
  );

  const renderErrorMessage = useCallback(() => {
    return (
      <div className="flex items-start gap-3">
        <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="text-base font-normal">
            {(() => {
              switch (error?.errorCode) {
                case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
                  return t("export-ticket-modal.errorBookedSeatExport");
                case OperatorOrderErrors.DuplicateSocialId:
                  return t("export-ticket-modal.errorDuplicateSocialId");
                case OperatorOrderErrors.OperatorIsDisabled:
                  return t("export-ticket-modal.errorOperatorIsDisabled");
                case BookingValidationErrors.AlreadyProcessingIssueTicket:
                  return t("export-ticket-modal.errorProcessingIssueTicket");
                case BookingValidationErrors.CustomerBalanceNotEnough:
                  return t("export-ticket-modal.errorCustomerBalanceNotEnough");
                case BookingValidationErrors.InvalidInput:
                  return t("export-ticket-modal.errorInvalidInput");
                case BookingValidationErrors.InvalidStatus:
                  return t("export-ticket-modal.errorInvalidStatus");
                case BookingValidationErrors.NoCustomerAttached:
                  return t("export-ticket-modal.errorNoCustomerAttached");
                case BookingValidationErrors.OrganizationBalanceNotEnough:
                  return t("export-ticket-modal.ticket_export_error", {
                    errorCode: error?.errorCode,
                  });
                case OrderIssueTicketErrors.UnavailableSeats:
                  return t("export-ticket-modal.errorUnavailableSeats");
                case OperatorOrderErrors.DuplicateSocialIdOperator:
                  return (
                    <div className="flex flex-col items-start gap-1">
                      {t("export-ticket-modal.errorDuplicateSocialIdOperator")}
                      <span className="font-bold">
                        {getDuplicateSocialIdOperatorName(error)}
                      </span>
                    </div>
                  );
                case BookingUnknownErrors.Unknown:
                default:
                  return t("export-ticket-modal.errorUknown");
              }
            })()}
          </p>
        </div>
      </div>
    );
  }, [error, getDuplicateSocialIdOperatorName, t]);

  const renderEditButton = useCallback(() => {
    if (isDisabledEdit || !handleClickEditIconButton) return null;

    return (
      <Button
        variant="outline"
        className="flex-1 gap-1"
        onClick={handleClickEditIconButton}
      >
        {t("export-ticket-modal.returnBookingStep2")}
      </Button>
    );
  }, [handleClickEditIconButton, isDisabledEdit, t]);

  const renderRetryButton = useCallback(() => {
    if (!showRetryButton || isDisabledEdit || !handleRedirectIssueTicketAgain)
      return null;

    return (
      <Button
        className="w-full gap-2"
        variant="default"
        color="primary"
        onClick={handleRedirectIssueTicketAgain}
      >
        <LuRotateCw className="h-4 w-4" />
        Xuất vé lại
      </Button>
    );
  }, [handleRedirectIssueTicketAgain, isDisabledEdit, showRetryButton]);

  const handlePayment = useCallback(() => {
    const isTicketError =
      bookingData?.depart_order?.issue_ticket_error &&
      bookingData?.depart_order?.order_status !== OrderStatusEnum.Booked;

    if (isTicketError && scrollToPaymentSection) {
      scrollToPaymentSection();
    } else if (handleOpenPaymentModal) {
      handleOpenPaymentModal();
    }
  }, [
    bookingData?.depart_order?.issue_ticket_error,
    bookingData?.depart_order?.order_status,
    handleOpenPaymentModal,
    scrollToPaymentSection,
  ]);

  const renderPaymentButton = useCallback(() => {
    const isPaymentError =
      error?.errorCode === BookingValidationErrors.CustomerBalanceNotEnough ||
      error?.errorCode === BookingValidationErrors.OrganizationBalanceNotEnough;

    if (!isPaymentError || (!scrollToPaymentSection && !handleOpenPaymentModal))
      return null;

    return (
      <Button
        className="!w-fit flex-none gap-1 rounded-md bg-primary py-2 text-white hover:bg-primary/50"
        onClick={handlePayment}
      >
        Thanh toán
      </Button>
    );
  }, [
    error?.errorCode,
    scrollToPaymentSection,
    handleOpenPaymentModal,
    handlePayment,
  ]);

  const renderExportPassengerButton = useCallback(() => {
    if (!bookingData) return null;

    // If you have a ButtonExportPassenger component
    // Uncomment this when you have the component
    return (
      <div className="w-full flex-wrap">
        {/* <ButtonExportPassenger
            booking={bookingData}
            className="w-full flex-wrap"
            classNameButton="w-full"
          /> */}
      </div>
    );
  }, [bookingData]);

  /**
   * Khi nào sử dụng `variant="compact"`:
   * - Dùng cho các giao diện nhỏ gọn, không gian hiển thị hạn chế (như modal, sidebar).
   * - Hiển thị thông báo lỗi và các hành động cơ bản (như "Thử lại" hoặc "Thanh toán").
   * - Sử dụng khi:
   *   1. Lỗi cần được hiển thị ở không gian hạn chế, chẳng hạn như trong modal hoặc sidebar.
   *   2. Bạn muốn giao diện đơn giản chỉ hiển thị thông báo lỗi và các nút quan trọng.
   */
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <FiAlertCircle className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-base font-normal">
          {(() => {
            switch (error?.errorCode) {
              case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
                return t("export-ticket-modal.errorBookedSeatExport");
              case BookingValidationErrors.CustomerBalanceNotEnough:
                return t("export-ticket-modal.errorCustomerBalanceNotEnough");
              case BookingValidationErrors.OrganizationBalanceNotEnough:
                return t("export-ticket-modal.ticket_export_error", {
                  errorCode: error?.errorCode,
                });
              case OperatorOrderErrors.DuplicateSocialIdOperator:
                return (
                  <div className="flex flex-col items-start gap-1">
                    {t("export-ticket-modal.errorDuplicateSocialIdOperator")}
                    <span className="font-bold">
                      {getDuplicateSocialIdOperatorName(error)}
                    </span>
                  </div>
                );
              default:
                return t("export-ticket-modal.errorUknown");
            }
          })()}
        </p>
        {error?.errorCode ===
          OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats &&
          !isDisabledEdit && (
            <Button
              className="!w-fit flex-none gap-1 rounded-md bg-primary py-2 text-white hover:bg-primary/50"
              onClick={handleClickEditIconButton}
            >
              {t("export-ticket-modal.returnBookingStep2")}
            </Button>
          )}
        {renderPaymentButton()}
      </div>
    );
  }

  /**
   * Khi nào sử dụng `variant="payment"`:
   * - Dùng cho các lỗi liên quan đến thanh toán hoặc số dư không đủ.
   * - Giao diện tập trung hiển thị thông báo lỗi và nút "Thanh toán".
   * - Sử dụng khi:
   *   1. Lỗi liên quan đến các vấn đề thanh toán (ví dụ: khách hàng hoặc tổ chức không đủ số dư).
   *   2. Bạn cần giao diện tối giản, chỉ tập trung vào thông báo lỗi và hành động thanh toán.
   */
  if (variant === "payment") {
    // Special layout for payment-related errors
    return (
      <div className="flex items-center gap-2">
        <ErrorMessage error={error} tName={tName} bookingData={bookingData} />
        {renderPaymentButton()}
      </div>
    );
  }

  /**
   * Khi nào sử dụng `variant="default"`:
   * - Phù hợp với hầu hết các lỗi cần hiển thị đầy đủ thông tin và nhiều hành động khác nhau.
   * - Hiển thị thông báo lỗi, nút "Chỉnh sửa", nút "Thử lại" và các hành động liên quan khác (như xuất dữ liệu hành khách).
   * - Sử dụng khi:
   *   1. Bạn cần một giao diện chi tiết và đầy đủ thông tin về lỗi.
   *   2. Lỗi liên quan đến nhiều hành động, ví dụ: chỉnh sửa, thử lại, hoặc xuất dữ liệu hành khách.
   */
  return (
    <div className="space-y-4">
      {renderErrorMessage()}

      <div className="flex flex-col gap-2">
        {/* First row with edit + export */}
        {(error?.errorCode ===
          OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats ||
          error?.errorCode === OperatorOrderErrors.DuplicateSocialId) && (
          <div className="flex w-full flex-wrap gap-3">
            {renderEditButton()}
            {renderExportPassengerButton()}
          </div>
        )}

        {/* Retry button for most error types */}
        {error?.errorCode !==
          OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats &&
          error?.errorCode !== OperatorOrderErrors.DuplicateSocialId &&
          showRetryButton && (
            <div className="flex w-full">{renderRetryButton()}</div>
          )}
      </div>
    </div>
  );
};

interface ErrorMessageProps {
  error?: Error; // Mã lỗi xác định loại lỗi
  tName: string;
  bookingData?: Booking;
}

const ErrorMessage = ({ error, tName, bookingData }: ErrorMessageProps) => {
  const { t } = useTranslation(tName);

  const getDuplicateSocialIdOperatorName = useCallback(
    (error: Error) => {
      const name = [
        ...((bookingData?.depart_order?.tickets as Ticket[]) ?? []),
        ...((bookingData?.return_order?.tickets as Ticket[]) ?? []),
      ].find((ticket: Ticket) => {
        return ticket.social_id === error?.message;
      })?.name;
      if (!name || name === "") return error?.message;
      return name;
    },
    [bookingData?.depart_order?.tickets, bookingData?.return_order?.tickets]
  );

  const renderMessage = () => {
    switch (error?.errorCode) {
      case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
        return t("export-ticket-modal.errorBookedSeatExport");
      case OperatorOrderErrors.DuplicateSocialId:
        return t("export-ticket-modal.errorDuplicateSocialId");
      case OperatorOrderErrors.OperatorIsDisabled:
        return t("export-ticket-modal.errorOperatorIsDisabled");
      case BookingValidationErrors.AlreadyProcessingIssueTicket:
        return t("export-ticket-modal.errorProcessingIssueTicket");
      case BookingValidationErrors.CustomerBalanceNotEnough:
        return t("export-ticket-modal.errorCustomerBalanceNotEnough");
      case BookingValidationErrors.InvalidInput:
        return t("export-ticket-modal.errorInvalidInput");
      case BookingValidationErrors.InvalidStatus:
        return t("export-ticket-modal.errorInvalidStatus");
      case BookingValidationErrors.NoCustomerAttached:
        return t("export-ticket-modal.errorNoCustomerAttached");
      case BookingValidationErrors.OrganizationBalanceNotEnough:
        return t("export-ticket-modal.ticket_export_error", {
          errorCode: error?.errorCode,
        });
      case OrderIssueTicketErrors.UnavailableSeats:
        return t("export-ticket-modal.errorUnavailableSeats");
      case OperatorOrderErrors.DuplicateSocialIdOperator:
        return (
          <div className="flex flex-col items-start gap-1">
            {t("export-ticket-modal.errorDuplicateSocialIdOperator")}
            <span className="font-bold">
              {getDuplicateSocialIdOperatorName(error)}
            </span>
          </div>
        );
      case BookingUnknownErrors.Unknown:
      default:
        return t("export-ticket-modal.errorUknown");
    }
  };

  return (
    <div className="flex items-start gap-3">
      <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div>
        <p className="text-base font-normal">{renderMessage()}</p>
      </div>
    </div>
  );
};

export default memo(ErrorContent);
