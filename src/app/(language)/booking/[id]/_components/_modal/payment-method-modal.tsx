"use client";

import BankAppDrawer from "@/components/dialog/bank-app-drawer";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Button } from "@/components/ui/button";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatCurrency, getMobileOS } from "@/lib/utils";
import { Booking } from "@/services/apis/bookings/types/booking";
import { OrderPaymentPrefix } from "@/services/apis/orders/types/order-payment-prefix";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { OrganizationPaymentTypeEnum } from "@/services/apis/organizations/types/organization-enum";
import {
  PostSMSBankingTransactionMessageRequest,
  TransactionMessageResponse,
  useGetPaymentQRUrl,
  useTransactionMessagePostMutation,
} from "@/services/apis/payments/payments.service";
import { useTranslation } from "@/services/i18n/client";
import {
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { IoIosLink } from "react-icons/io";
import { IoCheckmark, IoSyncOutline } from "react-icons/io5";
import { TiPhoneOutline } from "react-icons/ti";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  paymentMethod: string;
  booking: Booking;
};

function PaymentMethodModal({
  isOpen,
  setIsOpen,
  booking,
  paymentMethod,
}: Props) {
  const isMobile = useCheckMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mobileOS = getMobileOS();
  const { t } = useTranslation("booking");
  const agreedTerms = searchParams.get("agreedTerms") ?? "";
  const { settings } = useOrganizationContext();
  const [orgPaymentData, setOrgPaymentData] = useState(
    settings?.payment?.SMSBankingSettings?.payments?.find(
      (p) => p.payment_type === OrganizationPaymentTypeEnum.MAIN
    ) ?? undefined
  );

  const [transactionMessageData, setTransactionMessageData] =
    useState<TransactionMessageResponse | null>(null);

  const { postTransactionMessageAsync } = useTransactionMessagePostMutation();

  const handleTransactionMessage = useCallback(async () => {
    if (!booking.id) return;

    try {
      const request: PostSMSBankingTransactionMessageRequest = {
        type: OrderPaymentPrefix.booking,
        id: booking.id,
      };

      const response = await postTransactionMessageAsync(request);
      // Use type assertion to tell TypeScript the expected shape
      const transactionData = response as TransactionMessageResponse;

      if (transactionData) {
        setTransactionMessageData(transactionData);
      }
    } catch (error) {
      console.error("Failed to get transaction message:", error);
    }
  }, [booking.id, postTransactionMessageAsync]);
  // useEffect to handle transaction message
  useEffect(() => {
    if (booking.id) {
      handleTransactionMessage();
    }
  }, [booking.id, handleTransactionMessage]);

  const transactionMessage = transactionMessageData?.transactionMessage;

  const getQrUrl = useGetPaymentQRUrl();
  const qrUrl = booking
    ? getQrUrl(booking?.total_price, transactionMessage)
    : "";

  const { hideNav, showNav } = useMobileBottomNavActions();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const { isCopied: isMessageCopied, copyToClipboard: copyMessageToClipboard } =
    useCopyToClipboard();

  const handleRedirectIssueTicket = useCallback(() => {
    router.push(
      `/booking/${booking?.id}/check-issue-ticket/?payment_method=${paymentMethod}&booking_id=${booking?.id}&agreedTerms=${agreedTerms}`
    );
  }, [agreedTerms, booking?.id, paymentMethod, router]);

  useEffect(() => {
    if (settings) {
      const mainPayment = settings?.payment?.SMSBankingSettings?.payments?.find(
        (p) => p.payment_type === OrganizationPaymentTypeEnum.MAIN
      );
      setOrgPaymentData(mainPayment);
    }
  }, [orgPaymentData, settings]);

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const paymentTransferInfo = useMemo(
    () => ({
      message: transactionMessage,
      accountNumber: orgPaymentData?.bank_account_number ?? "A04110000004",
      bankCode: orgPaymentData?.bank_name ?? "SHBVN",
      amount: booking?.total_price ?? 0,
    }),
    [
      booking?.total_price,
      orgPaymentData?.bank_account_number,
      orgPaymentData?.bank_name,
      transactionMessage,
    ]
  );

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
        {() =>
          paymentMethod === "1" ? (
            <>
              <ModalHeader className="flex-col gap-2 !p-3">
                <h2 className="text-base font-bold">
                  {t(
                    "payment-methods.bank-transfer-method.bankingInformation.title"
                  )}
                </h2>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-3 p-3 pb-8 pt-0">
                <h3 className="text-sm font-bold">
                  {t("payment-methods.bank-transfer-method.noteTitle")}
                </h3>
                <p className="text-sm">
                  {t("payment-methods.bank-transfer-method.noteContent")}
                </p>
                <h3 className="text-sm font-bold">
                  {t(
                    "payment-methods.bank-transfer-method.bankingInformation.title"
                  )}
                </h3>
                <p className="inline-flex items-center gap-1 text-sm">
                  {t(
                    "payment-methods.bank-transfer-method.bankingInformation.bankAccountNumber"
                  )}
                  <span className="text-danger-600">
                    {orgPaymentData?.bank_account_number ?? "32288"}
                  </span>
                  <button
                    key={1}
                    onClick={() => {
                      copyToClipboard(
                        orgPaymentData?.bank_account_number ?? "32288"
                      );
                    }}
                    className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                    aria-label="Copy post link"
                  >
                    {isCopied ? (
                      <IoCheckmark className="h-4 w-4" />
                    ) : (
                      <IoIosLink className="h-4 w-4" />
                    )}
                    <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
                  </button>
                </p>
                <p className="text-sm">
                  {orgPaymentData?.bank_name_full ??
                    "Ngân hàng Thương mại Cổ phần Kỹ thương Việt Nam (Techcombank)"}
                </p>
                <p className="text-sm">
                  {`${t(
                    "payment-methods.bank-transfer-method.bankingInformation.bankAccountName"
                  )} `}
                  {orgPaymentData?.bank_account_name ??
                    "CÔNG TY CỔ PHẦN FERRY VN"}
                </p>
                <p className="inline-flex items-center gap-1 text-sm">
                  <span>
                    {`${t(
                      "payment-methods.bank-transfer-method.bankingInformation.transferContent"
                    )} `}
                    {transactionMessage}
                  </span>
                  <button
                    key={1}
                    onClick={() => {
                      copyMessageToClipboard(transactionMessage || "");
                    }}
                    className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                    aria-label="Copy transaction message"
                  >
                    {isMessageCopied ? (
                      <IoCheckmark className="h-4 w-4" />
                    ) : (
                      <IoIosLink className="h-4 w-4" />
                    )}
                    <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
                  </button>
                </p>
                {transactionMessageData?.expiresAt && (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t(
                        "payment-methods.qr-method.bankingInformation.paymentCodeExpired",
                        {
                          expiredDate: format(
                            new Date(transactionMessageData?.expiresAt || 0),
                            "HH:mm dd/MM/yyyy"
                          ),
                        }
                      ),
                    }}
                  />
                )}
                <p className="text-sm font-bold">
                  {`${t(
                    "payment-methods.bank-transfer-method.bankingInformation.amountPayment"
                  )} `}
                  <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                    {formatCurrency(booking?.total_price)}
                  </span>
                </p>

                <div className="flex items-center justify-end">
                  <Button
                    className="!w-fit gap-1 rounded-md border border-solid bg-white px-6 py-2 text-black hover:bg-gray-300"
                    onClick={handleTransactionMessage}
                  >
                    <IoSyncOutline className="text-xl" />
                    <p>Làm mới</p>
                  </Button>
                  <Button
                    className="!w-fit gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                    onClick={handleRedirectIssueTicket}
                  >
                    Tôi đã thanh toán
                  </Button>
                </div>
              </ModalBody>
            </>
          ) : paymentMethod === "0" ? (
            <>
              <ModalHeader className="flex-col gap-2 !p-3">
                <h2 className="text-base font-bold">
                  {t("payment-methods.qr-method.title")}
                </h2>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-3 p-3 pb-8 pt-0">
                <div className="flex flex-col items-center">
                  {paymentMethod === "0" && booking && (
                    <Image
                      src={qrUrl}
                      alt="Payment QR"
                      width={270}
                      height={270}
                      id="payment-qr-capture"
                    />
                  )}
                </div>
                <h3 className="text-sm font-bold">
                  {t("payment-methods.qr-method.noteTitle")}as
                </h3>
                <p className="text-sm">
                  {t("payment-methods.qr-method.noteContent")}
                </p>
                <h3 className="text-sm font-bold">
                  {t("payment-methods.qr-method.bankingInformation.title")}
                </h3>
                <p className="text-sm">
                  {t("payment-methods.qr-method.bankingInformation.bankName")}{" "}
                  {orgPaymentData?.bank_name_full ??
                    "Ngân hàng Thương mại Cổ phần Kỹ thương Việt Nam (Techcombank)"}
                </p>
                <p className="inline-flex items-center gap-1 text-sm">
                  {t(
                    "payment-methods.bank-transfer-method.bankingInformation.bankAccountNumber"
                  )}
                  <span className="text-danger-600">
                    {orgPaymentData?.bank_account_number ?? "32288"}
                  </span>
                  <button
                    onClick={() => {
                      copyToClipboard(
                        orgPaymentData?.bank_account_number ?? "32288"
                      );
                    }}
                    className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                    aria-label="Copy post link"
                  >
                    {isCopied ? (
                      <IoCheckmark className="h-4 w-4" />
                    ) : (
                      <IoIosLink className="h-4 w-4" />
                    )}
                    <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
                  </button>
                </p>
                <p className="text-sm">
                  {t(
                    "payment-methods.qr-method.bankingInformation.bankAccountName"
                  )}{" "}
                  {orgPaymentData?.bank_account_name ??
                    "CÔNG TY CỔ PHẦN FERRY VN"}
                </p>
                <p className="text-sm">
                  {t(
                    "payment-methods.qr-method.bankingInformation.transferContent"
                  )}{" "}
                  {transactionMessage}
                </p>
                <p className="text-sm font-bold">
                  {t(
                    "payment-methods.qr-method.bankingInformation.amountPayment"
                  )}
                  :{" "}
                  <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                    {formatCurrency(booking?.total_price)}
                  </span>
                </p>
              </ModalBody>

              {mobileOS !== "other" && (
                <div className="sticky bottom-14 flex justify-center border-t bg-white px-4 py-2 md:hidden">
                  <BankAppDrawer
                    paymentTransferInfo={paymentTransferInfo}
                    mobileOS={mobileOS}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <ModalHeader className="flex-col gap-2 !p-3">
                <h2 className="text-base font-bold">
                  {t("payment-methods.direct-method.title")}
                </h2>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-3 p-3 pb-8 pt-0">
                <div className="flex w-full flex-col items-center p-2">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15715.73197185065!2d105.77028618215022!3d10.022388393344606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08948fcdd1c87%3A0x4232af8e88fe18e7!2zVsOpIFTDoHUgQ2FvIFThu5FjIC0gRkVSUlkgVk4!5e0!3m2!1svi!2s!4v1759332449025!5m2!1svi!2s"
                    width={isMobile ? "315" : "615"}
                    height={isMobile ? "315" : "325"}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-bold">
                  {t("payment-methods.direct-method.contactInformation")}
                </h3>
                <p className="text-sm">
                  {t("payment-methods.direct-method.message")}
                </p>

                <p className="text-sm">
                  {t("payment-methods.direct-method.address")}{" "}
                  {t("payment-methods.direct-method.ncmkAdress")}
                </p>
                <p className="flex flex-row items-center gap-2 text-sm font-bold">
                  {t("payment-methods.direct-method.hotline")}{" "}
                  <span className="flex w-fit flex-none flex-row justify-center gap-1.5 rounded-sm bg-primary-200 p-1.5 text-sm font-bold leading-4">
                    <TiPhoneOutline className="h-4 w-4 flex-none" /> 0924299898
                  </span>
                </p>
              </ModalBody>
            </>
          )
        }
      </ModalContent>
    </Modal>
  );
}

export default memo(PaymentMethodModal);
