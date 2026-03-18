"use client";

import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Booking } from "@/services/apis/bookings/types/booking";
import { useTranslation } from "@/services/i18n/client";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox, Radio, RadioGroup } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { CgExport } from "react-icons/cg";
import { PaymentMethodEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import { cn, formatCurrency } from "@/lib/utils";
import { redirectToPaymentPage } from "@/app/(language)/payment-gateway/utils";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import {
  getIssueTicketSpeedLabel,
  IssueTicketSpeedEnum,
} from "@/services/apis/operators/enums/issue-ticket-speed.enum";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  booking: Booking;
};

function PaymentModal({ isOpen, setIsOpen, booking }: Props) {
  const { t: tPayment } = useTranslation("booking");
  const { t } = useTranslation("user/booking-detail");
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const currentBalance = user?.customer.balance;
  const router = useRouter();

  const { hideNav, showNav } = useMobileBottomNavActions();

  const paymentMethodParam = searchParams.get("payment_method") ?? undefined;
  const agreedTerms = searchParams.get("agreedTerms") ?? undefined;

  const [paymentMethod, setPaymentMethod] = useState<string>(
    paymentMethodParam || PaymentMethodEnum.BankTransfer
  );

  const [isCheck, setIsCheck] = useState(
    agreedTerms ? agreedTerms.toString() === "true" : false
  );

  const handleRedirectToPaymentPage = useCallback(() => {
    router.push(
      redirectToPaymentPage({
        paymentMethod: paymentMethod as PaymentMethodEnum,
        bookingId: booking.id,
        currentBalance: currentBalance as number,
        isCheck: isCheck,
      })
    );
  }, [booking.id, currentBalance, isCheck, paymentMethod, router]);

  const handleRedirectToIssueTicketPage = useCallback(() => {
    const url = `/booking/${booking.id}/issue-ticket/?payment_method=${paymentMethod}&booking_id=${booking.id}&agreedTerms=${isCheck}`;

    router.push(url);
  }, [booking.id, isCheck, paymentMethod, router]);

  const isManual = useMemo(
    () =>
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed !==
        IssueTicketSpeedEnum.INSTANT ||
      (booking?.return_order &&
        booking?.return_order?.voyage?.operator?.configs?.issue_ticket_speed !==
          IssueTicketSpeedEnum.INSTANT),
    [
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed,
      booking?.return_order,
    ]
  );

  const issueTicketSpeedLabel = useMemo(() => {
    const issueTicketSpeed =
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed;
    if (issueTicketSpeed !== IssueTicketSpeedEnum.INSTANT) {
      return getIssueTicketSpeedLabel(issueTicketSpeed as IssueTicketSpeedEnum);
    }
    return getIssueTicketSpeedLabel(
      booking.return_order?.voyage?.operator?.configs
        .issue_ticket_speed as IssueTicketSpeedEnum
    );
  }, [
    booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed,
    booking?.return_order?.voyage?.operator?.configs?.issue_ticket_speed,
  ]);

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isOpen}
      size="2xl"
      backdrop="blur"
      radius="sm"
      onOpenChange={setIsOpen}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex-col gap-2 !p-3">
            <h2 className="text-base font-bold">
              {tPayment("payment-methods.title")}
            </h2>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-3 p-3 pb-8 pt-0">
            <RadioGroup
              name="payment-method"
              className="flex flex-col gap-2 text-sm"
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <Radio value="0">{tPayment("payment-methods.qr")}</Radio>
              <Radio value="1">{tPayment("payment-methods.banking")}</Radio>
              <Radio value="2">{tPayment("payment-methods.direct")}</Radio>
            </RadioGroup>
            <h3 className="text-sm font-bold">
              {t("payment-methods.remaining")}
              <span className="text-danger">{`${formatCurrency(booking?.total_price)}`}</span>
            </h3>
            <p className="text-sm text-danger-600">
              {t("payment-methods.note")}
            </p>
            {isManual && (
              <p className="text-sm text-danger-600">
                <strong>Lưu ý:</strong> Trong đơn hàng có chuyến tàu{" "}
                <strong>{issueTicketSpeedLabel.title}</strong>{" "}
                {issueTicketSpeedLabel.subTitle}. Sau khi hệ thống xuất vé thành
                công, bạn sẽ nhận <strong>được vé qua email</strong>.
              </p>
            )}
            <Checkbox
              radius="sm"
              isSelected={isCheck}
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              onChange={() => {
                setIsCheck(!isCheck);
              }}
            >
              <span className="text-sm">{t("payment-methods.terms")}</span>
            </Checkbox>
            {isCheck && user && user.customer && booking && (
              <p
                className={cn(
                  "text-sm",
                  user.customer.balance < booking.total_price
                    ? "text-danger-500"
                    : "text-success"
                )}
              >
                {t("payment-methods.check-balance.title")}
                {formatCurrency(user.customer.balance)} -{" "}
                {user.customer.balance < booking.total_price
                  ? t("payment-methods.check-balance.title-not-enough")
                  : t("payment-methods.check-balance.title-enough")}
              </p>
            )}
            <div className="flex gap-3 self-end">
              <Button
                type="submit"
                disabled={!isCheck}
                className="w-fit !flex-none rounded-md px-6 py-2"
                onClick={handleRedirectToPaymentPage}
              >
                {tPayment("payment-methods.action-button")}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={!isCheck}
                className={
                  (cn("w-fit !flex-none rounded-md px-6 py-2"),
                  user &&
                  user.customer &&
                  booking &&
                  user.customer.balance <
                    (booking?.depart_order?.order_status ===
                    OrderStatusEnum.Booked
                      ? booking?.total_price - booking?.depart_order.total_price
                      : booking?.total_price)
                    ? "hidden"
                    : "")
                }
                onClick={handleRedirectToIssueTicketPage}
              >
                <CgExport className="mr-2 h-4 w-4" />
                {t("export-ticket")}
              </Button>
            </div>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}

export default memo(PaymentModal);
