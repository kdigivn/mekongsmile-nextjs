"use client";

import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import React, { memo } from "react";
import { useTranslation } from "@/services/i18n/client";

type Props = {
  data: CancelTicketRequest;
};
const CancelPositionsCell = ({ data }: Props) => {
  const { t } = useTranslation("user/cancel-ticket-request");

  const { organization_related } = data;

  if (organization_related.length <= 0) {
    return (
      <div className="text-sm">
        <span className="text-red-500">
          {t("table.cancel-positions-cell.no_cancelled_positions")}
        </span>
      </div>
    );
  }

  const order = organization_related[0]?.order;

  if (
    data.cancel_ticket_by_positions &&
    data.cancel_ticket_by_positions?.length === 0
  ) {
    return (
      <div className="text-sm">
        <span className="text-red-500">
          {t("table.cancel-positions-cell.no_cancelled_positions")}
        </span>
      </div>
    );
  }

  return (
    <ul className="m-0 flex flex-wrap gap-1 p-0">
      {order?.tickets?.map((ticket) => {
        if (
          data.cancel_ticket_by_positions &&
          data.cancel_ticket_by_positions.includes(ticket.position_id)
        ) {
          return (
            <li key={ticket.position_id} className="flex items-center gap-1">
              <span className="rounded bg-red-200 px-2 py-1 text-sm font-semibold">
                {ticket.seat_name}
              </span>
            </li>
          );
        }
        return <></>;
      })}
    </ul>
  );
};

export default memo(CancelPositionsCell);
