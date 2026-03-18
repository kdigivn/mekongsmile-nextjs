"use client";

/* eslint-disable @arthurgeron/react-usememo/require-usememo */

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";
import TransactionDataTable from "@/components/table/transaction/transaction-data-table";
import { transactionColumns } from "@/components/table/transaction/transaction-columns";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

type Props = {
  isOpen: boolean;
  onPrimaryPress?: () => void;
  bookingId: string;
};

function ModalTransactionHistoryOrder({
  isOpen,
  onPrimaryPress,
  bookingId,
}: Props) {
  const { t } = useTranslation("user/transaction");
  const [alreadyOpen, setAlreadyOpen] = useState(false);
  // Set already open to true when modal is opened
  if (isOpen && !alreadyOpen) {
    setAlreadyOpen(true);
  }

  const { hideNav, showNav } = useMobileBottomNavActions();

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
      hideCloseButton
      size="5xl"
      backdrop="blur"
      className="!mx-0 my-0 h-full !max-h-fit overflow-auto rounded-none p-3 md:!mx-6 md:h-[90%] md:rounded-md"
      onOpenChange={onPrimaryPress}
    >
      <ModalContent>
        {(onClose) => (
          <div className="flex h-full flex-col gap-2">
            <ModalHeader className="flex-row items-center justify-between gap-2 p-0">
              <p className="text-base font-bold">{t("table.title")}</p>
              <Button
                variant={"outline"}
                aria-label={""}
                className="h-10 w-10 min-w-0 flex-none translate-x-0 rounded border-none p-1 text-base text-black shadow-none hover:bg-danger-300 md:-translate-x-5 xl:-translate-x-0"
                size={"icon"}
                onClick={onClose}
              >
                <IoClose className="h-6 w-6" />
              </Button>
            </ModalHeader>
            <ModalBody className="!p-0">
              <TransactionDataTable
                columns={transactionColumns}
                bookingId={bookingId}
                isOpen={isOpen}
              ></TransactionDataTable>
            </ModalBody>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
export default memo(ModalTransactionHistoryOrder);
