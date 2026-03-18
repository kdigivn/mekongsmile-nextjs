import { SeatTicket } from "@/services/apis/boatLayouts/types/seat";
import SelectedSeat from "./selected-seat";
import { useTranslation } from "@/services/i18n/client";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { TbArmchair } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { PassengerConfig } from "@/services/apis/passengers/types/passenger";
type SelectedSeatSectionProps = {
  selectedSeats: SeatTicket[];
  maxSeatNumber: number;
  className?: string;
  handleOpenAlert?: () => void;
  isDesktop?: boolean;
  hasTourBeenShown?: boolean;
  voyage: Voyage;
  passengerConfig: PassengerConfig;
};

function SelectedSeatSection({
  selectedSeats,
  className,
  maxSeatNumber,
  handleOpenAlert,
  isDesktop,
  hasTourBeenShown,
  voyage,
  passengerConfig,
}: SelectedSeatSectionProps) {
  const { t } = useTranslation("ticket-detail");

  const noPlate = (voyage.no_plate as number) || 0;
  const maxVehicleCapacity = voyage.operator?.configs.max_vehicle_capacity ?? 0;

  return (
    <div
      className={cn("flex flex-col justify-center gap-2 shadow-sm", className)}
    >
      {/* Selected seats */}
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{t("selected-seats.label")}</p>
        <div className="flex flex-wrap gap-2">
          {selectedSeats.map((seatTicket) => (
            <SelectedSeat
              key={seatTicket.seatMetadata.PositionId}
              seatTicket={seatTicket}
              isReadOnly={true}
            />
          ))}
        </div>
      </div>
      {/* Total */}
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-14 text-sm font-normal">
          {`${t("selected-seats.total")}`}
          <span className="font-semibold">
            {`${selectedSeats.length}/${maxSeatNumber}`}
          </span>
        </p>

        <Button
          className={cn(
            "relative flex h-7 items-center gap-1 text-sm font-normal lg:hidden", // Các lớp luôn có
            {
              "first-step": !isDesktop, // Chỉ thêm 'first-step' khi không phải desktop
            }
          )}
          onClick={handleOpenAlert}
        >
          <TbArmchair className="text-xl" />
          Chọn ghế
          {!hasTourBeenShown && (
            <span className="absolute right-[-6px] top-[-8px] flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-success-500"></span>
            </span>
          )}
        </Button>
      </div>
      {passengerConfig.plate_number.enable && (
        <p className="min-w-14 text-sm font-normal">
          {`${t("selected-seats.car-plate-count")}`}
          <span className="font-semibold">
            {`${noPlate}/${maxVehicleCapacity}`}
          </span>
        </p>
      )}
    </div>
  );
}

export default memo(SelectedSeatSection);
