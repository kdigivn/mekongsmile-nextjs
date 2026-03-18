"use client";

import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { cn, formatCurrency } from "@/lib/utils";
import { SeatTicket } from "@/services/apis/boatLayouts/types/seat";
import { useTranslation } from "@/services/i18n/client";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toggle } from "../ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  seatTicket: SeatTicket;
  isReadOnly?: boolean;
  className?: string;
  defaultSelected?: boolean;
  isDisabled?: boolean;
  isSelected?: boolean;
  isViewOnly?: boolean;
  /**
   * Trigger when selected seat status change. Only valid when `onValueChange` is not set i.e. only use `onValueChange` or `onSelectedSeatChange` but not both.
   * @param isSelected selected status of the seat
   * @param seatTicket the input Seat object
   * @returns
   */
  onSelectedSeatChange?: (isSelected: boolean, seatTicket: SeatTicket) => void;
  onMouseDown?: (
    id: number,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onMouseEnter?: (id: number) => void;
  onMouseUp?: (id: number) => void;
  onShiftClick?: (
    id: number,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
};

export const tooltipClassName = {
  // arrow color
  base: "before:bg-tooltip dark:before:bg-tooltip",
  content: "bg-tooltip text-tooltip-foreground text-center",
};

const SeatSelectSwitch = ({
  isReadOnly,
  seatTicket,
  className,
  defaultSelected,
  isSelected,
  isDisabled,
  isViewOnly,
  onSelectedSeatChange,
}: Props) => {
  const isMobile = useCheckMobile();
  const { t } = useTranslation("seat/seat");
  const [isPressed, setIsPressed] = useState<boolean>(defaultSelected ?? false);

  // Trigger onSelectedSeatChange every time onValueChange trigger
  const handleToggleStateChange = useCallback(
    (isPressed: boolean) => {
      if (!isReadOnly) {
        if (onSelectedSeatChange) {
          onSelectedSeatChange(isPressed, seatTicket);
        }
        setIsPressed(isPressed);
      }
      if (isViewOnly) {
        if (seatTicket.seatMetadata.IsSeat) {
          toast.error("Vui lòng chọn chuyến trước khi chọn ghế");
        }
      }
    },
    [isReadOnly, isViewOnly, onSelectedSeatChange, seatTicket]
  );

  const { seatMetadata, ticketPriceAppliedPromotions } = seatTicket;

  // const ticketTypeDefault = ticketAgeConfig.find(
  //   (config) => config.label === "adult"
  // ) ?? ;

  const seatPrice = useMemo(
    () =>
      ticketPriceAppliedPromotions
        .sort((type1, type2) => type2.price_with_VAT - type1.price_with_VAT)
        .find((type) => type.seat_type === seatMetadata.SeatType),
    [ticketPriceAppliedPromotions, seatMetadata.SeatType]
  );

  // Show tooltip only on desktop when seat has seat type, not booked or held
  const hasToolTip =
    seatMetadata.SeatType &&
    !seatMetadata.IsBooked &&
    !seatMetadata.IsHeld &&
    seatMetadata.IsSeat &&
    !isMobile;

  const tooltipContent = useMemo(
    () =>
      hasToolTip && (
        <div className="">
          <span>{`${t(`seatType.${seatMetadata.SeatType}`)} `}</span>
          {seatPrice && formatCurrency(seatPrice.price_with_VAT) && (
            <span>{`${formatCurrency(seatPrice.price_with_VAT)}`}</span>
          )}
        </div>
      ),
    [hasToolTip, t, seatMetadata.SeatType, seatPrice]
  );

  return seatMetadata.IsRender ? (
    <div
      style={{
        gridColumn: `span ${seatMetadata.ColSpan}/span ${seatMetadata.ColSpan}`,
        gridRow: `span ${seatMetadata.RowSpan}/span ${seatMetadata.RowSpan}`,
      }}
    >
      {hasToolTip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                data-position-id={seatMetadata.PositionId}
                aria-label="toggle selected seat"
                className={cn(
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  "h-full min-h-9 w-full min-w-9 p-1",
                  "flex items-center justify-center",
                  "rounded-lg",
                  isReadOnly ? "cursor-default" : "",
                  className
                )}
                pressed={isSelected ?? isPressed}
                onPressedChange={handleToggleStateChange}
                defaultPressed={defaultSelected}
                disabled={isDisabled}
              >
                {seatMetadata.SeatName.toUpperCase()}
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent className="z-50 rounded-md bg-tooltip p-1 text-center text-sm text-tooltip-foreground">
            {tooltipContent}
            {/* <TooltipArrow /> */}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Toggle
          aria-label="toggle selected seat"
          className={cn(
            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
            "h-full min-h-9 w-full min-w-9 p-1",
            "flex items-center justify-center",
            "rounded-lg",
            isReadOnly ? "cursor-default" : "",
            className
          )}
          pressed={isSelected ?? isPressed}
          onPressedChange={handleToggleStateChange}
          defaultPressed={defaultSelected}
          disabled={isDisabled}
        >
          {seatMetadata.SeatName.toUpperCase()}
        </Toggle>
      )}
    </div>
  ) : (
    <div
      style={{
        gridColumn: `span ${seatMetadata.ColSpan}/span ${seatMetadata.ColSpan}`,
        gridRow: `span ${seatMetadata.RowSpan}/span ${seatMetadata.RowSpan}`,
      }}
      className={cn("h-full min-h-9 w-full min-w-9", className)}
    ></div>
  );
};

export default memo(SeatSelectSwitch);
