"use client";

import CreateCancelTicketRequestDialog from "@/components/dialog/cancel-ticket-request/create-cancel-ticket-request-dialog-by-step";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoolean } from "@/hooks/use-boolean";
import { Order } from "@/services/apis/orders/types/order";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { memo, useCallback, useRef, useState } from "react";
import { MdDownloading } from "react-icons/md";
import { TbCalendarCancel, TbTicketOff } from "react-icons/tb";

type OrderDetailProps = {
  depart_order?: Order;
  return_order?: Order;
};
function CellAction({ depart_order, return_order }: OrderDetailProps) {
  const [cancelTicketOrderData, setCancelTicketOrderData] =
    useState<Order | null>(null);

  const { t } = useTranslation("user/bookings");
  const openCancelTicketRequestDialog = useBoolean(false);
  const exportDepartRef = useRef<HTMLAnchorElement | null>(null);
  const exportReturnRef = useRef<HTMLAnchorElement | null>(null);
  const exportDepartHarborRef = useRef<HTMLAnchorElement | null>(null);
  const exportReturnHarborRef = useRef<HTMLAnchorElement | null>(null);

  const handleExportPDF = useCallback(() => {
    exportDepartRef?.current?.click();
    if (return_order?.tickets_file) {
      exportReturnRef?.current?.click();
    }
  }, [return_order?.tickets_file]);

  const handleHarborFile = useCallback(() => {
    if (depart_order?.harbor_fee_file) {
      exportDepartHarborRef?.current?.click();
    }
    if (return_order?.harbor_fee_file) {
      exportReturnHarborRef?.current?.click();
    }
  }, [depart_order?.harbor_fee_file, return_order?.harbor_fee_file]);

  const handleCloseCancelTicketRequestDialog = useCallback(() => {
    openCancelTicketRequestDialog.onFalse();
  }, [openCancelTicketRequestDialog]);

  const handleOpenCancelTicketRequestForDepartOrder = useCallback(() => {
    if (depart_order) {
      setCancelTicketOrderData(depart_order);
      openCancelTicketRequestDialog.onTrue();
    }
  }, [depart_order, openCancelTicketRequestDialog]);

  const handleOpenCancelTicketRequestForReturnOrder = useCallback(() => {
    if (return_order) {
      setCancelTicketOrderData(return_order);
      openCancelTicketRequestDialog.onTrue();
    }
  }, [return_order, openCancelTicketRequestDialog]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={depart_order?.tickets_file ? false : true}
        type="submit"
        variant={"outline"}
        className="w-fit gap-1 rounded-md px-6 py-2"
        onClick={handleExportPDF}
      >
        <MdDownloading className="h-5 w-5" />
        <span>{t("table.cell.download-ticket")}</span>
        {depart_order?.tickets_file?.path && (
          <a
            ref={exportDepartRef}
            href={depart_order?.tickets_file?.path}
            className="hidden"
            target="_blank"
          ></a>
        )}
        {return_order?.tickets_file?.path && (
          <a
            ref={exportReturnRef}
            href={return_order?.tickets_file?.path}
            className="hidden"
            target="_blank"
          ></a>
        )}
      </Button>
      {depart_order?.harbor_fee_file || return_order?.harbor_fee_file ? (
        <Button
          type="submit"
          variant={"outline"}
          className="w-fit gap-1 rounded-md px-6 py-2"
          onClick={handleHarborFile}
        >
          <MdDownloading className="h-5 w-5" />
          <span>Xuất file phí cảng</span>
          {depart_order?.harbor_fee_file && (
            <a
              ref={exportDepartHarborRef}
              href={depart_order?.harbor_fee_file?.path}
              className="hidden"
              target="_blank"
            ></a>
          )}
          {return_order?.harbor_fee_file && (
            <a
              ref={exportReturnHarborRef}
              href={return_order?.harbor_fee_file?.path}
              className="hidden"
              target="_blank"
            ></a>
          )}
        </Button>
      ) : (
        <></>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger className="w-fit">
          <Button
            variant={"default"}
            className="w-fit gap-1 rounded-md px-6 py-2"
          >
            <TbTicketOff className="h-5 w-5" />
            <span>{t("table.action-cell.cancel-ticket")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleOpenCancelTicketRequestForDepartOrder}
              disabled={depart_order?.order_status !== OrderStatusEnum.Booked}
            >
              <TbCalendarCancel className="mr-2 h-5 w-5" />
              {t("table.action-cell.depart-cancel-ticket")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleOpenCancelTicketRequestForReturnOrder}
              disabled={
                !return_order ||
                return_order?.order_status !== OrderStatusEnum.Booked
              }
            >
              <TbCalendarCancel className="mr-2 h-5 w-5" />
              {t("table.action-cell.return-cancel-ticket")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCancelTicketRequestDialog
        open={openCancelTicketRequestDialog.value}
        onClose={handleCloseCancelTicketRequestDialog}
        order={cancelTicketOrderData}
      />
    </div>
  );
}

export default memo(CellAction);
