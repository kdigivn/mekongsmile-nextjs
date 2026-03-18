"use client";

import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/services/apis/bookings/transactions/types/transaction";
import { Booking } from "@/services/apis/bookings/types/booking";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { Order } from "@/services/apis/orders/types/order";
import useLanguage from "@/services/i18n/use-language";
import {
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
} from "@heroui/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaCircleCheck } from "react-icons/fa6";
import { MdDownloading, MdOutlineWarningAmber } from "react-icons/md";
import { RiHome4Line, RiMessage3Line } from "react-icons/ri";
type Props = {
  booking: Booking;
  departOrder?: Order;
  returnOrder?: Order;
  transaction?: Transaction;
  isPaymentOpen: boolean;
  setIsPaymentOpen: (isOpen: boolean) => void;
};
function PaymentModal({
  booking,
  transaction,
  isPaymentOpen,
  setIsPaymentOpen,
  departOrder,
  returnOrder,
}: Props) {
  const exportDepartRef = useRef<HTMLAnchorElement | null>(null);
  const exportReturnRef = useRef<HTMLAnchorElement | null>(null);
  const exportDepartHarborRef = useRef<HTMLAnchorElement | null>(null);
  const exportReturnHarborRef = useRef<HTMLAnchorElement | null>(null);
  const { t } = useTranslation("booking");
  const router = useRouter();
  const language = useLanguage();
  const handleExportPDF = useCallback(() => {
    exportDepartRef?.current?.click();
    if (returnOrder?.tickets_file) {
      exportReturnRef?.current?.click();
    }
  }, [returnOrder?.tickets_file]);

  const handleHarborFile = useCallback(() => {
    if (departOrder?.harbor_fee_file) {
      exportDepartHarborRef?.current?.click();
    }
    if (returnOrder?.harbor_fee_file) {
      exportReturnHarborRef?.current?.click();
    }
  }, [departOrder?.harbor_fee_file, returnOrder?.harbor_fee_file]);

  const handleReturnHome = useCallback(() => {
    router.push(`/${language}`);
  }, [language, router]);

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isPaymentOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isPaymentOpen, showNav]);

  return (
    <Modal
      size="sm"
      radius="sm"
      isOpen={isPaymentOpen}
      onOpenChange={setIsPaymentOpen}
      hideCloseButton={booking.booking_status === BookingStatusEnum.Booked}
    >
      <ModalContent>
        {() =>
          booking.booking_status !== BookingStatusEnum.Booked ? (
            transaction ? (
              <ModalBody className="flex flex-col gap-4 p-6 pt-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                    <FaCircleCheck className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="text-sm text-primary">
                      {t("payment-success.title")}
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(booking?.total_price)}
                    </div>
                  </div>
                </div>
                <hr className="w-11/12 self-center" />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row justify-between text-sm">
                    <div className="text-primary">
                      {t("payment-success.billCode")}
                    </div>
                    <div className="font-semibold">{transaction?.id}</div>
                  </div>
                  <div className="flex flex-row justify-between text-sm">
                    <div className="text-primary">
                      {t("payment-success.paymentTime")}
                    </div>
                    <div className="font-semibold">
                      {format(
                        transaction
                          ? new Date(transaction?.createdAt ?? "")
                          : new Date(),
                        "HH:mm dd/MM/yyyy"
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row justify-between text-sm">
                    <div className="text-primary">
                      {t("payment-success.paymentMethod")}
                    </div>
                    <div className="flex justify-end text-end font-semibold">
                      {t("payment-success.bankTransfer")}
                    </div>
                  </div>
                  <div className="flex flex-row justify-between text-sm">
                    <div className="text-primary">
                      {t("payment-success.payer")}
                    </div>
                    <div className="font-semibold">{`${booking.orderer_name}`}</div>
                  </div>
                  <hr className="w-11/12 self-center border-dashed" />
                  <div className="flex flex-row justify-between text-sm">
                    <div className="text-primary">
                      {t("payment-success.amount")}
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(booking?.total_price)}
                    </div>
                  </div>
                </div>
                {booking.booking_status === BookingStatusEnum.ExportError ? (
                  <div className="flex w-full flex-col items-center justify-center gap-4 text-sm text-danger">
                    <div>{t("payment-fail.errorExport")}</div>
                    <div>{t("payment-fail.hotlineInfo")}</div>
                  </div>
                ) : (
                  <>
                    <Button
                      disabled={departOrder?.tickets_file ? false : true}
                      type="submit"
                      variant={"outline"}
                      className="gap-1 rounded-md px-6 py-2"
                      onClick={handleExportPDF}
                    >
                      <MdDownloading className="h-5 w-5" />
                      <span>{t("payment-success.exportBill")}</span>
                      {departOrder?.tickets_file.path && (
                        <a
                          ref={exportDepartRef}
                          href={departOrder?.tickets_file.path}
                          className="hidden"
                        ></a>
                      )}
                      {returnOrder?.tickets_file.path && (
                        <a
                          ref={exportReturnRef}
                          href={returnOrder?.tickets_file.path}
                          className="hidden"
                        ></a>
                      )}
                    </Button>
                    {departOrder?.harbor_fee_file ||
                    returnOrder?.harbor_fee_file ? (
                      <Button
                        type="submit"
                        variant={"outline"}
                        className="gap-1 rounded-md px-6 py-2"
                        onClick={handleHarborFile}
                      >
                        <MdDownloading className="h-5 w-5" />
                        <span>{t("export-harbor-file")}</span>
                        {departOrder?.harbor_fee_file && (
                          <a
                            ref={exportDepartHarborRef}
                            href={departOrder?.harbor_fee_file.path}
                            className="hidden"
                          ></a>
                        )}
                        {returnOrder?.harbor_fee_file && (
                          <a
                            ref={exportReturnHarborRef}
                            href={returnOrder?.harbor_fee_file.path}
                            className="hidden"
                          ></a>
                        )}
                      </Button>
                    ) : (
                      <></>
                    )}
                  </>
                )}
                <Button
                  type="submit"
                  className="gap-1 rounded-md px-6 py-2"
                  onClick={handleReturnHome}
                >
                  <RiHome4Line className="h-5 w-5" />
                  <span>{t("payment-success.returnHomepage")}</span>
                </Button>
              </ModalBody>
            ) : (
              <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
                <RiMessage3Line className="h-12 w-12" />
                <div className="text-lg font-semibold">
                  {t("payment-success.exportBill")}{" "}
                  <span className="text-danger">{t("payment-fail.fail")}</span>
                </div>
                <div className="text-base font-normal">
                  {t("payment-fail.errorExport")}
                </div>
                <div className="text-base font-normal">
                  {t("payment-fail.hotlineInfo")}
                </div>
                <div>
                  <Button
                    type="submit"
                    className="gap-1 rounded-md px-6 py-2"
                    onClick={handleReturnHome}
                  >
                    <RiHome4Line className="h-5 w-5" />
                    <span>{t("payment-success.returnHomepage")}</span>
                  </Button>
                </div>
              </ModalBody>
            )
          ) : booking.total_price === transaction?.amount ? (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              <RiMessage3Line className="h-12 w-12" />
              <div className="text-lg font-semibold">
                {t("payment-success.sentRequest")}{" "}
                <span className="text-primary">
                  {t("payment-success.success")}
                </span>
              </div>
              <div className="text-base font-normal">
                {t("payment-success.waitForInfo")}
              </div>
              <CircularProgress
                aria-label={t("payment-success.loading")}
                color="primary"
              />
            </ModalBody>
          ) : (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              <MdOutlineWarningAmber className="h-12 w-12 text-warning" />
              <div className="text-lg font-semibold">
                {t("payment-fail.notEnough")}
              </div>
              <div className="text-base font-normal">
                {t("payment-fail.hasPay")}{" "}
                <span className="text-danger">
                  {formatCurrency(transaction?.amount as number)}
                </span>{" "}
                {formatCurrency(booking.total_price)}
              </div>
              <div className="text-base font-normal">
                {t("payment-fail.needMoreMoney")}
              </div>
            </ModalBody>
          )
        }
      </ModalContent>
    </Modal>
  );
}

export default memo(PaymentModal);
