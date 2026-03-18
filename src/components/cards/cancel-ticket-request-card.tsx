"use client";

import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import React, { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { format } from "date-fns";
import OrderCell from "../table/user-cancel-ticket-request/cell/order-cell";
import CancelPositionsCell from "../table/user-cancel-ticket-request/cell/cancel-positions-cell";
import ProcessingStatusCell from "../table/user-cancel-ticket-request/cell/processing-status-cell";
import ActionCell from "../table/user-cancel-ticket-request/cell/action-cell";

type Props = {
  data: CancelTicketRequest;
};

const CancelTicketRequestCard = ({ data }: Props) => {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex justify-between">
          <div className="flex flex-col justify-center gap-1">
            <div className="flex w-full items-center gap-1">
              <span className="text-sm font-semibold">ID: </span>
              <span className="text-sm">{data.id}</span>
              <ProcessingStatusCell data={data} />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">Ngày tạo: </span>
              <span className="text-sm font-normal">
                {data.createdAt
                  ? format(new Date(`${data.createdAt}`), "HH:mm dd/MM/yyyy")
                  : ""}
              </span>
            </div>
          </div>

          <ActionCell data={data} />
        </div>

        <OrderCell data={data} />

        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-2">
          <span className="text-sm font-semibold">Vị trí vé hủy: </span>
          <CancelPositionsCell data={data} />
        </div>

        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-2">
          <span className="text-sm font-semibold">Lý do hủy vé: </span>
          <span className="text-sm">{data.cancel_reason}</span>
        </div>

        {data.reject_message && data.reject_message?.length && (
          <div className="flex items-center gap-1 rounded-md bg-gray-100 p-2">
            <span className="text-sm font-semibold">Lý do từ chối: </span>
            <span className="text-sm">{data.reject_message}</span>
          </div>
        )}

        {data.recall_message && data.recall_message?.length && (
          <div className="flex items-center gap-1 rounded-md bg-gray-100 p-2">
            <span className="text-sm font-semibold">Lý do thu hồi: </span>
            <span className="text-sm">{data.recall_message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(CancelTicketRequestCard);
