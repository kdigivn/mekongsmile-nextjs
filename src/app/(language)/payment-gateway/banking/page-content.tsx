"use client";

import { useTranslation } from "@/services/i18n/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Image, Spinner } from "@heroui/react";
import {
  PostSMSBankingTransactionMessageRequest,
  TransactionMessageResponse,
  useGetPaymentQRUrl,
  useTransactionMessagePostMutation,
} from "@/services/apis/payments/payments.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetBooking } from "@/services/apis/bookings/bookings.service";
import { OrderPaymentPrefix } from "@/services/apis/orders/types/order-payment-prefix";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IoCheckmark, IoSyncOutline } from "react-icons/io5";
import { IoIosLink, IoMdClipboard } from "react-icons/io";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { formatCurrency, getMobileOS } from "@/lib/utils";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { OrganizationPaymentTypeEnum } from "@/services/apis/organizations/types/organization-enum";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import useHTML2Image from "@/services/apis/common/use-html-to-image/use-html-to-image";
import { HiDownload } from "react-icons/hi";
import BankAppDrawer from "@/components/dialog/bank-app-drawer";

function Payment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation("booking");

  const { settings } = useOrganizationContext();

  const mobileOS = getMobileOS();

  const [captureClipBoardLoading, setCaptureClipBoardLoading] =
    useState<boolean>(false);
  const [captureDownloadLoading, setCaptureDownloadLoading] =
    useState<boolean>(false);

  const { capture } = useHTML2Image(
    useMemo(() => ({ captureId: "payment-qr-capture" }), [])
  );

  const [orgPaymentData, setOrgPaymentData] = useState(
    settings?.payment?.SMSBankingSettings?.payments?.find(
      (p) => p.payment_type === OrganizationPaymentTypeEnum.MAIN
    ) ?? undefined
  );

  const [transactionMessageData, setTransactionMessageData] =
    useState<TransactionMessageResponse | null>(null);

  const { postTransactionMessageAsync } = useTransactionMessagePostMutation();

  const bookingId = searchParams.get("booking_id") ?? "";
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const agreedTerms = searchParams.get("agreedTerms") ?? "";
  // const redirectBack = searchParams.get("redirectBack") ?? "";

  const { booking: bookingData } = useGetBooking(bookingId, !!bookingId);

  const handleTransactionMessage = useCallback(async () => {
    if (!bookingId) return;

    try {
      const request: PostSMSBankingTransactionMessageRequest = {
        type: OrderPaymentPrefix.booking,
        id: bookingId,
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
  }, [bookingId, postTransactionMessageAsync]);

  // useEffect to handle transaction message
  useEffect(() => {
    if (bookingId) {
      handleTransactionMessage();
    }
  }, [bookingId, handleTransactionMessage]);

  const transactionMessage = transactionMessageData?.transactionMessage;
  const getQrUrl = useGetPaymentQRUrl(orgPaymentData);
  const qrUrl = bookingData
    ? getQrUrl(bookingData?.total_price, transactionMessage)
    : "";

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const { isCopied: isMessageCopied, copyToClipboard: copyMessageToClipboard } =
    useCopyToClipboard();

  useEffect(() => {
    if (settings) {
      const mainPayment = settings?.payment?.SMSBankingSettings?.payments?.find(
        (p) => p.payment_type === OrganizationPaymentTypeEnum.MAIN
      );
      setOrgPaymentData(mainPayment);
    }
  }, [orgPaymentData, settings]);

  const handleRedirectIssueTicket = useCallback(() => {
    router.push(
      `/booking/${bookingId}/check-issue-ticket/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`
    );
  }, [agreedTerms, bookingId, paymentMethod, router]);

  const handleCaptureClipboard = useCallback(async () => {
    capture({
      type: "clipboard",
      successMessage: t("qr-code.copied"),
      errorMessage: t("qr-code.copy-failed"),
      setLoading: setCaptureClipBoardLoading,
      sectionCapture: "default",
    });
    // }
  }, [capture, t]);

  const handleCaptureDownLoadSeatModal = useCallback(() => {
    capture({
      type: "download",
      successMessage: t("qr-code.downloaded"),
      errorMessage: t("qr-code.download-failed"),
      setLoading: setCaptureDownloadLoading,
      downloadFileName: `bookingQR-${bookingId}`,
      sectionCapture: "default",
    });
  }, [bookingId, capture, t]);

  const paymentTransferInfo = useMemo(
    () => ({
      message: transactionMessage,
      accountNumber: orgPaymentData?.bank_account_number ?? "A04110000004",
      bankCode: orgPaymentData?.bank_name ?? "SHBVN",
      amount: bookingData?.total_price || 0,
    }),
    [
      bookingData?.total_price,
      orgPaymentData?.bank_account_number,
      orgPaymentData?.bank_name,
      transactionMessage,
    ]
  );

  return (
    <>
      <Card className="static mx-auto my-4 w-full max-w-fit">
        <>
          <CardHeader>
            <CardTitle>{t("payment-methods.qr-method.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 p-3 pb-8 pt-0">
              <div className="flex flex-col items-center">
                {bookingData && (
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={qrUrl}
                      alt="Payment QR"
                      width={270}
                      height={270}
                      id="payment-qr-capture"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCaptureClipboard}
                        className="flex w-full items-center justify-center gap-2"
                        color="primary"
                        aria-label={t("qr-code.copy")}
                      >
                        <IoMdClipboard size={16} />
                        {t("qr-code.copy")}
                        {captureClipBoardLoading && (
                          <Spinner color="white" size="sm" className="mr-1" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="flex w-full items-center justify-center gap-2"
                        color="primary"
                        onClick={handleCaptureDownLoadSeatModal}
                        aria-label={t("qr-code.download")}
                      >
                        <HiDownload size={16} />
                        {t("qr-code.download")}
                        {captureDownloadLoading && (
                          <Spinner color="white" size="sm" className="mr-1" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold">
                {t("payment-methods.qr-method.noteTitle")}
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
              <p className="inline-flex items-center gap-1 text-sm">
                <span>
                  {t(
                    "payment-methods.qr-method.bankingInformation.transferContent"
                  )}{" "}
                  {transactionMessage}
                </span>
                <button
                  onClick={() => {
                    copyMessageToClipboard(transactionMessage || "");
                  }}
                  className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                  aria-label="Copy post link"
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
                {t(
                  "payment-methods.qr-method.bankingInformation.amountPayment"
                )}
                :{" "}
                <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                  {formatCurrency(bookingData?.total_price || 0)}
                </span>
              </p>

              <p className="text-sm italic text-gray-600">
                Nếu mã thanh toán đã hết hạn, bạn có thể nhấn nút Làm mới để lấy
                mã thanh toán mới
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-center gap-3">
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
              id="sms-banking-confirm-paid"
            >
              Tôi đã thanh toán
            </Button>
          </CardFooter>
        </>
        {mobileOS !== "other" && (
          <div className="sticky bottom-14 flex justify-center border-t bg-white px-4 py-2 md:hidden">
            <BankAppDrawer
              paymentTransferInfo={paymentTransferInfo}
              mobileOS={mobileOS}
            />
          </div>
        )}
      </Card>
    </>
  );
}
export default memo(withPageRequiredAuth(Payment));
