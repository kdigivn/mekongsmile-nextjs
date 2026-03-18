"use client";

import SeatLegend from "@/components/page-section/seat-legend";
import SeatSelectSwitch from "@/components/switch/seat-select-switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { cn } from "@/lib/utils";
import {
  useGetBoatLayoutFromDatabaseOfVoyageService,
  useGetBoatLayoutFromOperatorOfVoyageService,
} from "@/services/apis/boatLayouts/boatlayout.service";
import {
  DEFAULT_SEAT_TYPE_COLOR_PALETTE,
  SEAT_COLOR_PALETTE,
} from "@/services/apis/boatLayouts/seat-color-config";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import {
  SeatColor,
  SeatColorWithType,
  SeatMetadata,
  SeatTicket,
} from "@/services/apis/boatLayouts/types/seat";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { useTranslation } from "@/services/i18n/client";

// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
// } from "@heroui/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";

type Props = {
  isOpen: boolean;
  voyageItem: VoyageItem;
  loadSeatsStrategy?: "default" | "on first open";
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  openAccordion?: boolean;
};

function ModalCheckVoyageSeats({
  isOpen,
  voyageItem,
  loadSeatsStrategy = "default",
  onPrimaryPress,
  openAccordion = true,
}: Props) {
  const { t } = useTranslation("search/check-seat-modal");
  const [boatLayout, setBoatLayout] = useState<BoatLayout>();
  const [activeTab, setActiveTab] = useState("0");
  const fetchBoatLayoutFromDatabase =
    useGetBoatLayoutFromDatabaseOfVoyageService();
  const fetchBoatLayoutFromOperator =
    useGetBoatLayoutFromOperatorOfVoyageService();
  const [alreadyOpen, setAlreadyOpen] = useState(false);
  const [seatTypeColors, setSeatTypeColors] = useState<SeatColorWithType[]>(
    DEFAULT_SEAT_TYPE_COLOR_PALETTE
  );

  const { hideNav, showNav } = useMobileBottomNavActions();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Set already open to true when modal is opened
  if (isOpen && !alreadyOpen) {
    setAlreadyOpen(true);
  }

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      if (isFirstRender) setIsFirstRender(false);
      else showNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideNav, isOpen, showNav]);

  useEffect(() => {
    /**
     * Create a seat type color palette for the layout.
     * For example: the boat has 2 seat types: "ECO" and "VIP". The function then map these 2 types with the defined color palette. The result is: `"ECO": "text-black bg-green-100"`, `"VIP": "text-black bg-amber-100"`.
     *
     * Then, when create seats, we can map their seat type with the result and return the color
     * @param seatType list of seat types in this boat
     */
    function createSeatTypeColorPalette(seatType: string[]) {
      const mappedSeatColorWithType: SeatColorWithType[] = seatType.map(
        (seatType, index) => {
          // Get color from colorPalette with cyclic index
          const colorIndex = index % SEAT_COLOR_PALETTE.length;
          const color = SEAT_COLOR_PALETTE[colorIndex];

          // Assign seatType to color object
          return { ...color, seatType };
        }
      );

      setSeatTypeColors([
        ...DEFAULT_SEAT_TYPE_COLOR_PALETTE,
        ...mappedSeatColorWithType,
      ]);
    }

    async function fetchVoyageData() {
      if (voyageItem?.voyage) {
        // Use rootVoyageId if this is a clickbait voyage, otherwise use regular ID
        const actualVoyageId = voyageItem.voyage.clickBait
          ? voyageItem.voyage.clickBait.rootVoyageId
          : voyageItem.voyage.id;

        const { data, status } = await fetchBoatLayoutFromDatabase({
          voyageId: actualVoyageId,
        });

        if (status === HTTP_CODES_ENUM.OK && data?.boatLayout) {
          // Override prices with clickbait pricing if applicable
          const layoutToSet = voyageItem.voyage.clickBait
            ? {
                ...data.boatLayout,
                prices: data.boatLayout.prices.map((price) => ({
                  ...price,
                  price_with_VAT: voyageItem.voyage.clickBait!.price,
                })),
              }
            : data.boatLayout;

          setBoatLayout(layoutToSet);
          createSeatTypeColorPalette(data.boatLayout.seat_types);
        }

        const { data: operatorData, status: operatorStatus } =
          await fetchBoatLayoutFromOperator({
            voyageId: actualVoyageId,
          });

        if (operatorStatus === HTTP_CODES_ENUM.OK && operatorData?.boatLayout) {
          // Override prices with clickbait pricing if applicable
          const layoutToSet = voyageItem.voyage.clickBait
            ? {
                ...operatorData.boatLayout,
                prices: operatorData.boatLayout.prices.map((price) => ({
                  ...price,
                  price_with_VAT: voyageItem.voyage.clickBait!.price,
                })),
              }
            : operatorData.boatLayout;

          setBoatLayout(layoutToSet);
          createSeatTypeColorPalette(operatorData.boatLayout.seat_types);
        }
      }
    }

    if (loadSeatsStrategy === "default") {
      fetchVoyageData();
    }
    if (loadSeatsStrategy === "on first open" && alreadyOpen) {
      fetchVoyageData();
    }
  }, [
    voyageItem?.voyage,
    fetchBoatLayoutFromDatabase,
    fetchBoatLayoutFromOperator,
    loadSeatsStrategy,
    alreadyOpen,
  ]);

  const skeletonLayout = useMemo(
    () => (
      <div className="flex flex-col gap-3">
        <div className="flex w-full gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg bg-neutral-200" />
          <Skeleton className="h-10 flex-1 rounded-lg bg-neutral-200" />
        </div>
        <div
          className="grid w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(10, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: 80 }).map((_, index) =>
            index % 10 === 2 || index % 10 === 7 ? (
              <div key={index} className="h-10 w-10"></div>
            ) : (
              <Skeleton key={index} className="rounded-lg bg-neutral-200">
                <div className="h-10 w-10"></div>
              </Skeleton>
            )
          )}
        </div>
      </div>
    ),
    []
  );

  // Create seats for boat layout
  const createSeatTickets = useMemo(
    () =>
      boatLayout?.floors.map((floorLayout) => {
        const seatsInFloor: SeatTicket[] = [];

        // Iterate through each row in a floor
        for (let i = 0; i < floorLayout.no_rows; i++) {
          const seatsInRow: SeatTicket[] = [];

          // Iterate through each seat in a row
          for (let j = 0; j < floorLayout.no_cols; j++) {
            const index = i * floorLayout.no_cols + j;
            if (
              index < floorLayout.Cols.length &&
              floorLayout.ColSpans[index] !== 0
            ) {
              // Check and define seat color
              const defaultSeatColor = {
                text: "text-seatDefault-foreground",
                background: "bg-seatDefault",
              };
              let seatColor: SeatColor =
                seatTypeColors
                  // find seat color matches with seat type
                  .filter(
                    (seatTypeColor) =>
                      seatTypeColor.seatType === floorLayout.SeatTypes[index]
                  )
                  ?.map((seatTypeColor) => ({
                    text: seatTypeColor.text,
                    background: seatTypeColor.background,
                  }))?.[0] ?? defaultSeatColor;

              if (floorLayout.IsBookeds[index]) {
                seatColor =
                  seatTypeColors.find(
                    (seatTypeColor) => seatTypeColor.seatType === "booked"
                  ) ?? defaultSeatColor;
              }

              if (floorLayout.IsHelds[index]) {
                seatColor =
                  seatTypeColors.find(
                    (seatTypeColor) => seatTypeColor.seatType === "onHold"
                  ) ?? defaultSeatColor;
              }

              const currentSeatType: string = floorLayout.SeatTypes[index];

              const seatMetadata: SeatMetadata = {
                Floor: index,
                Col: floorLayout.Cols[index],
                ColSpan: floorLayout.ColSpans[index],
                Row: floorLayout.Rows[index],
                RowSpan: floorLayout.RowSpans[index],
                PositionId: floorLayout.PositionIds?.[index],
                SeatId: floorLayout.SeatIds[index],
                SeatName: floorLayout.SeatNames[index],
                SeatType: currentSeatType,
                IsBooked: floorLayout.IsBookeds[index],
                IsHeld: floorLayout.IsHelds[index],
                IsVIP: floorLayout.IsVIPs[index],
                IsExported: floorLayout.IsExporteds[index],
                IsRender: floorLayout.IsRenders[index],
                IsRotate: floorLayout.IsRotates[index],
                IsSeat: floorLayout.IsSeats[index],
                SeatColor: seatColor,
                SortAuto: floorLayout.SortAutos?.[index] ?? 0,
                FloorId: floorLayout.floor_id,
              };

              // Find all ticket prices of current seat type
              const seatTicketPrice = boatLayout.prices.filter(
                (ticketType) => ticketType.seat_type === currentSeatType
              );

              // // Find all ticket promotions of current seat type
              // const seatTicketPromotions = boatLayout.ticket_promotions.filter(
              //   (promotion) => promotion.seat_type === currentSeatType
              // );

              // // Create new ticket price with promotion
              // const seatTicketPriceAppliedPromotions =
              //   seatTicketPrice.map<TicketPrice>((ticketPrice) => ({
              //     ...ticketPrice,
              //     price_with_VAT:
              //       seatTicketPromotions.find(
              //         (promotion) =>
              //           promotion.seat_type === ticketPrice.seat_type &&
              //           promotion.ticket_type_id === ticketPrice.ticket_type_id
              //       )?.price ?? ticketPrice.price_with_VAT,
              //   }));

              // Add seat ticket
              seatsInRow.push({
                seatMetadata: seatMetadata,
                ticketPrice: seatTicketPrice,
                selectedTicketPrice: seatTicketPrice.find(
                  (price) => price.ticket_type_id === 1
                ),
                ticketPriceAppliedPromotions: seatTicketPrice,
              });
            }
          }
          seatsInFloor.push(...seatsInRow);
        }

        return {
          seatsInFloor,
          noCols: floorLayout.no_cols,
          noRows: floorLayout.no_rows,
        };
      }),
    [boatLayout?.floors, boatLayout?.prices, seatTypeColors]
  );

  const onCloseModal = useCallback(() => {
    if (onPrimaryPress) onPrimaryPress();
  }, [onPrimaryPress]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="flex h-[100dvh] w-full max-w-full flex-col justify-between gap-3 rounded-md px-2 py-3 md:max-h-[calc(100%_-_4.5rem)] md:w-[96%] md:max-w-7xl md:p-4">
        {/* {() => (
          <> */}
        <div className="flex flex-col gap-3 overflow-auto">
          <AlertDialogTitle className="hidden">
            {`${voyageItem?.voyage.boat_name ? t("title", { boatName: voyageItem?.voyage.boat_name }) : t("title2")} (${t("depart-time")}
                ${voyageItem?.voyage.depart_time} ${voyageItem?.voyage.departure_date})`}
          </AlertDialogTitle>
          <AlertDialogHeader className="flex flex-row gap-0 font-semibold">
            {openAccordion ? (
              <>
                <p className="w-full sm:hidden">
                  {`${voyageItem?.voyage.boat_name ? t("title", { boatName: voyageItem?.voyage.boat_name }) : t("title2")} (${t("depart-time")}
                ${voyageItem?.voyage.depart_time} ${voyageItem?.voyage.departure_date})`}
                </p>

                <div className="hidden w-full sm:block">
                  <p>
                    {`${voyageItem?.voyage.boat_name ? t("title", { boatName: voyageItem?.voyage.boat_name }) : t("title2")} (${t("depart-time")}
                ${voyageItem?.voyage.depart_time} ${voyageItem?.voyage.departure_date})`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-medium font-normal">
                    {boatLayout?.prices.length && (
                      <SeatLegend
                        openAccordion={openAccordion}
                        seatTypeColors={seatTypeColors}
                        ticketPrices={boatLayout?.prices}
                        operatorCode={
                          voyageItem?.voyage.operator?.operator_code ?? ""
                        }
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p>
                  {`${voyageItem?.voyage.boat_name ? t("title", { boatName: voyageItem?.voyage.boat_name }) : t("title2")} (${t("depart-time")}
                ${voyageItem?.voyage.depart_time} ${voyageItem?.voyage.departure_date})`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-medium font-normal">
                  {boatLayout?.prices.length && (
                    <SeatLegend
                      seatTypeColors={seatTypeColors}
                      ticketPrices={boatLayout?.prices}
                      operatorCode={
                        voyageItem?.voyage.operator?.operator_code ?? ""
                      }
                    />
                  )}
                </div>
              </>
            )}
            <Button
              className="!m-0 h-6 w-6 self-start p-1 sm:absolute sm:right-3 sm:top-3"
              variant={"ghost"}
              onClick={onCloseModal}
            >
              <IoMdClose />
            </Button>
          </AlertDialogHeader>
          <AlertDialogDescription
            className="!hidden"
            aria-describedby="seat-modal"
          ></AlertDialogDescription>

          <div className="w-full">
            {createSeatTickets?.length ? (
              <Tabs className="" onValueChange={setActiveTab} defaultValue="0">
                <TabsList className="sticky top-0 z-10 w-full rounded-none bg-background">
                  {/* {boatLayoutContent.map((layout) => layout.tabTrigger)} */}

                  {createSeatTickets?.map((floorLayout, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {index === 0 ? "Tầng trệt" : `${t("floor")} ${index}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {/* {boatLayoutContent.map((layout) => layout.tabContent)} */}
                <ScrollArea className="w-full">
                  {createSeatTickets?.map((floorLayout, index) => (
                    <TabsContent
                      key={index}
                      value={index.toString()}
                      forceMount
                      hidden={index.toString() !== activeTab}
                    >
                      <div
                        className="grid w-full min-w-[48rem] gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${floorLayout.noCols}, minmax(0, 1fr))`,
                        }}
                      >
                        {floorLayout.seatsInFloor.map((seatTicket) => (
                          <Seat
                            key={seatTicket.seatMetadata.PositionId}
                            seatTicket={seatTicket}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
            ) : (
              <>{skeletonLayout}</>
            )}
          </div>
        </div>

        <AlertDialogFooter className="justify-center sm:justify-center">
          <div
            className={cn(
              "flex items-center justify-center gap-2",
              openAccordion ? "flex-col" : ""
            )}
          >
            {openAccordion && (
              <div className="w-full sm:hidden">
                {openAccordion && boatLayout?.prices.length && (
                  <SeatLegend
                    openAccordion={openAccordion}
                    seatTypeColors={seatTypeColors}
                    ticketPrices={boatLayout?.prices}
                    operatorCode={
                      voyageItem?.voyage.operator?.operator_code ?? ""
                    }
                  />
                )}
              </div>
            )}

            <AlertDialogAction asChild>
              <Button onClick={onCloseModal}>{t("close-button")}</Button>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
        {/* </>
        )} */}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default memo(ModalCheckVoyageSeats);

type SeatProps = {
  seatTicket: SeatTicket;
};
const Seat = memo(function Seat({ seatTicket }: SeatProps) {
  return (
    <SeatSelectSwitch
      key={seatTicket.seatMetadata.PositionId}
      seatTicket={seatTicket}
      className={cn(
        seatTicket.seatMetadata.IsRender &&
          (seatTicket.seatMetadata.SeatColor
            ? `${seatTicket.seatMetadata.SeatColor.text} ${seatTicket.seatMetadata.SeatColor.background}`
            : "bg-seatDefault text-seatDefault-foreground hover:bg-seatDefault hover:text-seatDefault-foreground"),
        "group-data-[selected=true]:bg-primary group-data-[selected=true]:text-white"
      )}
      isDisabled={!seatTicket.seatMetadata.IsSeat}
      isReadOnly
      isViewOnly
    />
  );
});
