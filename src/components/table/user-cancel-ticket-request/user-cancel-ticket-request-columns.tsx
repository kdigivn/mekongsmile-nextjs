"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import OrderCell from "./cell/order-cell";
import CancelPositionsCell from "./cell/cancel-positions-cell";
import ActionCell from "./cell/action-cell";
import ProcessingStatusCell from "./cell/processing-status-cell";
import CopyButton from "@/components/button/copy-button";
import { useTranslation } from "@/services/i18n/client";

import React, { useMemo } from "react";

export const useGetUserCancelTicketRequestColumns = () => {
  const { t } = useTranslation("user/cancel-ticket-request");
  const userCancelTicketRequestColumns: ColumnDef<CancelTicketRequest>[] =
    useMemo(
      () => [
        {
          accessorKey: "id",
          header: () => <div>{t("table.headers.id")}</div>,
          cell: ({ row }) => {
            const { createdAt } = row.original;
            const date = formatDate(createdAt ?? "", "HH:mm dd/MM/yyyy");

            return (
              <div className="flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  <div>{row.getValue("id")}</div>
                  <CopyButton textToCopy={row.original.id} />
                </div>
                <p className="w-[140px] text-sm">{date}</p>
              </div>
            );
          },
          size: 150,
        },
        {
          accessorKey: "order",
          header: () => <div>{t("table.headers.order_info")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            return <OrderCell data={data_row} />;
          },
          size: 550,
        },
        {
          accessorKey: "cancel_ticket_by_positions",
          header: () => <div>{t("table.headers.cancel_positions")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            return <CancelPositionsCell data={data_row} />;
          },
        },
        {
          accessorKey: "cancel_reason",
          header: () => <div>{t("table.headers.cancel_reason")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            return (
              <div className="flex items-center gap-2">
                <div className="text-sm">{data_row.cancel_reason}</div>
              </div>
            );
          },
        },
        {
          accessorKey: "reject_message",
          header: () => <div>{t("table.headers.recall_reason")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            if (!data_row.recall_message?.length) {
              return (
                <div className="flex items-center gap-2">
                  <div className="text-sm">{t("table.no_recall_reason")}</div>
                </div>
              );
            }
            return (
              <div className="flex items-center gap-2">
                <div className="text-sm">{data_row.recall_message}</div>
              </div>
            );
          },
        },
        {
          accessorKey: "organization_related",
          header: () => <div>{t("table.headers.processing_status")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            return <ProcessingStatusCell data={data_row} />;
          },
        },
        {
          accessorKey: "action",
          header: () => <div>{t("table.headers.action")}</div>,
          cell: ({ row }) => {
            const data_row = row.original;
            return <ActionCell data={data_row} />;
          },
        },
      ],
      [t]
    );
  return userCancelTicketRequestColumns;
};
