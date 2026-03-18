import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getTicketStatusColor,
  getTicketStatusName,
} from "@/lib/get-ticket-status";
import { cn } from "@/lib/utils";
import { Order } from "@/services/apis/orders/types/order";
import { useTranslation } from "@/services/i18n/client";
import { formatDate } from "date-fns/format";
import { memo, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

type OrderDetailProps = {
  order: Order;
};
function CellOrderDetail({ order }: OrderDetailProps) {
  const { t } = useTranslation("user/bookings");

  const [isPassengerCollapsibleOpen, setIsPassengerCollapsibleOpen] =
    useState(false);

  return (
    <div className="flex flex-col gap-1">
      {order.voyage && (
        <>
          {/* Operator name */}
          <p className="text-sm font-semibold">
            {`${t("table.cell.order-detail.title")} ${order.voyage.operator?.operator_name} `}
          </p>
          {/* From..to.. */}

          <p>
            {`${t("table.cell.order-detail.from")} `}
            <span className="font-semibold">
              {order.voyage.route?.departure_name}
            </span>
            {` ${t("table.cell.order-detail.to")} `}
            <span className="font-semibold">
              {order.voyage.route?.destination_name}
            </span>
          </p>
          {/* Departure date */}
          <p>
            {`${t("table.cell.order-detail.depart-date")} ${formatDate(order.voyage_depart_date, "dd/MM/yyyy")}`}
          </p>
        </>
      )}

      {/* Passengers list */}
      <Collapsible
        open={isPassengerCollapsibleOpen}
        onOpenChange={setIsPassengerCollapsibleOpen}
      >
        <div className="flex items-center justify-between">
          <p>{t("table.cell.order-detail.passengers")}</p>

          {order.tickets.length > 3 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <RiArrowDownSLine
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isPassengerCollapsibleOpen && "rotate-180"
                  )}
                />
                <span className="sr-only">
                  {t("table.cell.order-detail.toggle-btn")}
                </span>
              </Button>
            </CollapsibleTrigger>
          )}
        </div>

        <ScrollArea className="w-full rounded-md border border-dashed border-default p-1 transition-all duration-300">
          <ul className="ml-4 flex list-disc flex-col gap-2 p-1">
            {/* Always visible first 3 tickets */}
            {order.tickets.slice(0, 3).map((ticket) => (
              <li key={ticket.position_id} className="flex items-center">
                <span>
                  {ticket.seat_name} - {ticket.seat_type_code} - {ticket.name} -{" "}
                  {ticket.social_id}
                </span>
                <span
                  className={`${getTicketStatusColor(ticket.ticket_status)} ml-2 text-nowrap rounded-md px-2 py-1 text-xs`}
                >
                  {getTicketStatusName(ticket.ticket_status)}
                </span>
              </li>
            ))}

            {/* Hidden/expanded rest */}
            {order.tickets.length > 3 && (
              <CollapsibleContent asChild>
                <>
                  {order.tickets.slice(3).map((ticket) => (
                    <li key={ticket.position_id} className="flex items-center">
                      <span>
                        {ticket.seat_name} - {ticket.seat_type_code} -{" "}
                        {ticket.name} - {ticket.social_id}
                      </span>
                      <span
                        className={`${getTicketStatusColor(ticket.ticket_status)} ml-2 text-nowrap rounded-md px-2 py-1 text-xs`}
                      >
                        {getTicketStatusName(ticket.ticket_status)}
                      </span>
                    </li>
                  ))}
                </>
              </CollapsibleContent>
            )}
          </ul>
        </ScrollArea>
      </Collapsible>
    </div>
  );
}

export default memo(CellOrderDetail);
