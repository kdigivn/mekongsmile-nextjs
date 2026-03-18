/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/services/apis/bookings/types/booking";
import { useTranslation } from "@/services/i18n/client";
import {
  handleExportPassengerOrder,
  refreshWorkbook,
} from "@/services/apis/excel/excel.service";
import { cn } from "@/lib/utils";

type Props = {
  booking?: Booking;
  className?: string;
  classNameButton?: string;
};

function ButtonExportPassenger({ booking, className, classNameButton }: Props) {
  const { t } = useTranslation("export-passenger-modal");

  useEffect(() => {
    refreshWorkbook();
  }, []);

  const { return_order: returnOrder } = booking || {};

  const handleExportDepart = useCallback(() => {
    handleExportPassengerOrder(booking, false);
  }, [booking]);

  const handleExportReturn = useCallback(() => {
    handleExportPassengerOrder(booking, true);
  }, [booking]);

  if (!booking) return null;

  return (
    <div className={cn("flex flex-row gap-3", className ? `${className}` : "")}>
      <Button
        variant="default"
        color="primary"
        onClick={handleExportDepart}
        className={cn("", classNameButton ? `${classNameButton}` : "")}
      >
        {t("export-depart")}
      </Button>
      {returnOrder && (
        <Button
          variant="default"
          color="primary"
          onClick={handleExportReturn}
          className={cn("", classNameButton ? `${classNameButton}` : "")}
        >
          {t("export-return")}
        </Button>
      )}
    </div>
  );
}

export default memo(ButtonExportPassenger);
