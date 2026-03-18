import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { useState, useCallback, memo } from "react";
import PriceDetailsDialog from "@/components/dialog/price-detail-dialog";
import ChangedTicketPriceContent from "@/components/changed-ticket-price-content";

type CellTicketPriceProps = {
  voyageItem: VoyageItem;
};

const CellTicketPrice = ({ voyageItem }: CellTicketPriceProps) => {
  // Handle open/close PriceDetailsDialog - show ticket price addition (is_display = true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);
  return (
    <>
      <div className="m-auto min-w-fit max-w-28 font-semibold text-primary">
        <ChangedTicketPriceContent
          wrapperClassname="items-end"
          voyageItem={voyageItem}
          onClick={handleOpenDialog}
        />
      </div>

      <PriceDetailsDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        voyageItem={voyageItem}
      />
    </>
  );
};

export default memo(CellTicketPrice);
