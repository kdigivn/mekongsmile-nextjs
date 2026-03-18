"use client";

import { cn } from "@/lib/utils";
import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import React, { memo } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  getCancelTicketRequestProcessStatusStyles,
  getCancelTicketRequestStatusText,
} from "../helper/helper";
import { CancelTicketRequestProcessStatusEnum } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request-process-status.enum";

type Props = {
  data: CancelTicketRequest;
};

const ProcessingStatusCell = ({ data }: Props) => {
  const { t } = useTranslation("user/cancel-ticket-request");
  if (data.organization_related.length === 0) {
    return <div>{t("table.processing-status-cell.error_message")}</div>;
  }
  const current_organization = data.organization_related[0];

  return (
    <div className="flex flex-col items-start justify-start gap-2">
      {data.process_status !== CancelTicketRequestProcessStatusEnum.RECALL &&
      data.process_status !== CancelTicketRequestProcessStatusEnum.REFUNDED &&
      data.process_status !== CancelTicketRequestProcessStatusEnum.REJECT ? (
        <div
          className={cn(
            `flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium capitalize`,
            getCancelTicketRequestProcessStatusStyles(
              current_organization?.request_process_status ===
                CancelTicketRequestProcessStatusEnum.ACCEPT
                ? CancelTicketRequestProcessStatusEnum.PROCESSING
                : current_organization?.request_process_status
            )
          )}
        >
          {current_organization?.request_process_status ===
          CancelTicketRequestProcessStatusEnum.ACCEPT ? (
            <>
              {getCancelTicketRequestStatusText(
                CancelTicketRequestProcessStatusEnum.PROCESSING,
                false,
                t
              )}
            </>
          ) : (
            <>
              {getCancelTicketRequestStatusText(
                current_organization?.request_process_status,
                current_organization?.hasRefund,
                t
              )}
            </>
          )}
        </div>
      ) : (
        <div
          className={cn(
            `flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium capitalize`,
            getCancelTicketRequestProcessStatusStyles(data.process_status)
          )}
        >
          {getCancelTicketRequestStatusText(
            data.process_status,
            data.process_status ===
              CancelTicketRequestProcessStatusEnum.REFUNDED,
            t
          )}
        </div>
      )}

      {data.reject_message && data.reject_message.length && (
        <div className="rounded-md bg-gray-100 p-1 text-sm">
          {data.reject_message}
        </div>
      )}
    </div>
  );
};

export default memo(ProcessingStatusCell);
