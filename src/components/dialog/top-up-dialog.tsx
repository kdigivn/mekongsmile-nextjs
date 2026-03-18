import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, cn, Image, Spinner } from "@heroui/react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { OrderPaymentPrefix } from "@/services/apis/orders/types/order-payment-prefix";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { OrganizationPaymentTypeEnum } from "@/services/apis/organizations/types/organization-enum";
import { useGetPaymentQRUrl } from "@/services/apis/payments/payments.service";
import useAuth from "@/services/auth/use-auth";
import { useTranslation } from "@/services/i18n/client";
import { memo, useMemo, useCallback, useEffect, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { IoIosLink, IoMdClipboard } from "react-icons/io";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Cross2Icon } from "@radix-ui/react-icons";
import { HiDownload } from "react-icons/hi";
import useHTML2Image from "@/services/apis/common/use-html-to-image/use-html-to-image";
import BankAppDrawer from "./bank-app-drawer";
import { getMobileOS } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};
const TopUpDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation("booking");

  const { user } = useAuth();

  const { settings } = useOrganizationContext();

  const { hideNav, showNav } = useMobileBottomNavActions();

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

  const transactionMessage = `${OrderPaymentPrefix.CustomerDeposit} ${user?.customer_id}`;

  const getQrUrl = useGetPaymentQRUrl(orgPaymentData);

  const qrUrl = getQrUrl(0, transactionMessage);

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

  useEffect(() => {
    if (open) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, open, showNav]);

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
      downloadFileName: `topupQR-${orgPaymentData?.bank_account_number ?? "32288"}${orgPaymentData?.bank_name ? `-${orgPaymentData?.bank_name}` : ""}`,
      sectionCapture: "default",
    });
  }, [
    capture,
    orgPaymentData?.bank_account_number,
    orgPaymentData?.bank_name,
    t,
  ]);

  const paymentTransferInfo = useMemo(
    () => ({
      message: transactionMessage,
      accountNumber: orgPaymentData?.bank_account_number ?? "A04110000004",
      bankCode: orgPaymentData?.bank_name ?? "shbvn",
    }),
    [
      orgPaymentData?.bank_account_number,
      orgPaymentData?.bank_name,
      transactionMessage,
    ]
  );
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="flex max-h-[90vh] w-[90vw] max-w-screen-sm flex-col gap-2 overflow-y-auto rounded-md py-0"
        closeButtonClassName="!hidden"
      >
        <DialogHeader className="sticky left-0 top-0 z-[99] w-full bg-background py-2">
          <DialogTitle>{t("top-up.top-up-dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("top-up.top-up-dialog.message")}
          </DialogDescription>
          <Button
            onClick={onClose}
            className={
              "absolute -right-2 top-0 h-fit w-fit min-w-fit rounded-sm bg-transparent p-1"
            }
          >
            <Cross2Icon className={cn("h-5 w-5")} />
          </Button>
        </DialogHeader>
        <div className="flex flex-col gap-2 pb-0 md:pb-2">
          <div className="flex flex-col items-center">
            {qrUrl && (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={qrUrl}
                  alt="Payment QR"
                  width={280}
                  height={280}
                  id="payment-qr-capture"
                />
                <div className="flex w-full gap-2">
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
            {t("payment-methods.qr-method.note-content-topup")}
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
                copyToClipboard(orgPaymentData?.bank_account_number ?? "32288");
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
            {t("payment-methods.qr-method.bankingInformation.bankAccountName")}{" "}
            {orgPaymentData?.bank_account_name ?? "CÔNG TY CỔ PHẦN FERRY VN"}
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
        </div>
        {mobileOS !== "other" && (
          <DialogFooter className="sticky bottom-0 z-[99] flex justify-center gap-2 bg-white py-2 md:hidden">
            <BankAppDrawer
              paymentTransferInfo={paymentTransferInfo}
              mobileOS={mobileOS}
              isHideNav
            />
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(TopUpDialog);
