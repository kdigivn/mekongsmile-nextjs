/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Booking } from "@/services/apis/bookings/types/booking";
import { useTranslation } from "@/services/i18n/client";
import ButtonExportPassenger from "../button-export-passenger";

interface ExportPassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
}

function ExportPassengerModal({
  isOpen,
  onClose,
  booking,
}: ExportPassengerModalProps) {
  const { t } = useTranslation("export-passenger-modal");

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t("message")}</p>
        </div>
        <div className="flex flex-row justify-end">
          <ButtonExportPassenger
            booking={booking}
            className="w-full flex-wrap"
            classNameButton="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ExportPassengerModal);
