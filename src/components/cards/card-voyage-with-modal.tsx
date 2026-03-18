"use client";

import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { memo, useCallback, useState } from "react";
import ModalCheckVoyageSeats from "../modals/modal-check-voyage-seats/modal-check-voyage-seats";
import CardVoyage from "./card-voyage";
import PriceDetailsDialog from "@/components/dialog/price-detail-dialog";
type Props = {
  voyageItem: VoyageItem;
  isLoaded: boolean;
  /**
   * Event handler when card voyage is pressed
   */
  onCardPrimaryButtonPress?: () => void;
  cardClasses?: {
    base?: string;
  };
};

function CardVoyageWithModal({
  voyageItem,
  isLoaded,
  onCardPrimaryButtonPress,
  cardClasses,
}: Props) {
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  // Handle open/close PriceDetailsDialog - show ticket price addition (is_display = true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);

  return (
    <>
      <CardVoyage
        isLoaded={isLoaded}
        voyageItem={voyageItem}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onSelectButtonPress={() => {
          if (onCardPrimaryButtonPress) onCardPrimaryButtonPress();
        }}
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onCheckSeatButtonPress={() => setIsSeatModalOpen(true)}
        className={cardClasses?.base}
        handleOpenDialog={handleOpenDialog}
      />

      <ModalCheckVoyageSeats
        voyageItem={voyageItem}
        isOpen={isSeatModalOpen}
        loadSeatsStrategy="on first open"
        // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        onPrimaryPress={() => {
          setIsSeatModalOpen(false);
        }}
      />

      <PriceDetailsDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        voyageItem={voyageItem}
      />
    </>
  );
}

export default memo(CardVoyageWithModal);
