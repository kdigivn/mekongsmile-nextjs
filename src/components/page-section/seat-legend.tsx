import { cn, formatCurrency } from "@/lib/utils";
import { SeatColorWithType } from "@/services/apis/boatLayouts/types/seat";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import {
  TicketAgeCustomConfig,
  getMinMaxAgeByByOperatorCode,
  getTicketPriceIdsByOperatorCode,
} from "@/services/apis/tickets/types/ticket-type-config";
import { useTranslation } from "@/services/i18n/client";
import { SEAT_TYPE } from "@/services/apis/boatLayouts/types/seat-type-enum";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BoxContentWrapper from "../wrapper/BoxContentWrapper";
import { memo, ReactNode, useMemo } from "react";
import SeatLegendFixedLabel from "./seat-legend-fixed-label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { MdInfoOutline } from "react-icons/md";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type Legend = {
  name: string;
  color: string;
  seatType: string;
  price: TicketPrice[];
};

type Props = {
  seatTypeColors: SeatColorWithType[];
  ticketPrices: TicketPrice[];
  // ticketPromotions: TicketPromotion[];
  operatorCode: string;
  openAccordion?: boolean;
  wrapperClass?: string;
  tabContentClass?: string;
  children?: ReactNode;
};
function SeatLegend({
  seatTypeColors,
  ticketPrices,
  // ticketPromotions,
  operatorCode,
  openAccordion,
  wrapperClass,
  tabContentClass,
  children,
}: Props) {
  const { t: seatTranslation } = useTranslation("seat/seat");
  const legends: Legend[] = [];
  const otherLegends: Legend[] = [];

  const ageConfig: TicketAgeCustomConfig[] =
    getMinMaxAgeByByOperatorCode(operatorCode);
  // const seatTicketPriceAppliedPromotions = ticketPrices.map<TicketPrice>(
  //   (ticketPrice) => ({
  //     ...ticketPrice,
  //     price_with_VAT:
  //       ticketPromotions.find(
  //         (promotion) =>
  //           promotion.seat_type === ticketPrice.seat_type &&
  //           promotion.ticket_type_id === ticketPrice.ticket_type_id
  //       )?.price ?? ticketPrice.price_with_VAT,
  //   })
  // );

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

  for (let i = 0; i < legends.length; i++) {
    const legend = legends[i];
    if (
      legend.seatType.includes(SEAT_TYPE.booked) ||
      legend.seatType.includes(SEAT_TYPE.onHold)
    ) {
      continue;
    } else {
      // Separate booked/hold legends from others
      otherLegends.push(legend);
    }
  }

  const otherLegendsRender = otherLegends?.length ? (
    <Tabs defaultValue={otherLegends[0]?.name}>
      <TabsList className="w-max-full flex h-fit w-fit flex-wrap justify-start gap-1 overflow-y-hidden whitespace-nowrap p-2 lg:inline-flex lg:w-auto">
        {otherLegends.map((legend: Legend) => (
          <TabsTrigger
            key={legend.name}
            value={legend.name}
            className="flex items-center justify-center gap-2"
          >
            <span className={`h-4 w-4 rounded ${legend?.color}`}></span>
            <span className="text-sm">{legend?.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={cn("block", wrapperClass)}>
        {otherLegends.map((legend: Legend) => (
          <TabsContent
            key={legend.name}
            value={legend.name}
            className={tabContentClass}
          >
            <BoxContentWrapper className="w-full gap-2 bg-default-200">
              <p className="text-sm font-bold md:text-base">
                {seatTranslation("ticket-type")}
              </p>
              <LegendPrice prices={legend.price} ageConfig={ageConfig} />
            </BoxContentWrapper>
          </TabsContent>
        ))}
        {children}
      </div>
    </Tabs>
  ) : (
    <></>
  );

  const triggerIcon = useMemo(
    () => (
      <div className="flex min-w-24 cursor-pointer items-center justify-center rounded-md bg-primary-500 p-2 text-white transition-all duration-200 ease-in-out hover:bg-primary-400">
        Xem giá vé
      </div>
    ),
    []
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {openAccordion ? (
        <>
          <Accordion
            className="hidden w-full sm:block"
            type="single"
            collapsible
          >
            <AccordionItem
              value="item-1"
              className="flex w-full flex-col items-center justify-center"
            >
              <AccordionTrigger
                className="w-full py-2 no-underline hover:no-underline"
                triggerIcon={triggerIcon}
              >
                <SeatLegendFixedLabel
                  operatorCode={operatorCode}
                  seatTypeColors={seatTypeColors}
                  ticketPrices={ticketPrices}
                />
              </AccordionTrigger>
              <AccordionContent className="!w-full" asChild>
                {otherLegendsRender}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="w-full sm:hidden">
            <AccordionItem value="item-1">
              <AccordionTrigger
                className="w-full py-2 no-underline hover:no-underline sm:py-4"
                triggerIcon={triggerIcon}
              >
                <SeatLegendFixedLabel
                  operatorCode={operatorCode}
                  seatTypeColors={seatTypeColors}
                  ticketPrices={ticketPrices}
                />
              </AccordionTrigger>
              <AccordionContent>{otherLegendsRender}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      ) : (
        <>
          <div className="flex w-full flex-col gap-2">
            <div className="hidden lg:block">
              <SeatLegendFixedLabel
                operatorCode={operatorCode}
                seatTypeColors={seatTypeColors}
                ticketPrices={ticketPrices}
              />
            </div>
            {otherLegendsRender}
          </div>
        </>
      )}
    </div>
  );
}

function LegendPrice({
  prices,
  ageConfig,
}: {
  prices: TicketPrice[];
  ageConfig: TicketAgeCustomConfig[];
}) {
  const { t } = useTranslation("seat/seat");

  return prices?.map((price, index) => {
    const label =
      ageConfig.find((item) => item.type_id === price.ticket_type_id)?.label ??
      "";
    return (
      <div key={index} className="flex w-full justify-between">
        <div className="flex items-center gap-1">
          <p className="text-sm font-normal">{t(`ageLabel.${label}`)}: </p>
          {price?.additionalAmount && price?.additionalAmount !== 0 ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  color="primary"
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <MdInfoOutline className="text-base text-primary-600" />
                </Button>
              </PopoverTrigger>
              {price?.additionalAmount < 0 ? (
                <PopoverContent className="w-fit p-2" side="top">
                  <div className="flex flex-col items-center justify-between p-3">
                    <p className="font-medium">Khuyến mãi áp dụng</p>
                    <p className="font-medium text-success-600">
                      {formatCurrency(price.additionalAmount)}
                    </p>
                  </div>
                </PopoverContent>
              ) : (
                <PopoverContent className="w-fit p-2" side="top">
                  <div className="flex flex-col items-center justify-between p-3">
                    <p className="font-medium">Phụ thu áp dụng</p>
                    <p className="font-medium text-warning-600">
                      + {formatCurrency(price.additionalAmount)}
                    </p>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          ) : null}
        </div>
        <div key={index}>
          <span className="text-base font-bold">
            {formatCurrency(price?.price_with_VAT)}
          </span>
          <span> /</span>
          <span className="text-xs font-normal text-gray-600">
            {t("person")}
          </span>
        </div>
      </div>
    );
  });
}

export default memo(SeatLegend);
