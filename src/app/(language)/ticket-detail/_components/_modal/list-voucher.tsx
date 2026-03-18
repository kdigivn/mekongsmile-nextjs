"use client";

import type React from "react";
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import type { Voucher } from "@/services/apis/voucher/type/voucher";
import { AmountChangeTypeEnum } from "@/services/apis/ticket-price-additions/types/ticket-price-addition-enum";
import { cn, formatCurrencyWithShorten } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Chip } from "@heroui/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipContent } from "@/components/ui/tooltip";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";
import { AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { useTranslation } from "react-i18next";
import {
  TooltipResponsive,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";

interface ListVoucherModalProps {
  onRemoveVoucher?: (vouchers: Voucher[]) => void;
  vouchers?: Voucher[];
  showDetailButton?: boolean;
}

function ListVoucherModal({
  onRemoveVoucher,
  vouchers,
  showDetailButton = true,
}: ListVoucherModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("ticket-detail");
  const { hideNav, showNav } = useMobileBottomNavActions();

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    hideNav();
  }, [hideNav]);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    showNav();
  }, [showNav]);

  const handleRemoveVoucher = useCallback(
    (voucher: Voucher) => {
      onRemoveVoucher?.(vouchers?.filter((v) => v.id !== voucher.id) ?? []);
    },
    [onRemoveVoucher, vouchers]
  );

  return (
    <div className="flex w-full flex-wrap gap-1">
      <div className="flex w-full flex-wrap gap-1">
        {vouchers?.slice(0, 2).map((voucher) => (
          <Chip
            key={voucher.id}
            variant="bordered"
            color="success"
            size="sm"
            onClick={handleOpenModal}
            className="hover:bg-success-50"
          >
            <span className="block max-w-44 cursor-pointer overflow-hidden truncate text-ellipsis">
              {voucher.title}
            </span>
          </Chip>
        ))}
        {vouchers && vouchers.length > 2 && (
          <span
            className="block cursor-pointer text-sm text-success-500"
            onClick={handleOpenModal}
          >
            {t("voucher.list.moreVouchers", { count: vouchers.length - 2 })}
          </span>
        )}
      </div>
      {showDetailButton && vouchers && vouchers.length > 0 && (
        <p
          className="m-0 w-full cursor-pointer text-end text-sm text-primary-500 hover:text-primary-600"
          onClick={handleOpenModal}
        >
          {t("voucher.list.viewMore")}
        </p>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-fit max-h-full w-full md:w-fit md:min-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("voucher.list.title")}</DialogTitle>
            <DialogDescription>
              {t("voucher.list.description")}
            </DialogDescription>
          </DialogHeader>

          {vouchers && vouchers.length > 0 ? (
            <div className="flex h-fit max-h-[500px] flex-col gap-4 overflow-y-auto">
              {vouchers.map((voucher) => (
                <div key={voucher.id}>
                  <VoucherCard
                    voucher={voucher}
                    onRemove={handleRemoveVoucher}
                    showRemoveButton={showDetailButton}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-green-600">
              {t("voucher.list.noVouchers")}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              {t("voucher.list.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default memo(ListVoucherModal);

interface VoucherCardProps {
  voucher: Voucher;
  onRemove?: (voucher: Voucher) => void;
  showRemoveButton?: boolean;
  className?: string;
}

export const VoucherCard = memo(function VoucherCard({
  voucher,
  onRemove,
  showRemoveButton = true,
  className,
}: VoucherCardProps) {
  const { t } = useTranslation("ticket-detail");
  const onClick = useCallback(() => onRemove?.(voucher), [onRemove, voucher]);
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-md", className)}
    >
      {/* Decorative elements */}
      <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-white"></div>
      <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-white"></div>

      <div className="flex flex-col gap-2 rounded-md border-2 border-primary-500 p-4 py-3">
        <div className="grid grid-cols-12 content-center gap-2">
          <div className="col-span-4 flex h-20 items-center justify-center self-center px-1 text-xl font-bold text-teal-600 md:col-span-3">
            {voucher.amount_type === AmountChangeTypeEnum.PERCENTAGE
              ? `${voucher.amount}%`
              : formatCurrencyWithShorten(voucher.amount ?? 0)}
          </div>
          <div className="col-span-8 flex h-full flex-col justify-between gap-2 border-l border-dashed border-primary-500 px-2 md:col-span-9">
            <h3 className="m-0 block max-w-80 cursor-pointer overflow-hidden truncate text-ellipsis text-base font-bold">
              {voucher.title}
            </h3>
            <div className="grid grid-cols-10 justify-end gap-2">
              <div className="col-span-7 flex flex-col gap-1">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger
                      className="m-0 p-0 text-primary-500 !no-underline"
                      iconClass="hidden"
                    >
                      {t("voucher.list.details")}
                    </AccordionTrigger>
                    <AccordionContent>{voucher.description}</AccordionContent>
                  </AccordionItem>
                </Accordion>

                {voucher.effectiveTo && (
                  <span className="text-sm text-gray-500">
                    {t("voucher.list.expiryDate")}:{" "}
                    {formatDate(voucher.effectiveTo, "dd/MM/yyyy")}
                  </span>
                )}
              </div>
              <Button
                className="col-span-3 flex w-full self-end border-2 border-primary-500 font-semibold text-primary-500"
                onClick={onClick}
                disabled={!showRemoveButton}
                variant="outline"
                size="sm"
              >
                {showRemoveButton
                  ? t("voucher.list.remove")
                  : t("voucher.list.applied")}
              </Button>
            </div>
          </div>
          {voucher.is_unique && (
            <TooltipResponsive>
              <TooltipResponsiveTrigger asChild>
                <span className="absolute left-0 top-0 rounded-md rounded-bl-none rounded-tr-none bg-gradient-to-r from-success-500 to-primary-500 p-1 px-2 text-sm text-white">
                  {t("voucher.list.uniqueVoucher.label")}
                </span>
              </TooltipResponsiveTrigger>
              <TooltipContent>
                <p>{t("voucher.list.uniqueVoucher.tooltip")}</p>
              </TooltipContent>
            </TooltipResponsive>
          )}
        </div>
      </div>
    </div>
  );
});
