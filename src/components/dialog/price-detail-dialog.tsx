import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "@/services/i18n/client";
import { TicketPriceAddition } from "@/services/apis/ticket-price-additions/types/ticket-price-addition";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { MdArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import {
  AmountChangeTypeEnum,
  TicketPriceAdditionChangeTypeEnum,
} from "@/services/apis/ticket-price-additions/types/ticket-price-addition-enum";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  voyageItem?: VoyageItem;
};

const PriceDetailsDialog = ({ isOpen, onClose, voyageItem }: Props) => {
  const { t } = useTranslation("home");
  // Use default_ticket_price as the final price
  const finalPrice =
    voyageItem?.voyage?.ticket_prices?.default_ticket_price || 0;

  const matchedTicketPrice = useMemo(
    () =>
      voyageItem?.voyage?.ticket_prices?.prices?.find(
        (price) => price?.is_default
      ) || voyageItem?.voyage?.ticket_prices?.prices?.[0],
    [voyageItem?.voyage?.ticket_prices?.prices]
  );

  const changeTicketPrice = matchedTicketPrice?.additionalAmount || 0;

  // Giá trước khi áp dụng các ticket price addition (is_display = true)
  const calculatedOriginalPrice = finalPrice - changeTicketPrice;

  // Filter only additions that should be displayed
  const displayAdditions = useMemo(
    () => matchedTicketPrice?.additions || [],
    [matchedTicketPrice?.additions]
  );

  const discounts = displayAdditions.filter(
    (addition) =>
      addition.change_type === TicketPriceAdditionChangeTypeEnum.Decrease
  );

  const increases = displayAdditions.filter(
    (addition) =>
      addition.change_type === TicketPriceAdditionChangeTypeEnum.Increase
  );

  const isPriceHigher = changeTicketPrice > 0;
  const isPriceLower = changeTicketPrice < 0;

  const showAmount = useCallback((addition: TicketPriceAddition) => {
    if (!addition.amount) return "";
    const formattedAmount =
      addition.amount_change_type === AmountChangeTypeEnum.FLAT
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "VND",
          }).format(addition.amount)
        : `${addition.amount}%`;
    const change_type_text = addition.change_type === "INC" ? "+ " : "- ";
    const displayAmount = `${change_type_text}${formattedAmount}`;
    return displayAmount;
  }, []);

  const getPriceColor = useCallback(() => {
    if (isPriceLower) return "success-500";
    if (isPriceHigher) return "warning-500";
    return "inherit";
  }, [isPriceHigher, isPriceLower]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>{t("table.cell.ticket_price_details")}</DialogTitle>
        <div className="py-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {t("table.cell.initial_ticket_price")}
            </p>
            <p>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "VND",
              }).format(calculatedOriginalPrice)}
            </p>
          </div>

          {/* Discounts section */}
          {discounts.length > 0 && (
            <div className="mt-4 border-t border-divider pt-4">
              <p className="mb-2 font-medium text-success-500">
                {t("table.cell.promotion")}
              </p>
              <div className="pl-4">
                {discounts.map((discount, index) => (
                  <div
                    key={`discount-${index}`}
                    className="mb-1 flex justify-between"
                  >
                    <p className="text-success-500">{discount.title}</p>
                    <p className="text-success-500">{showAmount(discount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Increases section */}
          {increases.length > 0 && (
            <div className="mt-4 border-t border-divider pt-4">
              <p className="mb-2 font-medium text-warning-500">
                {t("table.cell.surcharge")}
              </p>
              <div className="pl-4">
                {increases.map((increase, index) => (
                  <div
                    key={`increase-${index}`}
                    className="mb-0.5 flex justify-between"
                  >
                    <p className="text-warning-500">{increase.title}</p>
                    <p className="text-warning-500">{showAmount(increase)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final calculation */}
          <div className="mt-6 border-t-2 border-divider pt-4">
            <div className="flex flex-col items-end justify-between md:flex-row md:items-center">
              <div className="flex items-center">
                <p className="font-medium">
                  {t("table.cell.initial_ticket_price")}
                </p>
                <MdArrowRight color="action" />
                <p className="font-medium">{t("table.cell.final_price")}</p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "VND",
                  }).format(calculatedOriginalPrice)}
                </p>
                <MdArrowRight color="action" />
                <p color={getPriceColor()} className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "VND",
                  }).format(finalPrice)}
                </p>
              </div>
            </div>
            {(isPriceHigher || isPriceLower) && (
              <div className="mt-2 flex justify-end">
                <p
                  className={cn(
                    isPriceLower ? "text-success-500" : "text-warning-500"
                  )}
                >
                  {isPriceLower
                    ? t("table.cell.savings")
                    : t("table.cell.increase")}

                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "VND",
                  }).format(Math.abs(finalPrice - calculatedOriginalPrice))}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(PriceDetailsDialog);
