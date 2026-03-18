import SeatSelectSwitch from "@/components/switch/seat-select-switch";
import { cn } from "@/lib/utils";
import { SeatTicket } from "@/services/apis/boatLayouts/types/seat";
import { TicketAgeCustomConfig } from "@/services/apis/tickets/types/ticket-type-config";
import { memo } from "react";

type SelectedSeatProps = {
  seatTicket: SeatTicket;
  isSelected?: boolean;
  isReadOnly?: boolean;
  defaultSelected?: boolean;
  ticketAgeConfig?: TicketAgeCustomConfig[];
  handleSelectedSeat?: (isSelected: boolean, seatData: SeatTicket) => void;
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

function SelectedSeat({
  seatTicket,
  defaultSelected,
  isSelected,
  isReadOnly,
  handleSelectedSeat,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onShiftClick,
}: SelectedSeatProps) {
  return (
    <SeatSelectSwitch
      key={seatTicket.seatMetadata.PositionId}
      seatTicket={seatTicket}
      className={cn(
        seatTicket.seatMetadata.IsRender &&
          (seatTicket.seatMetadata.SeatColor
            ? `${seatTicket.seatMetadata.SeatColor.text} ${seatTicket.seatMetadata.SeatColor.background}`
            : "bg-seatDefault text-seatDefault-foreground hover:bg-seatDefault hover:text-seatDefault-foreground"),
        "group-data-[selected=true]:bg-primary group-data-[selected=true]:text-white",
        "rounded p-1 text-sm font-medium md:min-h-9 md:min-w-9"
      )}
      defaultSelected={defaultSelected}
      isSelected={isSelected}
      onSelectedSeatChange={handleSelectedSeat}
      isDisabled={!seatTicket.seatMetadata.IsSeat}
      isReadOnly={isReadOnly}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onShiftClick={onShiftClick}
    />
  );
}

export default memo(SelectedSeat);
