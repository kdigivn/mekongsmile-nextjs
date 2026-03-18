import { memo, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MdInfoOutline, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { Button } from "./ui/button";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { cn } from "@/lib/utils";
import {
  AmountChangeTypeEnum,
  TicketPriceAdditionChangeTypeEnum,
} from "@/services/apis/ticket-price-additions/types/ticket-price-addition-enum";
import { TicketPriceAddition } from "@/services/apis/ticket-price-additions/types/ticket-price-addition";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useTranslation } from "@/services/i18n/client";

type Props = {
  wrapperClassname?: string;
  voyageItem: VoyageItem;
  onClick: () => void;
};

const ChangedTicketPriceContent = ({
  wrapperClassname,
  voyageItem,
  onClick,
}: Props) => {
  const { t } = useTranslation("home");

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
    <div className={cn("flex flex-col", wrapperClassname)}>
      {/* Base price with strike-through if modified */}
      {(isPriceHigher || isPriceLower) && (
        <div className="item-center mb-0.5 flex">
          <p className="!mr-2 text-sm font-normal text-gray-400 line-through">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "VND",
            }).format(calculatedOriginalPrice)}
          </p>

          <div className="flex items-center gap-1">
            {/* Simple price structure - show discount or increase chip */}
            {discounts.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="flex !h-6 items-center rounded-md bg-success-600 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-success-800">
                    <MdTrendingDown className="mr-1 h-3 w-3" />
                    {discounts.length > 0 && (
                      <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-[50%] bg-[rgba(0,0,0,0.1)] text-xs">
                        {discounts.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                {discounts.length > 0 && (
                  <PopoverContent className="w-64 p-0" side="top">
                    <div className="border-b border-gray-200 p-3">
                      <h3 className="font-medium">Khuyến mãi áp dụng</h3>
                    </div>
                    <div className="p-3">
                      <ul className="space-y-2">
                        {discounts.map((discount, index) => (
                          <li
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>{discount.title}</span>
                            <span className="font-medium text-success-600">
                              {showAmount(discount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            )}

            {increases.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="flex !h-6 items-center rounded-md bg-warning-600 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-warning-800">
                    <MdTrendingUp className="mr-1 h-3 w-3" />
                    {increases.length > 0 && (
                      <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-[50%] bg-[rgba(0,0,0,0.1)] text-xs">
                        {increases.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                {increases.length > 0 && (
                  <PopoverContent className="w-64 p-0" side="top">
                    <div className="border-b border-gray-200 p-3">
                      <h3 className="font-medium">Phụ thu áp dụng</h3>
                    </div>
                    <div className="p-3">
                      <ul className="space-y-2">
                        {increases.map((increase, index) => (
                          <li
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>{increase.title}</span>
                            <span className="font-medium text-warning-600">
                              {showAmount(increase)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            )}
          </div>
        </div>
      )}

      {/* Final price with info tooltip */}
      <div className="flex items-center">
        <span className={`font-medium text-${getPriceColor()}`}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "VND",
          }).format(finalPrice)}
        </span>

        {displayAdditions.length > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Button
                color="primary"
                onClick={onClick}
                variant="ghost"
                className="h-8 w-8 rounded-full p-0"
              >
                <MdInfoOutline className="text-base" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>{t("table.cell.click_to_view_price_details")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default memo(ChangedTicketPriceContent);
