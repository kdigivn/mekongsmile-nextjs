"use client";

import React, { memo, useCallback, useState } from "react";
import { Event } from "./type/ferry-big-calendar-type";
import { ShowMoreProps } from "react-big-calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatStringTime } from "./utils/big-calendar-helper";
import { format } from "date-fns";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import FerryBigCalendarEventDialog from "./ferry-big-calendar-event-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const FerryBigCalendarShowMore = ({
  events,
  remainingEvents,
  slotDate,
}: ShowMoreProps<Event>) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [voyageDisplay, setVoyageDisplay] = useState<VoyageItem>();

  const handleOpenBigCalendarEventDialog = useCallback((event: Event) => {
    setDialogOpen(true);
    setVoyageDisplay(event.voyageItem);
  }, []);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="h-4 p-0 text-xs"
            variant="link"
          >{`+${remainingEvents.length} thêm`}</Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-fit flex-col gap-2">
          <div className="text-sm font-semibold">
            {`Các tuyến tàu ngày ${format(slotDate, "dd-MM-yyyy")}`}
          </div>

          {
            // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
            events.map((event, idx) => {
              const departTime: string =
                formatStringTime(event.voyageItem.voyage?.depart_time) ?? "";
              const arriveTime: string =
                formatStringTime(event.voyageItem.voyage?.arrive_time) ?? "";
              const content: string = `${departTime} -> ${arriveTime}: ${event.voyageItem.voyage?.route?.departure_name} - ${event.voyageItem.voyage?.route?.destination_name}`;

              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="flex gap-1"
                      onClick={() => handleOpenBigCalendarEventDialog(event)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            event.voyageItem.voyage?.operator?.operator_logo
                              ?.path
                          }
                        />
                        <AvatarFallback>#</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">{content}</div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bấm để đặt vé</TooltipContent>
                </Tooltip>
              );
            })
          }
        </PopoverContent>
      </Popover>

      {voyageDisplay && (
        <FerryBigCalendarEventDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          voyageItem={voyageDisplay}
        />
      )}
    </>
  );
};

export default memo(FerryBigCalendarShowMore);
