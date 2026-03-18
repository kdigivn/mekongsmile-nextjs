"use client";

import RecallCancelTicketRequestDialog from "@/components/dialog/cancel-ticket-request/recall-cancel-ticket-request-dialog";
import { Button } from "@/components/ui/button";
import { useBoolean } from "@/hooks/use-boolean";
import { CancelTicketRequest } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import { CancelTicketRequestProcessStatusEnum } from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request-process-status.enum";
import { useTranslation } from "@/services/i18n/client";
import React, { memo, useCallback, useMemo } from "react";
import { IoIosUndo } from "react-icons/io";

type Props = {
  data: CancelTicketRequest;
};

const ActionCell = ({ data }: Props) => {
  const openRecallCancelTicketDialog = useBoolean(false);
  const { t } = useTranslation("user/cancel-ticket-request");

  const handleOpenRecallCancelTicketDialog = useCallback(() => {
    openRecallCancelTicketDialog.onTrue();
  }, [openRecallCancelTicketDialog]);

  const isDisabledRecallCancelTicketRequest = useMemo(() => {
    if (
      data.process_status === CancelTicketRequestProcessStatusEnum.RECALL ||
      data.process_status === CancelTicketRequestProcessStatusEnum.REJECT ||
      data.process_status === CancelTicketRequestProcessStatusEnum.REFUNDED
    ) {
      return true;
    }

    return false;
  }, [data.process_status]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size={"sm"}
          variant="default"
          onClick={handleOpenRecallCancelTicketDialog}
          className="flex items-center gap-2"
          disabled={isDisabledRecallCancelTicketRequest}
        >
          <IoIosUndo size={16} />
          <span>{t("table.action-cell.button.recall")}</span>
        </Button>
      </div>

      <RecallCancelTicketRequestDialog
        open={openRecallCancelTicketDialog.value}
        onClose={openRecallCancelTicketDialog.onFalse}
        cancelTicketRequest={data}
      />
    </>
  );
};

export default memo(ActionCell);
