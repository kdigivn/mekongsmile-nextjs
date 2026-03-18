"use client";

import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import VoyageDetailCard from "@/app/(language)/ticket-detail/_components/voyage-detail-card";
import { IoPricetagOutline } from "react-icons/io5";
import { formatCurrency } from "@/lib/utils";
import { Button } from "../ui/button";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import {
  LocalFormKey,
  LocalSelectedTicketFormData,
} from "@/services/form/types/form-types";
import { objectToArray } from "@/services/helpers/objectUtils";
import { useRouter } from "next/navigation";
import {
  MdInfoOutline,
  MdOutlineAirlineSeatReclineExtra,
} from "react-icons/md";
import ModalCheckVoyageSeats from "../modals/modal-check-voyage-seats/modal-check-voyage-seats";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useTranslation } from "@/services/i18n/client";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import PriceDetailsDialog from "@/components/dialog/price-detail-dialog";

type Props = {
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  voyageItem: VoyageItem;
};
const FerryBigCalendarEventDialog = ({
  dialogOpen,
  setDialogOpen,
  voyageItem,
}: Props) => {
  const { t } = useTranslation("home");
  const isMobile = useCheckMobile();
  const [isSeatModalOpen, setIsSeatModalOpen] = useState<boolean>(false);
  // Handle open/close PriceDetailsDialog - show ticket price addition (is_display = true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);
  /**
   * Router hook
   */
  const router = useRouter();

  /**
   * Handle logic
   */
  const handleGoToTicketDetail = useCallback(
    (voyage: Voyage) => {
      const queryParams: TicketDetailParams = {
        departVoyageId: voyage?.id,
        numberOfPassengers: 1,
      };

      const ticketFormData: LocalSelectedTicketFormData = {
        selectedVoyages: {
          departVoyage: voyage,
        },
        numberOfPassengers: 1,
      };

      localStorage.setItem(
        LocalFormKey.selectedTicketData,
        JSON.stringify(ticketFormData)
      );

      // Create query path. Add a timestamp to trigger API fetch when click search button
      const path = `/ticket-detail?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;

      router.push(path);
    },
    [router]
  );

  const handleBookingTicket = useCallback(() => {
    if (voyageItem.voyage) {
      handleGoToTicketDetail(voyageItem.voyage);
    }
  }, [handleGoToTicketDetail, voyageItem.voyage]);

  const handleOnCheckSeatButtonPress = useCallback(() => {
    setIsSeatModalOpen(true);
  }, []);

  const handlePrimaryPressModal = useCallback(() => {
    setIsSeatModalOpen(false);
  }, []);

  const matchedTicketPrice = useMemo(
    () =>
      voyageItem?.voyage?.ticket_prices?.prices?.find(
        (price) => price?.is_default
      ) || voyageItem?.voyage?.ticket_prices?.prices?.[0],
    [voyageItem?.voyage?.ticket_prices?.prices]
  );

  // Filter only additions that should be displayed
  const displayAdditions = useMemo(
    () => matchedTicketPrice?.additions || [],
    [matchedTicketPrice?.additions]
  );

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết chuyến</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            <VoyageDetailCard voyage={voyageItem.voyage} />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      aria-label={"Xem sơ đồ ghế"}
                      className="h-6 w-6 min-w-0 rounded bg-primary-100 p-1 text-foreground hover:bg-primary-100"
                      onClick={handleOnCheckSeatButtonPress}
                    >
                      <MdOutlineAirlineSeatReclineExtra className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Xem sơ đồ ghế</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-sm">
                  {voyageItem.voyage?.no_remain >= 100
                    ? "100+"
                    : voyageItem.voyage?.no_remain > 0
                      ? "20+"
                      : 0}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <IoPricetagOutline size={16} className="text-primary" />
                <div className="text-lg font-semibold text-primary">
                  {voyageItem.voyage?.ticket_prices?.default_ticket_price &&
                    formatCurrency(
                      voyageItem?.voyage?.ticket_prices?.default_ticket_price
                    )}
                </div>

                {displayAdditions.length > 0 &&
                  (isMobile ? (
                    <Button
                      color="primary"
                      onClick={handleOpenDialog}
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                    >
                      <MdInfoOutline className="text-base" />
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          color="primary"
                          onClick={handleOpenDialog}
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
                  ))}
              </div>

              <Button
                onClick={handleBookingTicket}
                className="choose-voyage-button"
                id={`bigCalendar-btn-choose-voyage-${voyageItem.voyage.id}`}
              >
                Đặt vé
              </Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <ModalCheckVoyageSeats
        voyageItem={voyageItem}
        isOpen={isSeatModalOpen}
        loadSeatsStrategy="on first open"
        onPrimaryPress={handlePrimaryPressModal}
      />

      <PriceDetailsDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        voyageItem={voyageItem}
      />
    </>
  );
};

export default memo(FerryBigCalendarEventDialog);
