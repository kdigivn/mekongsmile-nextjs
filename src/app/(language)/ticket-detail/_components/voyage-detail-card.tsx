import TicketSpeedBadge from "@/components/badge/ticket-speed-badge";
import RouteArrow from "@/components/icons/route-arrow";
import { calculateDuration, cn, formatHourString } from "@/lib/utils";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { Image } from "@heroui/react";
import { format } from "date-fns";
import { CiCalendar } from "react-icons/ci";

type CardProps = {
  voyage: Voyage;
  className?: string;
};

function VoyageDetailCard({ voyage, className }: CardProps) {
  return (
    <div className={cn("grid grid-cols-12 items-center gap-3 p-3", className)}>
      {/* Col 1 section */}
      <div className="col-span-12 flex flex-row justify-between gap-3 md:flex-col md:justify-start">
        {/* Operator & Boat info */}
        <div className="flex items-center gap-2">
          {/* Operator logo */}
          <div className="h-12 w-12">
            <Image
              src={
                voyage?.operator?.operator_logo?.path ??
                "/static-img/placeholder-image-500x500.png"
              }
              alt={voyage?.operator?.operator_name ?? ""}
              className="h-full w-full"
              radius="md"
            />
          </div>
          {/* Operator name & boat name */}
          <div className="flex flex-col items-start justify-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <TicketSpeedBadge
                speed={
                  voyage?.operator?.configs
                    ?.issue_ticket_speed as IssueTicketSpeedEnum
                }
              />
              <p className="font-semibold">{voyage?.operator?.operator_name}</p>
            </div>

            <div className="flex items-center justify-center gap-1">
              <CiCalendar className="h-5 w-5 text-default-600" />
              <p className="text-sm text-default-600">
                {format(new Date(`${voyage?.departure_date}`), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 flex flex-col justify-center gap-3 md:items-center">
        {/* Departure & Destination */}
        <div className="flex items-center justify-evenly md:w-full md:justify-evenly">
          {/* Departure */}
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-sm font-bold">{voyage?.route?.departure_name}</p>
            <p className="text-sm">
              {voyage?.depart_time ? (
                formatHourString(voyage?.depart_time)
              ) : (
                <br />
              )}
            </p>
          </div>
          {/* Icon */}
          <div className="flex flex-col">
            <div className="flex w-full justify-center text-sm">
              {calculateDuration(voyage?.depart_time, voyage?.arrive_time)}
            </div>
            <RouteArrow color="#000000" />
          </div>
          {/* Destination */}
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-right text-sm font-bold">
              {voyage?.route?.destination_name}
            </p>
            <p className="text-right text-sm">
              {voyage?.arrive_time ? formatHourString(voyage?.arrive_time) : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoyageDetailCard;
