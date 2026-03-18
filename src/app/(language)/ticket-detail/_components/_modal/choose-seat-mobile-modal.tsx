"use client";

import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaAngleDown } from "react-icons/fa6";
import SeatLegend from "@/components/page-section/seat-legend";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useTranslation } from "@/services/i18n/client";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import {
  SeatColorWithType,
  SeatTicket,
} from "@/services/apis/boatLayouts/types/seat";
import SelectedSeat from "../selected-seat";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import HtmlToImage from "@/components/html-to-image/html-to-image";
import { HtmlToImageSectionCaptureId } from "@/components/html-to-image/enum";
import SeatLegendFixedLabel from "@/components/page-section/seat-legend-fixed-label";
import PriceDetailsDialog from "@/components/dialog/price-detail-dialog";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  boatLayout: BoatLayout;
  selectedSeats: SeatTicket[];
  handleTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  seatTypeColors: SeatColorWithType[];
  voyageItem: VoyageItem;
  boatLayoutContent: {
    tabTrigger: JSX.Element;
    tabContent: JSX.Element;
  }[];
};

const maxSeatNumber = process.env.NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS
  ? Number(process.env.NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS)
  : 30;

function ChooseSeatMobileModal({
  isOpen,
  setIsOpen,
  boatLayout,
  selectedSeats,
  activeTab,
  setActiveTab,
  seatTypeColors,
  voyageItem,
  boatLayoutContent,
}: Props) {
  const { t } = useTranslation("ticket-detail");
  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const selectedSeatComponents = useMemo(() => {
    return selectedSeats.map((seatTicket) => (
      <SelectedSeat
        key={seatTicket.seatMetadata.PositionId}
        seatTicket={seatTicket}
        isReadOnly={true}
      />
    ));
  }, [selectedSeats]);

  const [isOpenAccordion, setIsOpenAccordion] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleAccordionChange = useCallback((value: string) => {
    setIsOpenAccordion(value === "item-1");
  }, []);

  const fallback = useMemo(() => <div>Loading ... </div>, []);

  // Handle open/close PriceDetailsDialog - show ticket price addition (is_display = true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useState<number>(0);
  const onClose = useCallback(() => setIsDialogOpen(false), []);

  const triggerIcon = useMemo(
    () => (
      <>
        {isOpenAccordion ? <p>Ẩn Giá vé</p> : <p>Xem giá vé</p>}
        <FaAngleDown
          className={`h-4 w-4 shrink-0 text-white transition-transform duration-200`}
        />
      </>
    ),
    [isOpenAccordion]
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle className="hidden">
          {t("boat-layout.title")} Mobile
        </DialogTitle>

        <DialogContent
          className="flex h-[100dvh] w-full max-w-full flex-col justify-between gap-3 px-2 py-3 md:max-h-[calc(100%_-_4.5rem)] md:w-[96%] md:max-w-7xl md:rounded-md md:p-4"
          hideCloseButton={false}
          closeButtonClassName="z-10 top-1 right-2"
          forceMount
        >
          <DialogDescription className="hidden">
            {t("boat-layout.title")} Mobile
          </DialogDescription>
          <div
            id={HtmlToImageSectionCaptureId.MOBILE_SELECTED_SEAT_MODAL}
            className="flex flex-col overflow-auto"
            // onTouchEnd={handleTouchEnd}
            // onTouchStart={handleTouchStart}
          >
            <Accordion
              type="single"
              collapsible
              className="sticky -top-0.5 z-10 w-full bg-white"
              onValueChange={handleAccordionChange}
            >
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger
                  className="h-[52px] w-full items-center gap-1 py-0 no-underline hover:no-underline"
                  iconWrapperClass="flex h-8 flex-none items-center justify-center rounded-md bg-primary-500 gap-1.5 py-1 px-3 text-white w-fit"
                  iconClass="text-white"
                  triggerIcon={triggerIcon}
                >
                  <div className="flex items-center gap-2">
                    {isOpenAccordion ? (
                      <div className="flex min-h-10 items-center gap-2">
                        <p className="text-base font-bold">
                          {t("boat-layout.title")}
                        </p>
                      </div>
                    ) : (
                      <div className="flex min-h-10 items-center gap-2 overflow-x-auto whitespace-nowrap text-base font-bold">
                        <p>{t("selected-seats.label")}</p>
                        <p>
                          {selectedSeats.length}/{maxSeatNumber}
                        </p>
                        {/* <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                        {selectedSeatComponents}
                      </div> */}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DialogTitle className="hidden">
                    {t("boat-layout.title")}
                  </DialogTitle>
                  <DialogHeader className="flex-col gap-2 text-left font-semibold">
                    <div className="flex w-full flex-col items-start justify-center gap-4">
                      <SeatLegend
                        seatTypeColors={seatTypeColors}
                        ticketPrices={boatLayout.prices}
                        operatorCode={
                          voyageItem.voyage.operator?.operator_code ?? ""
                        }
                        wrapperClass="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2"
                        tabContentClass="mt-0 md:h-full"
                      >
                        <div className="flex h-fit w-full flex-col gap-2 rounded-md border border-dashed border-gray-400 p-3 md:h-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold md:text-base">
                              {t("selected-seats.label-2").replace(
                                "{seatCount}",
                                `${selectedSeats.length}/${maxSeatNumber}`
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedSeatComponents}
                          </div>
                        </div>
                      </SeatLegend>
                    </div>
                  </DialogHeader>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Tabs
              className="w-full"
              value={activeTab} // Truyền activeTab vào đây để kiểm soát trạng thái tab
              onValueChange={setActiveTab} // Cập nhật state khi tab thay đổi bên trong
            >
              <TabsList className="w-full rounded-none">
                {boatLayoutContent.map((layout) => layout.tabTrigger)}
              </TabsList>
              <Suspense fallback={fallback}>
                {boatLayoutContent.map((layout) => layout.tabContent)}
              </Suspense>
            </Tabs>
          </div>

          <DialogFooter className="flex w-full !flex-col gap-2">
            <div className="block">
              <SeatLegendFixedLabel
                seatTypeColors={seatTypeColors}
                ticketPrices={boatLayout.prices}
                operatorCode={voyageItem.voyage.operator?.operator_code ?? ""}
              />
            </div>
            <div className="flex flex-row !items-center !justify-between gap-2">
              <HtmlToImage
                captureId={
                  HtmlToImageSectionCaptureId.MOBILE_SELECTED_SEAT_MODAL
                }
                captureButtonName="Sơ đồ tàu"
                sectionCapture="mobile-boat-layout"
                operatorLayout={
                  voyageItem.voyage?.operator?.operator_code ?? ""
                }
              />

              <Button
                className="flex w-fit items-center gap-1"
                onClick={handleClose}
              >
                <IoCheckmarkCircleSharp />
                {t("confirm-button")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PriceDetailsDialog
        isOpen={isDialogOpen}
        onClose={onClose}
        voyageItem={voyageItem}
      />
    </>
  );
}

export default memo(ChooseSeatMobileModal);
