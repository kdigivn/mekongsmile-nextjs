"use client";

import type React from "react";
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  type ApplyVoucherRequest,
  useApplyVoucherQuery,
} from "@/services/apis/voucher/voucher.service";
import type { Voucher } from "@/services/apis/voucher/type/voucher";
import { AmountChangeTypeEnum } from "@/services/apis/ticket-price-additions/types/ticket-price-addition-enum";
import { formatCurrency } from "@/lib/utils";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CircularProgress, Alert } from "@heroui/react";
import { useTranslation } from "@/services/i18n/client";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { CreateOrder } from "@/services/apis/orders/types/order";

interface ApplyVoucherModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleListVoucher: () => void;
  onApplyVoucher: (vouchers: Voucher[]) => boolean;
  orderToApplyVoucher: CreateOrder | undefined;
  vouchers?: Voucher[];
}

function ApplyVoucherModal({
  isOpen,
  setIsOpen,
  onApplyVoucher,
  orderToApplyVoucher,
  vouchers = [],
  handleListVoucher,
}: ApplyVoucherModalProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voucherStatus, setVoucherStatus] = useState<{
    checked: boolean;
    valid: boolean;
    voucher?: Voucher;
    message?: string;
  }>({
    checked: false,
    valid: false,
  });

  const { applyVoucherAsync } = useApplyVoucherQuery(voucherCode);
  const { t } = useTranslation("ticket-detail");
  const { confirmDialog } = useConfirmDialog();

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim() || !orderToApplyVoucher) return;

    if (vouchers.some((v) => v.voucher_code === voucherCode)) {
      setVoucherStatus({
        checked: true,
        valid: false,
        message: t("voucher.apply.alreadyApplied"),
      });
      return;
    }

    setIsLoading(true);

    const showStatus = (valid: boolean, message: string, voucher?: Voucher) => {
      setVoucherStatus({
        checked: true,
        valid,
        voucher,
        message,
      });
    };

    try {
      const payload: ApplyVoucherRequest = {
        voucher_code: voucherCode,
        order_payload: orderToApplyVoucher,
      };

      const response = await applyVoucherAsync(payload);
      const newVoucher = response.voucher;

      if (response.isApplicable && newVoucher) {
        const hasUniqueConflict =
          (newVoucher.is_unique || vouchers.some((v) => v.is_unique)) &&
          vouchers.length > 0;

        const applyVoucher = (newVouchers: Voucher[]) => {
          const success = onApplyVoucher(newVouchers);
          if (success) {
            showStatus(true, t("voucher.apply.success"), newVoucher);
          } else {
            showStatus(false, t("voucher.apply.exceedOrderValue"));
          }
        };

        if (hasUniqueConflict) {
          confirmDialog({
            title: t("voucher.apply.uniqueVoucher.title"),
            message: t("voucher.apply.uniqueVoucher.message"),
            successButtonText: "OK",
            successButtonAction: () => applyVoucher([newVoucher]),
          });
        } else {
          applyVoucher([...vouchers, newVoucher]);
        }
      } else {
        showStatus(false, t("voucher.apply.notApplicable", { voucherCode }));
      }
    } catch (error) {
      console.error(error);
      showStatus(false, t("voucher.apply.failed"));
    } finally {
      setIsLoading(false);
    }
  }, [
    voucherCode,
    orderToApplyVoucher,
    vouchers,
    applyVoucherAsync,
    onApplyVoucher,
    confirmDialog,
    t,
  ]);

  const resetVoucher = () => {
    setVoucherCode("");
    setVoucherStatus({
      checked: false,
      valid: false,
      message: "",
      voucher: undefined,
    });
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Only reset if the voucher wasn't successfully applied
    if (!voucherStatus.valid) {
      resetVoucher();
    }
  }, [setIsOpen, voucherStatus.valid]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      //reset voucher status if the voucher code is not empty and the voucher is not valid
      if (e.target.value.length > 0 && voucherStatus.checked) {
        setVoucherStatus({
          checked: false,
          valid: false,
        });
      }
      setVoucherCode(e.target.value);
    },
    [voucherStatus.checked]
  );

  return (
    <Popover open={isOpen} onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <Button
          variant={"default"}
          className="w-fit"
          size={"sm"}
          type="button"
          onClick={handleListVoucher}
        >
          {t("voucher.input.button")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-md z-50 w-full max-w-sm bg-white p-4 opacity-100 shadow-md"
        align="end"
      >
        <PopoverArrow className="fill-white" />

        <div className="space-y-2">
          <div className="text-sm font-medium">{t("voucher.apply.title")}</div>
          <p className="text-sm text-muted-foreground">
            {t("voucher.apply.description")}
          </p>

          <div className="flex items-center space-x-2">
            <Input
              placeholder={t("voucher.input.placeholder")}
              value={voucherCode}
              onChange={onChange}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleApplyVoucher}
              disabled={
                !voucherCode.trim() ||
                isLoading ||
                (voucherStatus.checked && !voucherStatus.valid)
              }
            >
              {isLoading ? (
                <CircularProgress className="h-2 w-2" />
              ) : (
                t("voucher.apply.button")
              )}
            </Button>
          </div>

          {voucherStatus.checked && voucherStatus.message && (
            <Alert
              variant="faded"
              color={voucherStatus.valid ? "success" : "danger"}
              description={voucherStatus.message}
            />
          )}

          {voucherStatus.valid && voucherStatus.voucher && (
            <div className="text-sm font-medium text-green-600">
              {t("voucher.apply.discountApplied")}
              {voucherStatus.voucher.amount_type ===
              AmountChangeTypeEnum.PERCENTAGE
                ? `-${voucherStatus.voucher.amount}%`
                : `-${formatCurrency(voucherStatus.voucher.amount ?? 0)}`}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default memo(ApplyVoucherModal);
