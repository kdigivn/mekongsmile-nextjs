import { SeatColorWithType } from "@/services/apis/boatLayouts/types/seat";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import React, { memo } from "react";
import { useTranslation } from "@/services/i18n/client";
import { getTicketPriceIdsByOperatorCode } from "@/services/apis/tickets/types/ticket-type-config";
import { Legend } from "./seat-legend";
import { SEAT_TYPE } from "@/services/apis/boatLayouts/types/seat-type-enum";

type Props = {
  seatTypeColors: SeatColorWithType[];
  ticketPrices: TicketPrice[];
  // ticketPromotions: TicketPromotion[];
  operatorCode: string;
};
const SeatLegendFixedLabel = ({
  seatTypeColors,
  ticketPrices,
  // ticketPromotions,
  operatorCode,
}: Props) => {
  const { t: seatTranslation } = useTranslation("seat/seat");
  const legends: Legend[] = [];
  const bookedAndHoldLegends: Legend[] = [];

  if (seatTypeColors?.length) {
    legends.push(
      ...seatTypeColors?.map((seatTypeColor) => {
        // If seat type is valid, find price of seat type with highest price
        const priceType = getTicketPriceIdsByOperatorCode(
          operatorCode,
          ticketPrices.filter(
            (type) => type.seat_type === seatTypeColor.seatType
          )
        );
        // ? seatTicketPriceAppliedPromotions.reduce(
        //     (highestPriceType, currentType) => {
        //       if (
        //         currentType.seat_type === seatTypeColor.seatType &&
        //         currentType.price_with_VAT > highestPriceType.price_with_VAT
        //       ) {
        //         return currentType;
        //       }

        //       return highestPriceType;
        //     }
        //   )
        // : undefined;

        return {
          name: seatTranslation(`seatType.${seatTypeColor.seatType}`),
          color: seatTypeColor.background,
          price: priceType,
          seatType: seatTypeColor.seatType,
          // ? priceType?.price_with_VAT.toLocaleString("en-US") + "đ"
          // : "",
        };
      })
    );
  }

  legends.forEach((legend: Legend) => {
    // Separate booked/hold legends from others
    if (
      legend.seatType.includes(SEAT_TYPE.booked) ||
      legend.seatType.includes(SEAT_TYPE.onHold)
    ) {
      bookedAndHoldLegends.push(legend);
    }
  });

  return (
    <div className="flex w-full items-center justify-evenly gap-2">
      {bookedAndHoldLegends?.map((legend) => (
        <div
          key={legend.name}
          className="flex flex-col items-center justify-center gap-2 py-2 md:flex-row"
        >
          <div className={`h-4 w-4 rounded ${legend.color}`}></div>
          <div className="text-sm">{legend.name}</div>
        </div>
      ))}
      <div className="flex flex-col items-center justify-center gap-2 py-2 md:flex-row">
        <div className={`h-4 w-4 rounded bg-primary-500`}></div>
        <div className="text-sm">Đang chọn</div>
      </div>
    </div>
  );
};

export default memo(SeatLegendFixedLabel);
