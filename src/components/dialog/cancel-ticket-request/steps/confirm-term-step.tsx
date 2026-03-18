"use client";

import { useCallback, memo, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogTitle } from "@/components/ui/dialog";
import LinkBase from "@/components/link-base";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { Order } from "@/services/apis/orders/types/order";
import { differenceInHours } from "date-fns";

interface ConfirmTermsStepProps {
  onNext: () => void;
  onCancel: () => void;
  order: Order;
}

const CancelTicketStatus = {
  CAN_CANCEL: "can_cancel",
  IN_NOT_ALLOW_TO_REQUEST_TIME: "in_not_allow_to_request_time",
  VOYAGE_ALREADY_DEPARTED: "voyage_already_departed",
};

const ConfirmTermsStep = ({
  onNext,
  onCancel,
  order,
}: ConfirmTermsStepProps) => {
  //   const { t } = useTranslation("user/cancel-ticket-request");
  const [isConfirm, setIsConfirm] = useState(false);
  const { settings } = useOrganizationContext();

  const isCancelTicketEnabled = useMemo(() => {
    const voyage = order?.voyage;
    const operatorCode = voyage?.operator?.operator_code;
    const rules = settings?.cancel_tickets?.rules ?? [];

    if (!operatorCode || !voyage?.departure_date || !voyage?.depart_time) {
      return CancelTicketStatus.VOYAGE_ALREADY_DEPARTED;
    }

    const matchedTimeFrames = rules
      .filter((rule) => rule.operator_code === operatorCode)
      .flatMap((rule) => rule.time_frames || [])
      .filter(Boolean)
      .sort((a, b) => a.to_hours - b.to_hours);

    const departureDateTime = new Date(
      `${voyage.departure_date}T${voyage.depart_time}`
    );
    const currentTimeRemain = differenceInHours(departureDateTime, new Date());

    if (currentTimeRemain <= 0) {
      return CancelTicketStatus.VOYAGE_ALREADY_DEPARTED;
    }

    const isInNotAllowTime = (() => {
      for (let i = 0; i < matchedTimeFrames.length; i++) {
        const current = matchedTimeFrames[i];
        const prev = matchedTimeFrames[i - 1];
        const from = prev?.to_hours ?? 0;
        const to = current.to_hours;
        if (currentTimeRemain > from && currentTimeRemain <= to) {
          return !!current.not_allow_to_request;
        }
      }
      return false;
    })();

    return isInNotAllowTime
      ? CancelTicketStatus.IN_NOT_ALLOW_TO_REQUEST_TIME
      : CancelTicketStatus.CAN_CANCEL;
  }, [order?.voyage, settings?.cancel_tickets?.rules]);

  const handleConfirm = useCallback(() => {
    if (isConfirm) {
      onNext();
    }
  }, [isConfirm, onNext]);

  const onCheckedChange = useCallback(() => setIsConfirm((prev) => !prev), []);

  const handleCancel = useCallback(() => {
    setIsConfirm(false);
    onCancel();
  }, [onCancel]);

  const memoizedCancelTicketStatus = useMemo(() => {
    switch (isCancelTicketEnabled) {
      case CancelTicketStatus.CAN_CANCEL:
        return (
          <>
            <DialogTitle>
              <h4 className="mb-2 font-semibold">
                Quy định huỷ vé - Côn Đảo Express
              </h4>
            </DialogTitle>

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-2 text-sm">
                  Vui lòng đảm bảo quý khách đã đọc và hiểu rõ các quy định và
                  chính sách huỷ vé. Đọc thông tin và quy định huỷ vé tại
                  <LinkBase
                    href="https://condao.express/quy-dinh-hoan-ve-doi-ve/"
                    target="_blank"
                    className="ml-1 text-blue-500"
                  >
                    đây
                  </LinkBase>
                </div>
              </div>

              <div
                className="flex cursor-pointer items-center space-x-2"
                onClick={onCheckedChange}
              >
                <Checkbox checked={isConfirm} />
                <p>Tôi đã đọc và hiểu rõ các quy định và chính sách huỷ vé.</p>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Huỷ
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={!isConfirm}
              >
                Chấp nhận
              </Button>
            </DialogFooter>
          </>
        );
      case CancelTicketStatus.IN_NOT_ALLOW_TO_REQUEST_TIME:
        return (
          <>
            <DialogTitle>
              <h4 className="mb-2 font-semibold leading-6">
                Không thể huỷ vé do áp dụng theo quy định - Côn Đảo Express
              </h4>
            </DialogTitle>

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-2 text-sm">
                  Vui lòng đảm bảo quý khách đã đọc và hiểu rõ các quy định và
                  chính sách huỷ vé. Đọc thông tin và quy định huỷ vé tại
                  <LinkBase
                    href="https://condao.express/quy-dinh-hoan-ve-doi-ve/"
                    target="_blank"
                    className="ml-1 text-blue-500"
                  >
                    đây
                  </LinkBase>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="default" onClick={handleCancel}>
                Chấp nhận
              </Button>
            </DialogFooter>
          </>
        );
      case CancelTicketStatus.VOYAGE_ALREADY_DEPARTED:
        return (
          <>
            <DialogTitle>
              <h4 className="mb-2 font-semibold leading-6">
                Tàu đã khởi hành - Côn Đảo Express
              </h4>
            </DialogTitle>

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-2 text-sm">
                  Không thể huỷ vé do tàu đã khởi hành. Đọc thông tin và quy
                  định huỷ vé tại
                  <LinkBase
                    href="https://condao.express/quy-dinh-hoan-ve-doi-ve/"
                    target="_blank"
                    className="ml-1 text-blue-500"
                  >
                    đây
                  </LinkBase>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="default" onClick={handleCancel}>
                Chấp nhận
              </Button>
            </DialogFooter>
          </>
        );
      default:
        return (
          <>
            <DialogTitle>
              <h4 className="mb-2 font-semibold leading-6">
                Không thể huỷ vé do áp dụng theo quy định - Côn Đảo Express
              </h4>
            </DialogTitle>

            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="space-y-2 text-sm">
                  Vui lòng đảm bảo quý khách đã đọc và hiểu rõ các quy định và
                  chính sách huỷ vé. Đọc thông tin và quy định huỷ vé tại
                  <LinkBase
                    href="https://condao.express/quy-dinh-hoan-ve-doi-ve/"
                    target="_blank"
                    className="ml-1 text-blue-500"
                  >
                    đây
                  </LinkBase>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="default" onClick={handleCancel}>
                Chấp nhận
              </Button>
            </DialogFooter>
          </>
        );
    }
  }, [
    handleCancel,
    handleConfirm,
    isCancelTicketEnabled,
    isConfirm,
    onCheckedChange,
  ]);

  return memoizedCancelTicketStatus;
};

export default memo(ConfirmTermsStep);
