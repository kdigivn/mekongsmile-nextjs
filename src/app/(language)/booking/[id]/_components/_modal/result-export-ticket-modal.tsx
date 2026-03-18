import { Button } from "@/components/ui/button";
import { Order } from "@/services/apis/orders/types/order";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { memo, useCallback, useEffect, useRef } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { MdDownloading } from "react-icons/md";
import { RiHome4Line, RiMessage3Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
type Props = {
  isOpenExportResult: boolean;
  setIsOpenExportResult: (isOpen: boolean) => void;
  setIsConfirm: (isConfirmIssue: boolean) => void;
  departOrder?: Order;
  returnOrder?: Order;
};

function ResultExportTicketModal({
  isOpenExportResult,
  setIsOpenExportResult,
  departOrder,
  returnOrder,
  setIsConfirm,
}: Props) {
  const exportDepartTicketRef = useRef<HTMLAnchorElement | null>(null);
  const exportReturnTicketRef = useRef<HTMLAnchorElement | null>(null);
  const { t } = useTranslation("booking");
  const router = useRouter();
  const language = useLanguage();
  const handleExportDepartTicketPDF = useCallback(() => {
    if (departOrder?.tickets_file) {
      exportDepartTicketRef?.current?.click();
    }
  }, [departOrder?.tickets_file]);

  const handleExportReturnTicketPDF = useCallback(() => {
    if (returnOrder?.tickets_file) {
      exportReturnTicketRef?.current?.click();
    }
  }, [returnOrder?.tickets_file]);

  const handleReturnHome = useCallback(() => {
    router.push(`/${language}`);
  }, [language, router]);

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpenExportResult) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpenExportResult, showNav]);

  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isOpenExportResult}
      size="xl"
      backdrop="blur"
      radius="sm"
      // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
      onOpenChange={(isOpen) => {
        setIsOpenExportResult(isOpen);
        if (!isOpen) {
          setIsConfirm(false);
        }
      }}
      // onClose={() => {
      //   setIsConfirm(false);
      // }}
    >
      <ModalContent>
        {() =>
          departOrder?.order_status === OrderStatusEnum.Booked ? (
            <ModalBody className="flex flex-col items-center justify-center gap-6 p-3">
              <div className="flex w-full flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                  <FaCircleCheck className="h-7 w-7 text-primary" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-base text-primary">
                    {t("export-ticket-modal.success")}
                  </div>
                </div>
                <div className="text-base font-semibold text-black">
                  {t("export-ticket-modal.downloadInfo")}
                </div>

                <div className="flex w-full flex-row gap-3">
                  <Button
                    disabled={departOrder?.tickets_file ? false : true}
                    // type="submit"
                    className="flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                    onClick={handleExportDepartTicketPDF}
                  >
                    <MdDownloading className="h-5 w-5" />
                    <span>{t("export-ticket-modal.departTicket")}</span>
                    {departOrder?.tickets_file.path && (
                      <a
                        target="_blank"
                        ref={exportDepartTicketRef}
                        href={departOrder?.tickets_file.path}
                        className="hidden"
                      ></a>
                    )}
                  </Button>
                  <Button
                    disabled={returnOrder?.tickets_file ? false : true}
                    // type="submit"

                    className="flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
                    onClick={handleExportReturnTicketPDF}
                  >
                    <MdDownloading className="h-5 w-5" />
                    <span>{t("export-ticket-modal.returnTicket")}</span>
                    {returnOrder?.tickets_file.path && (
                      <a
                        target="_blank"
                        ref={exportReturnTicketRef}
                        href={returnOrder?.tickets_file.path}
                        className="hidden"
                      ></a>
                    )}
                  </Button>
                </div>
              </div>
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
        }
      </ModalContent>
    </Modal>
  );
}

export default memo(ResultExportTicketModal);
